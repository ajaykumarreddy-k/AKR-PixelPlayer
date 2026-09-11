package com.akr.finalapp.data.repository

import com.akr.finalapp.data.model.Song
import com.music.innertube.YouTube
import com.music.innertube.NewPipeExtractor
import com.music.innertube.models.SongItem
import com.music.innertube.models.Artist
import com.music.innertube.models.YouTubeClient
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.launch

@Singleton
class YoutubeRepository @Inject constructor() {

    // ---------------------------------------------------------------------------
    // Signature timestamp cache
    // YoutubeJavaScriptPlayerManager.getSignatureTimestamp() downloads and parses
    // the YouTube JS player file (~300-500ms) and returns the same integer for ALL
    // video IDs within a player version. Cache it for 6 hours — YouTube only rolls
    // a new player a few times per week, so a stale value is automatically retried
    // on the next resolution attempt if deobfuscation fails.
    // ---------------------------------------------------------------------------
    @Volatile private var cachedSignatureTimestamp: Int? = null
    @Volatile private var signatureTimestampFetchedAt: Long = 0L
    private val SIGNATURE_CACHE_TTL_MS = 6 * 60 * 60 * 1000L // 6 hours

    // ---------------------------------------------------------------------------
    // Strategy 1 (NewPipe page scrape) skip-if-failing tracker
    // newPipePlayer() fetches youtube.com/watch?v=... (~500-900ms) and is blocked
    // by YouTube's bot detection frequently. If it has failed in the last 5 minutes
    // skip it entirely and go straight to the faster InnerTube parallel race.
    // ---------------------------------------------------------------------------
    @Volatile private var newPipeLastFailedAt: Long = 0L
    private val NEWPIPE_SKIP_WINDOW_MS = 5 * 60 * 1000L // 5 minutes

    private suspend fun getCachedSignatureTimestamp(videoId: String): Int? {
        val now = System.currentTimeMillis()
        val cached = cachedSignatureTimestamp
        if (cached != null && (now - signatureTimestampFetchedAt) < SIGNATURE_CACHE_TTL_MS) {
            android.util.Log.d("AKR_MUSIC", "⚡ signatureTimestamp CACHE HIT: $cached")
            return cached
        }
        return withContext(Dispatchers.IO) {
            android.util.Log.d("AKR_MUSIC", "🔄 Fetching signatureTimestamp from YouTube JS player...")
            NewPipeExtractor.getSignatureTimestamp(videoId).getOrNull()?.also { ts ->
                cachedSignatureTimestamp = ts
                signatureTimestampFetchedAt = System.currentTimeMillis()
                android.util.Log.d("AKR_MUSIC", "✅ signatureTimestamp fetched and cached: $ts")
            }
        }
    }

    // Call this at app startup to pre-warm the signature timestamp cache.
    // This is fire-and-forget; failure is silently ignored.
    suspend fun preWarmSignatureTimestamp() = withContext(Dispatchers.IO) {
        if (cachedSignatureTimestamp == null) {
            runCatching { getCachedSignatureTimestamp("dQw4w9WgXcQ") } // stable well-known ID
        }
    }

    suspend fun search(query: String, filterType: com.akr.finalapp.data.model.SearchFilterType): Result<Pair<List<com.music.innertube.models.YTItem>, String?>> = withContext(Dispatchers.IO) {
        runCatching {
            if (filterType == com.akr.finalapp.data.model.SearchFilterType.ALL) {
                val result = YouTube.searchSummary(query).getOrThrow()
                val allItems = result.summaries.flatMap { it.items }
                Pair(allItems, null)
            } else {
                val ytFilter = when (filterType) {
                    com.akr.finalapp.data.model.SearchFilterType.SONGS -> YouTube.SearchFilter.FILTER_SONG
                    com.akr.finalapp.data.model.SearchFilterType.ALBUMS -> YouTube.SearchFilter.FILTER_ALBUM
                    com.akr.finalapp.data.model.SearchFilterType.ARTISTS -> YouTube.SearchFilter.FILTER_ARTIST
                    com.akr.finalapp.data.model.SearchFilterType.PLAYLISTS -> YouTube.SearchFilter.FILTER_COMMUNITY_PLAYLIST
                    else -> YouTube.SearchFilter.FILTER_SONG // Fallback
                }
                val result = YouTube.search(query, ytFilter).getOrThrow()
                Pair(result.items, result.continuation)
            }
        }
    }

    suspend fun searchContinuation(continuation: String): Result<Pair<List<com.music.innertube.models.YTItem>, String?>> = withContext(Dispatchers.IO) {
        runCatching {
            val result = YouTube.searchContinuation(continuation).getOrThrow()
            Pair(result.items, result.continuation)
        }
    }

    suspend fun getPlaylist(playlistId: String): Result<Pair<String, List<Song>>> = withContext(Dispatchers.IO) {
        runCatching {
            val page = YouTube.playlist(playlistId).getOrThrow()
            val title = page.playlist.title
            val allSongs = page.songs.toMutableList()
            
            var continuationToken = page.songsContinuation ?: page.continuation
            var pageCount = 0
            val maxPages = 50 // Limit to avoid infinite loops, allows up to 5000 songs
            while (continuationToken != null && pageCount < maxPages) {
                android.util.Log.d("AKR_MUSIC", "Loading playlist page ${pageCount + 1} with token: $continuationToken")
                val continuationPageResult = YouTube.playlistContinuation(continuationToken)
                val continuationPage = continuationPageResult.getOrNull()
                if (continuationPage != null) {
                    allSongs.addAll(continuationPage.songs)
                    continuationToken = continuationPage.continuation
                    pageCount++
                } else {
                    android.util.Log.e("AKR_MUSIC", "Failed to fetch playlist continuation page ${pageCount + 1}", continuationPageResult.exceptionOrNull())
                    break
                }
            }
            
            val songs = allSongs.filterIsInstance<SongItem>().map { it.toSong() }
            Pair(title, songs)
        }
    }

    private val blacklistedVideoIds = java.util.Collections.synchronizedSet(mutableSetOf<String>())

    fun blacklistVideoId(videoId: String) {
        blacklistedVideoIds.add(videoId)
        android.util.Log.w("AKR_MUSIC", "🚫 Blacklisted videoId=$videoId to force Strategy 3 fallback search on retry")
    }

    fun isBlacklisted(videoId: String): Boolean {
        return blacklistedVideoIds.contains(videoId)
    }

    suspend fun resolveStreamUrl(
        videoId: String,
        songTitle: String? = null,
        songArtist: String? = null
    ): Result<String> = resolveStreamUrlInternal(videoId, songTitle, songArtist, isFallback = false)

    private suspend fun resolveStreamUrlInternal(
        videoId: String,
        songTitle: String?,
        songArtist: String?,
        isFallback: Boolean
    ): Result<String> = withContext(Dispatchers.IO) {
        runCatching {
            android.util.Log.d("AKR_MUSIC", "🔍 resolveStreamUrl START: videoId=$videoId, songTitle=$songTitle, songArtist=$songArtist, isFallback=$isFallback")

            var title = songTitle
            var author = songArtist

            // For clean 11-char video IDs we skip the getMediaInfo() validation round-trip.
            // That call (~300-500ms) is only needed when we have no reliable ID (Spotify/search
            // queries) or when the ID was explicitly blacklisted. Direct YouTube playlist/search
            // results already carry the correct videoId — re-validating them adds pure latency.
            val isBlacklisted = isBlacklisted(videoId)
            if (isBlacklisted) {
                android.util.Log.w("AKR_MUSIC", "⚠️ Video ID $videoId is blacklisted.")
            }
            var isVideoIdValid = videoId.length == 11 && !isBlacklisted

            // Only fetch metadata when the title is completely unknown (e.g. youtube:// URI with
            // no song metadata, or a Spotify track whose YT ID we haven't confirmed yet).
            if (title.isNullOrBlank()) {
                if (videoId.startsWith("youtube://")) {
                    title = videoId.removePrefix("youtube://")
                } else if (videoId.length == 11) {
                    try {
                        val mediaInfo = YouTube.getMediaInfo(videoId).getOrNull()
                        title = mediaInfo?.title
                        author = mediaInfo?.author
                    } catch (e: Exception) {
                        android.util.Log.e("AKR_MUSIC", "❌ getMediaInfo failed: ${e.message}")
                    }
                }
            }

            // =========================================================================
            // STRATEGY 1 & 2: Direct Video ID Extraction
            // Strategy 1 (NewPipe page scrape) and signatureTimestamp fetch run IN
            // PARALLEL. If Strategy 1 succeeds first, we return immediately. If it
            // fails, the signature timestamp is already ready for Strategy 2's race.
            // =========================================================================
            if (isVideoIdValid) {
                val now = System.currentTimeMillis()
                val skipNewPipe = (now - newPipeLastFailedAt) < NEWPIPE_SKIP_WINDOW_MS

                if (skipNewPipe) {
                    android.util.Log.d("AKR_MUSIC", "⏭️ Skipping Strategy 1 (NewPipe failed recently at ${newPipeLastFailedAt}ms ago) — going straight to Strategy 2")
                }

                // Launch Strategy 1 (NewPipe) and signatureTimestamp fetch concurrently
                val signatureTimestampDeferred = kotlinx.coroutines.GlobalScope.async(Dispatchers.IO) {
                    getCachedSignatureTimestamp(videoId)
                }

                if (!skipNewPipe) {
                    android.util.Log.d("AKR_MUSIC", "🔄 Strategy 1: Trying NewPipe direct page scrape (parallel with sig timestamp fetch)")
                    val newPipeStreams = try {
                        NewPipeExtractor.newPipePlayer(videoId)
                    } catch (e: Exception) {
                        android.util.Log.e("AKR_MUSIC", "❌ Strategy 1 (NewPipe) exception: ${e.message}")
                        newPipeLastFailedAt = System.currentTimeMillis()
                        emptyList()
                    }

                    android.util.Log.d("AKR_MUSIC", "📡 NewPipe streams count=${newPipeStreams.size}")
                    if (newPipeStreams.isNotEmpty()) {
                        val audioItagPreference = listOf(141, 140, 139, 251, 250, 249)
                        val url = audioItagPreference
                            .firstNotNullOfOrNull { itag -> newPipeStreams.find { it.first == itag }?.second }
                            ?: newPipeStreams.firstOrNull()?.second
                        if (url != null) {
                            signatureTimestampDeferred.cancel()
                            android.util.Log.d("AKR_MUSIC", "✅ Strategy 1 (NewPipe) succeeded for videoId=$videoId")
                            return@runCatching url
                        }
                    }
                    // Strategy 1 failed — mark it and let Strategy 2 proceed with the
                    // signature timestamp that was fetching in parallel
                    newPipeLastFailedAt = System.currentTimeMillis()
                }

                // Strategy 2: Multi-client InnerTube parallel race
                // signatureTimestampDeferred is already running (or done) from the parallel launch above.
                // Await it — if it was already complete this is instant; otherwise we wait the remaining time.
                android.util.Log.d("AKR_MUSIC", "🔄 Strategy 2: Awaiting signatureTimestamp (may already be cached/ready)...")
                val signatureTimestamp = signatureTimestampDeferred.await()
                android.util.Log.d("AKR_MUSIC", "📡 Strategy 2 signatureTimestamp=$signatureTimestamp")

                val clientsToTry = listOf(
                    YouTubeClient.ANDROID_TESTSUITE,
                    YouTubeClient.ANDROID_MUSIC,
                    YouTubeClient.WEB_REMIX,
                    YouTubeClient.TVHTML5_SIMPLY_EMBEDDED_PLAYER,
                    YouTubeClient.ANDROID_VR_1_43_32,
                    YouTubeClient.ANDROID_VR_NO_AUTH,
                    YouTubeClient.ANDROID_VR_1_61_48,
                    YouTubeClient.IOS,
                    YouTubeClient.IPADOS,
                    YouTubeClient.VISIONOS,
                    YouTubeClient.ANDROID_NO_SDK,
                    YouTubeClient.ANDROID_CREATOR
                )

                // Race all clients in parallel; the first successful URL wins and all others
                // are cancelled. We use async + awaitAll so the scope always terminates
                // (even when no client succeeds), and cancel remaining jobs as soon as one wins.
                val parallelResult: String? = try {
                    coroutineScope {
                        val winner = CompletableDeferred<String?>()
                        val pendingCount = java.util.concurrent.atomic.AtomicInteger(clientsToTry.size)

                        val jobs = clientsToTry.map { client ->
                            launch(Dispatchers.IO) {
                                var clientResult: String? = null
                                try {
                                    android.util.Log.d("AKR_MUSIC", "🔄 Strategy 2: Trying client ${client.clientName} (parallel)")
                                    val webResponse = YouTube.player(
                                        videoId,
                                        client = client,
                                        signatureTimestamp = signatureTimestamp
                                    ).getOrThrow()

                                    val status = webResponse.playabilityStatus.status
                                    val formats = webResponse.streamingData?.adaptiveFormats ?: emptyList()
                                    val audioFormats = formats.filter { it.mimeType.startsWith("audio/") }

                                    if (status == "OK" && audioFormats.isNotEmpty()) {
                                        val bestCipherFormat = audioFormats
                                            .filter { it.mimeType.contains("mp4") }
                                            .maxByOrNull { it.bitrate }
                                            ?: audioFormats.maxByOrNull { it.bitrate }

                                        if (bestCipherFormat != null) {
                                            clientResult = NewPipeExtractor.getStreamUrl(bestCipherFormat, videoId)
                                        }
                                    }
                                } catch (e: CancellationException) {
                                    return@launch
                                } catch (e: Exception) {
                                    android.util.Log.e("AKR_MUSIC", "❌ Strategy 2 client ${client.clientName} failed: ${e.message}")
                                }

                                // Signal completion — first non-null result wins
                                if (clientResult != null && !winner.isCompleted) {
                                    android.util.Log.d("AKR_MUSIC", "✅ Strategy 2 (parallel) winner: client=${client.clientName}")
                                    winner.complete(clientResult)
                                } else if (pendingCount.decrementAndGet() == 0 && !winner.isCompleted) {
                                    winner.complete(null)
                                }
                            }
                        }
                        val result = winner.await()
                        jobs.forEach { it.cancel() }
                        result
                    }
                } catch (e: Exception) {
                    android.util.Log.e("AKR_MUSIC", "❌ Strategy 2 parallel race failed: ${e.message}")
                    null
                }

                if (parallelResult != null) {
                    android.util.Log.d("AKR_MUSIC", "✅ Strategy 2 (parallel) succeeded for videoId=$videoId")
                    return@runCatching parallelResult
                }
            } else {
                android.util.Log.d("AKR_MUSIC", "🔄 Skipping Strategy 1 & 2 due to non-11-char videoId or blacklisted ID ($videoId).")
            }

            // =========================================================================
            // STRATEGY 3 & 4: Search & Pick First Strategy (scrapeFirstVideoId & top candidates)
            // Executed for non-11-char queries (e.g. Spotify tracks) or when direct ID extraction fails
            // =========================================================================
            if (!isFallback) {
                android.util.Log.d("AKR_MUSIC", "🔄 Strategy 3 & 4: Search & Pick First for videoId=$videoId (Title='$title', Author='$author')")
                try {
                    if (title.isNullOrBlank() && videoId.startsWith("youtube://")) {
                        title = videoId.removePrefix("youtube://")
                    }
                    if (title.isNullOrBlank() && videoId.length == 11) {
                        try {
                            val mediaInfo = YouTube.getMediaInfo(videoId).getOrNull()
                            title = mediaInfo?.title
                            author = mediaInfo?.author
                        } catch (e: Exception) {
                            android.util.Log.e("AKR_MUSIC", "❌ getMediaInfo failed: ${e.message}")
                        }
                    }

                    android.util.Log.d("AKR_MUSIC", "📡 Metadata for Search & Pick First: title='$title', author='$author'")
                    if (!title.isNullOrBlank()) {
                        val searchQuery = if (!author.isNullOrBlank()) "$author $title" else title

                        // 1. Scraping the first video ID from youtube.com/results
                        android.util.Log.d("AKR_MUSIC", "🔍 Strategy 3a: Scraping youtube.com/results for query: '$searchQuery'...")
                        val scrapedId = withContext(Dispatchers.IO) { scrapeFirstVideoId(searchQuery) }
                        if (scrapedId != null && scrapedId != videoId) {
                            android.util.Log.d("AKR_MUSIC", "🔄 Strategy 3a: Trying scraped videoId=$scrapedId")
                            val url = resolveStreamUrlInternal(scrapedId, title, author, isFallback = true).getOrNull()
                            if (url != null) {
                                android.util.Log.d("AKR_MUSIC", "✅ Strategy 3a (Scraper Search & Pick First) succeeded: resolved stream URL for videoId=$scrapedId")
                                return@runCatching url
                            }
                        }

                        // 2. Fetch search results for both SONG and VIDEO filters
                        android.util.Log.d("AKR_MUSIC", "🔍 Strategy 3b: Fetching SONG search results...")
                        val songResult = YouTube.search(searchQuery, YouTube.SearchFilter.FILTER_SONG).getOrNull()
                        val songItems = songResult?.items?.filterIsInstance<SongItem>() ?: emptyList()

                        android.util.Log.d("AKR_MUSIC", "🔍 Strategy 3b: Fetching VIDEO search results...")
                        val videoResult = YouTube.search(searchQuery, YouTube.SearchFilter.FILTER_VIDEO).getOrNull()
                        val videoItems = videoResult?.items?.filterIsInstance<SongItem>() ?: emptyList()

                        // Pick the first search result from SONG or VIDEO directly
                        android.util.Log.d("AKR_MUSIC", "🔄 Strategy 3b: Trying top search result directly...")
                        val topCandidates = (songItems.take(1) + videoItems.take(1)).distinctBy { it.id }
                        for (candidate in topCandidates) {
                            if (candidate.id != videoId) {
                                android.util.Log.d("AKR_MUSIC", "🔄 Strategy 3b: Trying candidate videoId=${candidate.id} (Title: ${candidate.title}) directly")
                                val url = resolveStreamUrlInternal(candidate.id, candidate.title, candidate.artists.firstOrNull()?.name, isFallback = true).getOrNull()
                                if (url != null) {
                                    android.util.Log.d("AKR_MUSIC", "✅ Strategy 3b (Top Candidate Search & Pick First) succeeded: resolved videoId=${candidate.id}")
                                    return@runCatching url
                                }
                            }
                        }

                        // Fallback: Score all candidates using fuzzy matching
                        android.util.Log.d("AKR_MUSIC", "🔄 Strategy 4: Trying scored candidate matching...")
                        val allCandidates = (songItems + videoItems).distinctBy { it.id }
                        val scoredCandidates = allCandidates.map { candidate ->
                            val score = scoreCandidate(title, author, candidate)
                            android.util.Log.d("AKR_MUSIC", "   - Candidate: videoId=${candidate.id}, title='${candidate.title}', score=$score")
                            Pair(candidate, score)
                        }.filter { it.second > 0.0 }
                        .sortedByDescending { it.second }

                        for ((candidate, score) in scoredCandidates) {
                            if (candidate.id != videoId) {
                                android.util.Log.d("AKR_MUSIC", "🔄 Strategy 4: Trying candidate videoId=${candidate.id} (Title: ${candidate.title}, Score: $score)")
                                val url = resolveStreamUrlInternal(candidate.id, candidate.title, candidate.artists.firstOrNull()?.name, isFallback = true).getOrNull()
                                if (url != null) {
                                    android.util.Log.d("AKR_MUSIC", "✅ Strategy 4 (Scored Candidate Search) succeeded: resolved videoId=${candidate.id}")
                                    return@runCatching url
                                }
                            }
                        }
                    }
                } catch (e: Exception) {
                    android.util.Log.e("AKR_MUSIC", "❌ Strategy 3 & 4 (Search Fallback) failed: ${e.message}")
                }
            }

            throw Exception("Could not resolve stream URL for videoId=$videoId")
        }
    }

    private fun scrapeFirstVideoId(query: String): String? {
        try {
            val encodedQuery = java.net.URLEncoder.encode(query, "UTF-8")
            val url = java.net.URL("https://www.youtube.com/results?search_query=$encodedQuery")
            val connection = url.openConnection() as java.net.HttpURLConnection
            connection.requestMethod = "GET"
            connection.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36")
            connection.connectTimeout = 8000
            connection.readTimeout = 8000
            
            val responseCode = connection.responseCode
            if (responseCode != 200) {
                android.util.Log.e("AKR_MUSIC", "Scrape failed: HTTP response code $responseCode")
                return null
            }
            
            val reader = java.io.BufferedReader(java.io.InputStreamReader(connection.inputStream))
            val sb = java.lang.StringBuilder()
            var line: String?
            while (reader.readLine().also { line = it } != null) {
                sb.append(line)
            }
            reader.close()
            
            val html = sb.toString()
            val regex = """\"videoId\":\"([a-zA-Z0-9_-]{11})\"""".toRegex()
            val match = regex.find(html)
            if (match != null) {
                val videoId = match.groupValues[1]
                android.util.Log.d("AKR_MUSIC", "🔍 Scraped videoId: $videoId using videoId regex")
                return videoId
            }
        } catch (e: Exception) {
            android.util.Log.e("AKR_MUSIC", "Error scraping first videoId: ${e.message}", e)
        }
        return null
    }

    private fun levenshteinDistance(s1: String, s2: String): Int {
        val dp = IntArray(s2.length + 1) { it }
        for (i in 1..s1.length) {
            var prev = dp[0]
            dp[0] = i
            for (j in 1..s2.length) {
                val temp = dp[j]
                if (s1[i - 1] == s2[j - 1]) {
                    dp[j] = prev
                } else {
                    dp[j] = minOf(dp[j - 1], dp[j], prev) + 1
                }
                prev = temp
            }
        }
        return dp[s2.length]
    }

    private fun getTitleSimilarityScore(original: String, candidate: String): Double {
        val origLower = original.lowercase()
        val candLower = candidate.lowercase()
        
        // Filter out remixes/instrumentals/covers/teasers/promos if the original was a clean track
        val filters = listOf("remix", "dj", "mashup", "instrumental", "karaoke", "cover", "reaction", "review", "teaser", "promo", "trailer", "making", "interview", "behind", "shorts")
        for (f in filters) {
            if (candLower.contains(f) && !origLower.contains(f)) {
                return 0.0
            }
        }
        
        val cleanOriginal = normalizeTitle(original)
        val cleanCandidate = normalizeTitle(candidate)
        
        val languages = listOf("hindi", "tamil", "telugu", "kannada", "malayalam", "bengali", "marathi", "punjabi")
        val originalLangs = languages.filter { origLower.contains(it) }
        val candidateLangs = languages.filter { candLower.contains(it) }
        var langPenalty = 0.0
        for (lang in candidateLangs) {
            if (lang !in originalLangs) {
                android.util.Log.d("AKR_MUSIC", "⚠️ Language penalty candidate: '$candidate' (has '$lang', original has not)")
                langPenalty += 0.35
            }
        }
        
        if (cleanOriginal.isBlank() || cleanCandidate.isBlank()) return 0.0
        
        if (cleanOriginal.contains(cleanCandidate) || cleanCandidate.contains(cleanOriginal)) {
            return 1.0
        }
        
        val stopwords = setOf("and", "the", "with", "from", "for", "off", "out", "our")
        val originalWords = cleanOriginal.split(" ").filter { it.isNotBlank() && it !in stopwords }
        val candidateWords = cleanCandidate.split(" ").filter { it.isNotBlank() && it !in stopwords }
        
        if (originalWords.isEmpty() || candidateWords.isEmpty()) return 0.0
        
        var matchedWordsCount = 0
        for (origWord in originalWords) {
            var foundMatch = false
            val origSimp = simplifyPhonetics(origWord)
            for (candWord in candidateWords) {
                val candSimp = simplifyPhonetics(candWord)
                if (origSimp == candSimp || candSimp.contains(origSimp) || origSimp.contains(candSimp)) {
                    foundMatch = true
                    break
                }
                val dist = levenshteinDistance(origSimp, candSimp)
                val maxLen = maxOf(origSimp.length, candSimp.length)
                val similarity = 1.0 - dist.toDouble() / maxLen
                if (similarity >= 0.7 || (maxLen <= 4 && dist <= 1)) {
                    foundMatch = true
                    break
                }
            }
            if (foundMatch) {
                matchedWordsCount++
            }
        }
        
        val wordScore = matchedWordsCount.toDouble() / originalWords.size
        
        // Also compute character-level similarity on space-removed simplified titles
        val origSpaceRemoved = simplifyPhonetics(cleanOriginal.replace(" ", ""))
        val candSpaceRemoved = simplifyPhonetics(cleanCandidate.replace(" ", ""))
        val charDist = levenshteinDistance(origSpaceRemoved, candSpaceRemoved)
        val charMaxLen = maxOf(origSpaceRemoved.length, candSpaceRemoved.length)
        val charScore = if (charMaxLen > 0) 1.0 - charDist.toDouble() / charMaxLen else 0.0
        
        val baseScore = maxOf(wordScore, charScore)
        return maxOf(0.0, baseScore - langPenalty)
    }

    private fun simplifyPhonetics(word: String): String {
        return word.lowercase()
            .replace("sh", "s")
            .replace("dh", "d")
            .replace("th", "t")
            .replace("kh", "k")
            .replace("gh", "g")
            .replace("bh", "b")
            .replace("ph", "p")
            .replace("ee", "i")
            .replace("oo", "u")
            .replace("aa", "a")
            .replace("w", "v")
            .replace("y", "i")
    }

    private fun isArtistSimilar(originalArtist: String?, candidate: SongItem): Boolean {
        if (originalArtist.isNullOrBlank()) return true
        val origLower = originalArtist.lowercase()
        
        val stopwords = setOf("and", "feat", "ft", "featuring", "with", "x", "vs")
        val originalWords = origLower.split(" ", ",", "&")
            .map { it.trim().replace(Regex("[^\\p{L}\\p{N}]+"), "") }
            .filter { it.isNotBlank() && it !in stopwords }
            
        if (originalWords.isEmpty()) return true
        
        // 1. Check in candidate artists metadata
        for (artist in candidate.artists) {
            val candLower = artist.name.lowercase()
            val candWords = candLower.split(" ", ",", "&")
                .map { it.trim().replace(Regex("[^\\p{L}\\p{N}]+"), "") }
                .filter { it.isNotBlank() && it !in stopwords }
                
            val common = originalWords.intersect(candWords.toSet())
            if (common.isNotEmpty()) {
                return true
            }
        }
        
        // 2. Check if artist name exists inside the candidate title (common for channel uploads)
        val titleLower = candidate.title.lowercase()
        for (word in originalWords) {
            if (word.length >= 3 && titleLower.contains(word)) {
                return true
            }
        }
        
        return false
    }

    private fun scoreCandidate(originalTitle: String, originalArtist: String?, candidate: SongItem): Double {
        // Filter out short clips/teasers (< 60 seconds)
        val duration = candidate.duration
        if (duration != null && duration < 60) {
            return 0.0
        }
        
        var score = 0.0
        
        val titleSim = getTitleSimilarityScore(originalTitle, candidate.title)
        if (titleSim < 0.45) {
            return 0.0
        }
        
        score += titleSim * 100.0
        
        val artistSim = isArtistSimilar(originalArtist, candidate)
        if (artistSim) {
            score += 50.0
        }
        
        if (titleSim >= 0.7 && artistSim) {
            score += 50.0
        }
        
        val cleanOrig = normalizeTitle(originalTitle)
        val cleanCand = normalizeTitle(candidate.title)
        if (cleanCand.contains(cleanOrig)) {
            score += 30.0
        }
        
        return score
    }

    private fun normalizeTitle(title: String): String {
        return title.lowercase()
            .replace(Regex("[\\(\\)\\[\\]\\-\\:\\,\\.\\\"\\'\\?\\!\\/\\&]"), " ")
            .replace(Regex("\\b(official|video|audio|lyric|lyrics|from|movie|song|full|hd|4k|lirical|lirik|clean|uncut)\\b"), "")
            .replace(Regex("\\s+"), " ")
            .trim()
    }

    suspend fun getSpotifyPlaylist(playlistId: String): Result<Pair<String, List<Song>>> = withContext(Dispatchers.IO) {
        runCatching {
            android.util.Log.d("AKR_MUSIC", "🟢 Fetching Spotify playlist: $playlistId")

            var playlistName = "Spotify Playlist"
            var playlistCoverUrl: String? = null
            val songsList = mutableListOf<Song>()

            // 1. Obtain Spotify access token (try get_access_token endpoint, fallback to web page scraping)
            var accessToken: String? = null
            try {
                val tokenUrl = java.net.URL("https://open.spotify.com/get_access_token?reason=transport&productType=web_player")
                val tokenConn = tokenUrl.openConnection() as java.net.HttpURLConnection
                tokenConn.requestMethod = "GET"
                tokenConn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
                tokenConn.setRequestProperty("Accept", "application/json")
                tokenConn.setRequestProperty("App-Platform", "WebPlayer")
                tokenConn.connectTimeout = 8000
                tokenConn.readTimeout = 8000

                if (tokenConn.responseCode == 200) {
                    val tokenJsonStr = tokenConn.inputStream.bufferedReader().use { it.readText() }
                    val tokenObj = org.json.JSONObject(tokenJsonStr)
                    accessToken = tokenObj.optString("accessToken", "")
                }
            } catch (e: Exception) {
                android.util.Log.w("AKR_MUSIC", "get_access_token direct request failed: ${e.message}")
            }

            // Fallback token extraction from desktop playlist HTML
            if (accessToken.isNullOrBlank()) {
                try {
                    val pageUrl = java.net.URL("https://open.spotify.com/playlist/$playlistId")
                    val pageConn = pageUrl.openConnection() as java.net.HttpURLConnection
                    pageConn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
                    pageConn.connectTimeout = 8000
                    pageConn.readTimeout = 8000

                    val pageHtml = pageConn.inputStream.bufferedReader().use { it.readText() }
                    val tokenMatch = Regex("""accessToken":"([^"]+)"""").find(pageHtml)
                    if (tokenMatch != null) {
                        accessToken = tokenMatch.groupValues[1]
                    }
                } catch (e: Exception) {
                    android.util.Log.w("AKR_MUSIC", "Playlist HTML token extraction failed: ${e.message}")
                }
            }

            // 2. Fetch tracks using Spotify Web API with pagination (handles 400+ songs)
            if (!accessToken.isNullOrBlank()) {
                try {
                    // Fetch playlist info (title & cover art)
                    val detailsUrl = java.net.URL("https://api.spotify.com/v1/playlists/$playlistId?fields=name,images,tracks.total")
                    val detailsConn = detailsUrl.openConnection() as java.net.HttpURLConnection
                    detailsConn.setRequestProperty("Authorization", "Bearer $accessToken")
                    detailsConn.setRequestProperty("User-Agent", "Mozilla/5.0")
                    detailsConn.connectTimeout = 8000
                    detailsConn.readTimeout = 8000

                    if (detailsConn.responseCode == 200) {
                        val detailsObj = org.json.JSONObject(detailsConn.inputStream.bufferedReader().use { it.readText() })
                        playlistName = detailsObj.optString("name", "Spotify Playlist")
                        val imagesArr = detailsObj.optJSONArray("images")
                        if (imagesArr != null && imagesArr.length() > 0) {
                            playlistCoverUrl = imagesArr.optJSONObject(0)?.optString("url")
                        }

                        val totalTracks = detailsObj.optJSONObject("tracks")?.optInt("total", 0) ?: 0
                        android.util.Log.d("AKR_MUSIC", "📊 Playlist '$playlistName' has $totalTracks total tracks")

                        var offset = 0
                        while (offset < totalTracks) {
                            val tracksUrl = java.net.URL("https://api.spotify.com/v1/playlists/$playlistId/tracks?offset=$offset&limit=100")
                            val tracksConn = tracksUrl.openConnection() as java.net.HttpURLConnection
                            tracksConn.setRequestProperty("Authorization", "Bearer $accessToken")
                            tracksConn.setRequestProperty("User-Agent", "Mozilla/5.0")
                            tracksConn.connectTimeout = 8000
                            tracksConn.readTimeout = 8000

                            if (tracksConn.responseCode == 200) {
                                val tracksObj = org.json.JSONObject(tracksConn.inputStream.bufferedReader().use { it.readText() })
                                val itemsArr = tracksObj.optJSONArray("items") ?: break
                                if (itemsArr.length() == 0) break

                                for (i in 0 until itemsArr.length()) {
                                    val itemObj = itemsArr.optJSONObject(i) ?: continue
                                    val trackObj = itemObj.optJSONObject("track") ?: continue
                                    val trackTitle = trackObj.optString("name", "")
                                    if (trackTitle.isBlank()) continue

                                    val artistsArr = trackObj.optJSONArray("artists")
                                    val artistList = mutableListOf<String>()
                                    if (artistsArr != null) {
                                        for (a in 0 until artistsArr.length()) {
                                            val aName = artistsArr.optJSONObject(a)?.optString("name")
                                            if (!aName.isNullOrBlank()) artistList.add(aName)
                                        }
                                    }
                                    val trackArtist = if (artistList.isNotEmpty()) artistList.joinToString(", ") else "Unknown Artist"

                                    // Extract unique track thumbnail / album cover
                                    val albumObj = trackObj.optJSONObject("album")
                                    val albumImages = albumObj?.optJSONArray("images")
                                    val trackArtUrl = if (albumImages != null && albumImages.length() > 0) {
                                        albumImages.optJSONObject(0)?.optString("url")
                                    } else {
                                        playlistCoverUrl
                                    }

                                    val trackId = trackObj.optString("id", "spotify_${playlistId}_${offset + i}")
                                    val durationMs = trackObj.optLong("duration_ms", 180000L)

                                    songsList.add(
                                        Song(
                                            id = trackId,
                                            title = trackTitle,
                                            artist = trackArtist,
                                            artistId = 0L,
                                            album = albumObj?.optString("name", playlistName) ?: playlistName,
                                            albumId = 0L,
                                            path = "",
                                            contentUriString = "youtube://$trackArtist $trackTitle",
                                            albumArtUriString = trackArtUrl ?: playlistCoverUrl,
                                            duration = durationMs,
                                            mimeType = "audio/youtube",
                                            bitrate = null,
                                            sampleRate = null,
                                            dateModified = System.currentTimeMillis() / 1000L,
                                            dateAdded = System.currentTimeMillis() / 1000L
                                        )
                                    )
                                }
                                offset += itemsArr.length()
                            } else {
                                break
                            }
                        }
                    }
                } catch (e: Exception) {
                    android.util.Log.w("AKR_MUSIC", "Spotify Web API pagination error: ${e.message}")
                }
            }

            // 3. Fallback to Embed HTML scraper if Web API produced no tracks
            if (songsList.isEmpty()) {
                val url = java.net.URL("https://open.spotify.com/embed/playlist/$playlistId")
                val connection = url.openConnection() as java.net.HttpURLConnection
                connection.requestMethod = "GET"
                connection.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
                connection.connectTimeout = 10000
                connection.readTimeout = 10000

                val html = connection.inputStream.bufferedReader().use { it.readText() }

                val jsonMatch = Regex("""<script id="__NEXT_DATA__" type="application/json">(.*?)</script>""").find(html)
                if (jsonMatch != null) {
                    val jsonStr = jsonMatch.groupValues[1]
                    val jsonObject = org.json.JSONObject(jsonStr)
                    val entity = jsonObject.optJSONObject("props")
                        ?.optJSONObject("pageProps")
                        ?.optJSONObject("state")
                        ?.optJSONObject("data")
                        ?.optJSONObject("entity")

                    if (entity != null) {
                        playlistName = entity.optString("name", "Spotify Playlist")
                        val coverSources = entity.optJSONObject("coverArt")?.optJSONArray("sources")
                        if (coverSources != null && coverSources.length() > 0) {
                            playlistCoverUrl = coverSources.optJSONObject(0)?.optString("url")
                        }

                        val trackList = entity.optJSONArray("trackList")
                        if (trackList != null) {
                            for (i in 0 until trackList.length()) {
                                val trackObj = trackList.optJSONObject(i) ?: continue
                                val trackTitle = trackObj.optString("title", trackObj.optString("name", ""))
                                val trackArtist = trackObj.optString("subtitle", trackObj.optString("artists", "Unknown Artist"))
                                val duration = trackObj.optLong("duration", 180000L)

                                val albumImages = trackObj.optJSONObject("album")?.optJSONArray("images")
                                val trackArt = if (albumImages != null && albumImages.length() > 0) {
                                    albumImages.optJSONObject(0)?.optString("url")
                                } else {
                                    trackObj.optString("coverArt", trackObj.optString("thumbnail", "")).ifBlank { playlistCoverUrl }
                                }

                                if (trackTitle.isNotBlank()) {
                                    val rawUri = trackObj.optString("uri", "")
                                    val trackId = if (rawUri.startsWith("spotify:track:")) rawUri.removePrefix("spotify:track:") else "spotify_${playlistId}_$i"
                                    songsList.add(
                                        Song(
                                            id = trackId,
                                            title = trackTitle,
                                            artist = trackArtist,
                                            artistId = 0L,
                                            album = playlistName,
                                            albumId = 0L,
                                            path = "",
                                            contentUriString = "youtube://$trackArtist $trackTitle",
                                            albumArtUriString = if (!trackArt.isNullOrBlank()) trackArt else playlistCoverUrl,
                                            duration = duration,
                                            mimeType = "audio/youtube",
                                            bitrate = null,
                                            sampleRate = null,
                                            dateModified = System.currentTimeMillis() / 1000L,
                                            dateAdded = System.currentTimeMillis() / 1000L
                                        )
                                    )
                                }
                            }
                        }
                    }
                }
            }

            if (songsList.isEmpty()) {
                throw Exception("Could not parse tracks from Spotify playlist link.")
            }

            android.util.Log.d("AKR_MUSIC", "✅ Parsed Spotify playlist '$playlistName' with ${songsList.size} tracks")
            Pair(playlistName, songsList)
        }
    }
}

fun com.music.innertube.models.SongItem.toSong() = com.akr.finalapp.data.model.Song(
    id = id,
    title = title,
    artist = artists.firstOrNull()?.name ?: "Unknown Artist",
    artistId = 0L,
    album = album?.name ?: "YouTube",
    albumId = 0L,
    path = "",
    contentUriString = "youtube://$id",
    albumArtUriString = thumbnail,
    duration = (duration ?: 0) * 1000L,
    mimeType = "audio/youtube",
    bitrate = null,
    sampleRate = null,
    dateModified = System.currentTimeMillis() / 1000L,
    dateAdded = System.currentTimeMillis() / 1000L
)
