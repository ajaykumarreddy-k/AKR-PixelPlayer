package com.akr.finalapp.presentation.viewmodel

import com.akr.finalapp.data.DailyMixManager
import com.akr.finalapp.data.model.Song
import com.akr.finalapp.data.preferences.UserPreferencesRepository
import com.akr.finalapp.data.repository.MusicRepository
import com.akr.finalapp.data.repository.YoutubeRepository
import kotlinx.collections.immutable.ImmutableList
import kotlinx.collections.immutable.persistentListOf
import kotlinx.collections.immutable.toImmutableList
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.withContext
import java.util.Calendar
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Manages Daily Mix and Your Mix state.
 * Extracted from PlayerViewModel to improve modularity.
 *
 * Responsibilities:
 * - Generate and update daily/your mixes
 * - Persist and restore mix state
 * - Check if mix needs updating based on day change
 */
@Singleton
class DailyMixStateHolder @Inject constructor(
    private val dailyMixManager: DailyMixManager,
    private val userPreferencesRepository: UserPreferencesRepository,
    private val musicRepository: MusicRepository,
    private val youtubeRepository: YoutubeRepository
) {
    private var scope: CoroutineScope? = null
    private var updateJob: Job? = null

    private val _dailyMixSongs = MutableStateFlow<ImmutableList<Song>>(persistentListOf())
    val dailyMixSongs: StateFlow<ImmutableList<Song>> = _dailyMixSongs.asStateFlow()

    private val _yourMixSongs = MutableStateFlow<ImmutableList<Song>>(persistentListOf())
    val yourMixSongs: StateFlow<ImmutableList<Song>> = _yourMixSongs.asStateFlow()

    /**
     * Attach a CoroutineScope (typically PlayerViewModel's viewModelScope).
     */
    fun initialize(coroutineScope: CoroutineScope) {
        this.scope = coroutineScope
    }

    fun attachScope(coroutineScope: CoroutineScope) {
        this.scope = coroutineScope
    }

    /**
     * Generate or update the daily mix and your mix.
     */
    fun updateDailyMix(favoriteSongIdsFlow: kotlinx.coroutines.flow.Flow<Set<String>>) {
        updateJob?.cancel()
        updateJob = scope?.launch(Dispatchers.IO) {
            val allSongs = musicRepository.getAllSongsOnce()
            val favoriteIds = favoriteSongIdsFlow.first()
            val savedPlaylists = userPreferencesRepository.savedYoutubePlaylistsFlow.first()

            // 1. Gather songs from saved playlists
            val playlistSongs = mutableListOf<Song>()
            if (savedPlaylists.isNotEmpty()) {
                for (p in savedPlaylists) {
                    val res = if (p.id.startsWith("spotify_")) {
                        youtubeRepository.getSpotifyPlaylist(p.id.removePrefix("spotify_")).getOrNull()
                    } else {
                        youtubeRepository.getPlaylist(p.id).getOrNull()
                    }
                    if (res != null && res.second.isNotEmpty()) {
                        playlistSongs.addAll(res.second)
                    }
                }
            }

            // 2. Fetch trending songs if online
            val trendingSongs = try {
                youtubeRepository.searchSongs("Top songs of the day").getOrDefault(emptyList())
            } catch (e: Exception) {
                emptyList()
            }

            // 3. User Rule for "Your Mix":
            // - No playlists added -> pick from trending
            // - Playlists added, no trending -> pick from playlists
            // - Both exist -> mix from BOTH!
            val yourMixResult: List<Song> = when {
                playlistSongs.isEmpty() && trendingSongs.isNotEmpty() -> {
                    trendingSongs.shuffled().take(60)
                }
                playlistSongs.isNotEmpty() && trendingSongs.isEmpty() -> {
                    playlistSongs.shuffled().take(60)
                }
                playlistSongs.isNotEmpty() && trendingSongs.isNotEmpty() -> {
                    val combined = mutableListOf<Song>()
                    val pIter = playlistSongs.shuffled().iterator()
                    val tIter = trendingSongs.shuffled().iterator()
                    while ((pIter.hasNext() || tIter.hasNext()) && combined.size < 60) {
                        if (pIter.hasNext()) combined.add(pIter.next())
                        if (tIter.hasNext() && combined.size < 60) combined.add(tIter.next())
                    }
                    combined
                }
                else -> {
                    if (allSongs.isNotEmpty()) {
                        dailyMixManager.generateYourMix(allSongs, favoriteIds)
                    } else {
                        emptyList()
                    }
                }
            }

            _yourMixSongs.value = yourMixResult.toImmutableList()
            userPreferencesRepository.saveYourMixSongIds(yourMixResult.map { it.id })

            val baseForDailyMix = if (allSongs.isNotEmpty()) allSongs else yourMixResult
            if (baseForDailyMix.isNotEmpty()) {
                val mix = dailyMixManager.generateDailyMix(baseForDailyMix, favoriteIds)
                _dailyMixSongs.value = mix.toImmutableList()
                userPreferencesRepository.saveDailyMixSongIds(mix.map { it.id })
            }
        }
    }

    /**
     * Remove a song from the daily mix.
     */
    fun removeFromDailyMix(songId: String) {
        _dailyMixSongs.update { currentList ->
            currentList.filterNot { it.id == songId }.toImmutableList()
        }
    }

    /**
     * Load persisted daily mix from storage using direct DB queries by IDs
     * instead of combining with the full allSongs flow.
     */
    fun loadPersistedDailyMix() {
        // Load Daily Mix
        scope?.launch {
            val dailyMixIds = userPreferencesRepository.dailyMixSongIdsFlow.first()
            if (dailyMixIds.isNotEmpty() && _dailyMixSongs.value.isEmpty()) {
                val songs = withContext(Dispatchers.IO) {
                    musicRepository.getSongsByIds(dailyMixIds).first()
                }
                if (songs.isNotEmpty()) {
                    // Maintain persisted order
                    val songMap = songs.associateBy { it.id }
                    val orderedSongs = dailyMixIds.mapNotNull { songMap[it] }
                    _dailyMixSongs.value = orderedSongs.toImmutableList()
                }
            }
        }

        // Load Your Mix
        scope?.launch {
            val yourMixIds = userPreferencesRepository.yourMixSongIdsFlow.first()
            if (yourMixIds.isNotEmpty() && _yourMixSongs.value.isEmpty()) {
                val songs = withContext(Dispatchers.IO) {
                    musicRepository.getSongsByIds(yourMixIds).first()
                }
                if (songs.isNotEmpty()) {
                    val songMap = songs.associateBy { it.id }
                    val orderedSongs = yourMixIds.mapNotNull { songMap[it] }
                    _yourMixSongs.value = orderedSongs.toImmutableList()
                }
            }
        }
    }

    /**
     * Force update the daily mix regardless of day.
     */
    fun forceUpdate(favoriteSongIdsFlow: kotlinx.coroutines.flow.Flow<Set<String>>) {
        scope?.launch {
            updateDailyMix(favoriteSongIdsFlow)
            userPreferencesRepository.saveLastDailyMixUpdateTimestamp(System.currentTimeMillis())
        }
    }

    /**
     * Check if daily mix needs updating (new day) and update if so.
     */
    fun checkAndUpdateIfNeeded(favoriteSongIdsFlow: kotlinx.coroutines.flow.Flow<Set<String>>) {
        scope?.launch {
            val lastUpdate = userPreferencesRepository.lastDailyMixUpdateFlow.first()
            val today = Calendar.getInstance().get(Calendar.DAY_OF_YEAR)
            val lastUpdateDay = Calendar.getInstance().apply {
                timeInMillis = lastUpdate
            }.get(Calendar.DAY_OF_YEAR)

            if (today != lastUpdateDay) {
                updateDailyMix(favoriteSongIdsFlow)
                userPreferencesRepository.saveLastDailyMixUpdateTimestamp(System.currentTimeMillis())
            }
        }
    }

    /**
     * Set the daily mix songs directly (used for AI-generated mixes).
     */
    fun setDailyMixSongs(songs: List<Song>) {
        _dailyMixSongs.value = songs.toImmutableList()
        scope?.launch {
            userPreferencesRepository.saveDailyMixSongIds(songs.map { it.id })
        }
    }

    /**
     * Get a candidate pool for AI playlist generation.
     */
    suspend fun getCandidatePool(
        allSongs: List<Song>,
        favoriteIds: Set<String>,
        maxSize: Int = 100
    ): List<Song> {
        return dailyMixManager.generateDailyMix(allSongs, favoriteIds, maxSize)
    }

    fun onCleared() {
        updateJob?.cancel()
        scope = null
    }
}
