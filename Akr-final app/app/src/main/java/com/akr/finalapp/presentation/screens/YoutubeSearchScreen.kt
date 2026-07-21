package com.akr.finalapp.presentation.screens

import android.widget.Toast
import android.util.Log
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material.icons.rounded.Search
import androidx.compose.material.icons.rounded.PlaylistPlay
import androidx.compose.material.icons.rounded.Delete
import androidx.compose.material.icons.rounded.AddCircle
import androidx.compose.material.icons.rounded.TrendingUp
import androidx.compose.foundation.clickable
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavController
import com.akr.finalapp.presentation.components.MiniPlayerHeight
import com.akr.finalapp.presentation.viewmodel.PlayerViewModel
import com.akr.finalapp.presentation.viewmodel.YoutubeViewModel
import com.akr.finalapp.presentation.components.subcomps.EnhancedSongListItem

private data class DailyGenreTile(
    val genreName: String,
    val searchQuery: String,
    val color1: Color,
    val color2: Color
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun YoutubeSearchScreen(
    paddingValues: PaddingValues,
    navController: NavController,
    youtubeViewModel: YoutubeViewModel = hiltViewModel(),
    playerViewModel: PlayerViewModel = hiltViewModel(),
    initialQuery: String? = null
) {
    val context = LocalContext.current
    val searchQuery by youtubeViewModel.searchQuery.collectAsStateWithLifecycle()
    val searchResults by youtubeViewModel.searchResults.collectAsStateWithLifecycle()
    val isSearching by youtubeViewModel.isSearching.collectAsStateWithLifecycle()
    val errorMessage by youtubeViewModel.errorMessage.collectAsStateWithLifecycle()
    val stablePlayerState by playerViewModel.stablePlayerState.collectAsStateWithLifecycle()
    val savedPlaylists by youtubeViewModel.savedPlaylists.collectAsStateWithLifecycle()
    val genres by playerViewModel.genres.collectAsStateWithLifecycle()
    val keyboardController = LocalSoftwareKeyboardController.current
    val focusRequester = remember { FocusRequester() }

    val dailyGenreTiles = remember {
        listOf(
            DailyGenreTile("Pop Hits", "Top Pop songs today", Color(0xFFE91E63), Color(0xFFF48FB1)),
            DailyGenreTile("Hip-Hop & Rap", "Top Hip Hop songs today", Color(0xFFFF9800), Color(0xFFFFCC80)),
            DailyGenreTile("Rock & Alt", "Top Rock songs today", Color(0xFF9C27B0), Color(0xFFCE93D8)),
            DailyGenreTile("Electronic / EDM", "Top Electronic songs today", Color(0xFF00BCD4), Color(0xFF80DEEA)),
            DailyGenreTile("R&B & Soul", "Top R&B songs today", Color(0xFF3F51B5), Color(0xFF9FA8DA)),
            DailyGenreTile("Bollywood Hits", "Top Bollywood songs today", Color(0xFFF44336), Color(0xFFEF9A9A)),
            DailyGenreTile("Indie & Acoustic", "Top Indie songs today", Color(0xFF4CAF50), Color(0xFFA5D6A7)),
            DailyGenreTile("Classical & Focus", "Top Instrumental songs today", Color(0xFF607D8B), Color(0xFFB0BEC5))
        )
    }

    LaunchedEffect(initialQuery) {
        if (initialQuery != null && initialQuery.isNotBlank() && searchQuery != initialQuery) {
            youtubeViewModel.updateSearchQuery(initialQuery)
            youtubeViewModel.search()
        }
    }

    var showPlaylistDialog by remember { mutableStateOf(false) }
    var playlistUrlInput by remember { mutableStateOf("") }
    var playlistUrlError by remember { mutableStateOf(false) }

    Box(modifier = Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background)) {
        Column(modifier = Modifier.fillMaxSize()) {
            Row(
                modifier = Modifier.fillMaxWidth().padding(
                    start = 24.dp, 
                    top = paddingValues.calculateTopPadding() + 24.dp, 
                    end = 24.dp
                ),
                verticalAlignment = Alignment.CenterVertically
            ) {
                val inputColors = SearchBarDefaults.inputFieldColors(
                    focusedTextColor = MaterialTheme.colorScheme.onSurface,
                    unfocusedTextColor = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f),
                    focusedContainerColor = Color.Transparent,
                    unfocusedContainerColor = Color.Transparent,
                    cursorColor = MaterialTheme.colorScheme.primary
                )

                Box(Modifier.weight(1f)) {
                    DockedSearchBar(
                        inputField = {
                            SearchBarDefaults.InputField(
                                modifier = Modifier.focusRequester(focusRequester),
                                query = searchQuery,
                                onQueryChange = { youtubeViewModel.updateSearchQuery(it) },
                                onSearch = { youtubeViewModel.search(); keyboardController?.hide() },
                                expanded = false,
                                onExpandedChange = {},
                                placeholder = { Text("Search YouTube Music", color = MaterialTheme.colorScheme.primary) },
                                leadingIcon = { Icon(Icons.Rounded.Search, null, tint = MaterialTheme.colorScheme.primary) },
                                trailingIcon = {
                                    if (searchQuery.isNotBlank()) {
                                        IconButton(
                                            onClick = { youtubeViewModel.clearResults() },
                                            modifier = Modifier.size(48.dp).clip(CircleShape).background(MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.2f))
                                        ) { Icon(Icons.Rounded.Close, null, tint = MaterialTheme.colorScheme.primary) }
                                    }
                                },
                                colors = inputColors
                            )
                        },
                        expanded = false,
                        onExpandedChange = {},
                        modifier = Modifier.clip(RoundedCornerShape(28.dp)),
                        colors = SearchBarDefaults.colors(
                            containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.3f),
                            dividerColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.2f),
                            inputFieldColors = inputColors
                        ),
                        content = {}
                    )
                }
                
                IconButton(onClick = { showPlaylistDialog = true }) {
                    Icon(
                        imageVector = Icons.Rounded.PlaylistPlay,
                        contentDescription = "Open Playlist",
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
            }
            Spacer(modifier = Modifier.height(16.dp))

            Box(modifier = Modifier.fillMaxSize()) {
                when {
                    isSearching -> CircularProgressIndicator(Modifier.align(Alignment.Center), color = MaterialTheme.colorScheme.primary)
                    !errorMessage.isNullOrEmpty() -> Text(errorMessage ?: "", color = MaterialTheme.colorScheme.error, modifier = Modifier.align(Alignment.Center).padding(16.dp), textAlign = TextAlign.Center)
                    searchResults.isEmpty() -> {
                        LazyColumn(
                            modifier = Modifier.fillMaxSize(),
                            contentPadding = PaddingValues(
                                top = 8.dp,
                                bottom = paddingValues.calculateBottomPadding() + MiniPlayerHeight + 24.dp,
                                start = 16.dp,
                                end = 16.dp
                            ),
                            verticalArrangement = Arrangement.spacedBy(18.dp)
                        ) {
                            // Quick Action Row: Add Playlist Tile & Top Songs Today Tile
                            item {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                                ) {
                                    // "+ Add Playlist" Tile
                                    Card(
                                        modifier = Modifier
                                            .weight(1f)
                                            .height(100.dp)
                                            .clip(RoundedCornerShape(20.dp))
                                            .clickable { showPlaylistDialog = true },
                                        shape = RoundedCornerShape(20.dp),
                                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .fillMaxSize()
                                                .padding(14.dp)
                                        ) {
                                            Icon(
                                                imageVector = Icons.Rounded.AddCircle,
                                                contentDescription = null,
                                                modifier = Modifier
                                                    .size(64.dp)
                                                    .align(Alignment.BottomEnd)
                                                    .offset(x = 10.dp, y = 10.dp)
                                                    .alpha(0.2f),
                                                tint = MaterialTheme.colorScheme.onPrimaryContainer
                                            )
                                            Column(
                                                modifier = Modifier.fillMaxSize(),
                                                verticalArrangement = Arrangement.SpaceBetween
                                            ) {
                                                Icon(
                                                    imageVector = Icons.Rounded.AddCircle,
                                                    contentDescription = "Add Playlist",
                                                    tint = MaterialTheme.colorScheme.primary,
                                                    modifier = Modifier.size(28.dp)
                                                )
                                                Column {
                                                    Text(
                                                        text = "Add Playlist",
                                                        style = MaterialTheme.typography.titleMedium,
                                                        fontWeight = FontWeight.Bold,
                                                        color = MaterialTheme.colorScheme.onPrimaryContainer
                                                    )
                                                    Text(
                                                        text = "Import YT / Spotify Playlist",
                                                        style = MaterialTheme.typography.bodySmall,
                                                        color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.7f)
                                                    )
                                                }
                                            }
                                        }
                                    }

                                    // "Top Songs Today" Tile
                                    Card(
                                        modifier = Modifier
                                            .weight(1f)
                                            .height(100.dp)
                                            .clip(RoundedCornerShape(20.dp))
                                            .clickable {
                                                youtubeViewModel.updateSearchQuery("Top songs of the day")
                                                youtubeViewModel.search()
                                            },
                                        shape = RoundedCornerShape(20.dp),
                                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.tertiaryContainer)
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .fillMaxSize()
                                                .padding(14.dp)
                                        ) {
                                            Icon(
                                                imageVector = Icons.Rounded.TrendingUp,
                                                contentDescription = null,
                                                modifier = Modifier
                                                    .size(64.dp)
                                                    .align(Alignment.BottomEnd)
                                                    .offset(x = 10.dp, y = 10.dp)
                                                    .alpha(0.2f),
                                                tint = MaterialTheme.colorScheme.onTertiaryContainer
                                            )
                                            Column(
                                                modifier = Modifier.fillMaxSize(),
                                                verticalArrangement = Arrangement.SpaceBetween
                                            ) {
                                                Icon(
                                                    imageVector = Icons.Rounded.TrendingUp,
                                                    contentDescription = "Trending Hits",
                                                    tint = MaterialTheme.colorScheme.tertiary,
                                                    modifier = Modifier.size(28.dp)
                                                )
                                                Column {
                                                    Text(
                                                        text = "Top Songs Today",
                                                        style = MaterialTheme.typography.titleMedium,
                                                        fontWeight = FontWeight.Bold,
                                                        color = MaterialTheme.colorScheme.onTertiaryContainer
                                                    )
                                                    Text(
                                                        text = "Daily Global Hits",
                                                        style = MaterialTheme.typography.bodySmall,
                                                        color = MaterialTheme.colorScheme.onTertiaryContainer.copy(alpha = 0.7f)
                                                    )
                                                }
                                            }
                                        }
                                    }
                                }
                            }

                            // Section: Top Songs of the Day by Genre
                            item {
                                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                                    Text(
                                        text = "Top Songs of the Day by Genre",
                                        style = MaterialTheme.typography.titleLarge,
                                        fontWeight = FontWeight.Bold,
                                        color = MaterialTheme.colorScheme.onBackground
                                    )

                                    dailyGenreTiles.chunked(2).forEach { rowTiles ->
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                                        ) {
                                            rowTiles.forEach { tile ->
                                                Box(
                                                    modifier = Modifier
                                                        .weight(1f)
                                                        .height(84.dp)
                                                        .clip(RoundedCornerShape(18.dp))
                                                        .background(Brush.horizontalGradient(listOf(tile.color1, tile.color2)))
                                                        .clickable {
                                                            youtubeViewModel.updateSearchQuery(tile.searchQuery)
                                                            youtubeViewModel.search()
                                                        }
                                                        .padding(14.dp)
                                                ) {
                                                    Text(
                                                        text = tile.genreName,
                                                        style = MaterialTheme.typography.titleMedium,
                                                        fontWeight = FontWeight.Bold,
                                                        color = Color.White,
                                                        modifier = Modifier.align(Alignment.BottomStart)
                                                    )
                                                }
                                            }
                                            if (rowTiles.size == 1) {
                                                Spacer(modifier = Modifier.weight(1f))
                                            }
                                        }
                                    }
                                }
                            }

                            // Section: Saved Playlists (if any)
                            if (savedPlaylists.isNotEmpty()) {
                                item {
                                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                        Text(
                                            text = "Saved Playlists",
                                            style = MaterialTheme.typography.titleLarge,
                                            fontWeight = FontWeight.Bold,
                                            color = MaterialTheme.colorScheme.onBackground
                                        )
                                        savedPlaylists.forEach { playlist ->
                                            Card(
                                                modifier = Modifier
                                                    .fillMaxWidth()
                                                    .padding(vertical = 4.dp)
                                                    .clip(RoundedCornerShape(16.dp))
                                                    .clickable {
                                                        navController.navigate("youtube_playlist/${playlist.id}")
                                                    },
                                                shape = RoundedCornerShape(16.dp),
                                                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainerHigh)
                                            ) {
                                                Row(
                                                    modifier = Modifier
                                                        .fillMaxWidth()
                                                        .padding(14.dp),
                                                    horizontalArrangement = Arrangement.SpaceBetween,
                                                    verticalAlignment = Alignment.CenterVertically
                                                ) {
                                                    Column(modifier = Modifier.weight(1f)) {
                                                        Text(
                                                            text = playlist.name,
                                                            style = MaterialTheme.typography.titleMedium,
                                                            fontWeight = FontWeight.Bold,
                                                            maxLines = 1,
                                                            overflow = TextOverflow.Ellipsis
                                                        )
                                                        Text(
                                                            text = if (playlist.id.startsWith("spotify_")) "Spotify Playlist" else "YouTube Playlist",
                                                            style = MaterialTheme.typography.bodySmall,
                                                            color = MaterialTheme.colorScheme.onSurfaceVariant
                                                        )
                                                    }
                                                    IconButton(
                                                        onClick = { youtubeViewModel.removeSavedPlaylist(playlist.id) }
                                                    ) {
                                                        Icon(
                                                            imageVector = Icons.Rounded.Delete,
                                                            contentDescription = "Delete Playlist",
                                                            tint = MaterialTheme.colorScheme.error
                                                        )
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }

                            // Section: Browse by Genre
                            item {
                                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                                    Text(
                                        text = "Browse Music Genres",
                                        style = MaterialTheme.typography.titleLarge,
                                        fontWeight = FontWeight.Bold,
                                        color = MaterialTheme.colorScheme.onBackground
                                    )
                                    com.akr.finalapp.presentation.screens.search.components.GenreCategoriesGrid(
                                        genres = genres,
                                        onGenreClick = { genre ->
                                            youtubeViewModel.updateSearchQuery("Top ${genre.name} songs today")
                                            youtubeViewModel.search()
                                        },
                                        onYoutubeSearchClick = {},
                                        playerViewModel = playerViewModel,
                                        modifier = Modifier.height(420.dp)
                                    )
                                }
                            }
                        }
                    }
                    else -> LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(top = 8.dp, bottom = paddingValues.calculateBottomPadding() + MiniPlayerHeight + 16.dp, start = 16.dp, end = 16.dp)
                    ) {
                        items(searchResults) { song ->
                            Box(modifier = Modifier.padding(bottom = 12.dp)) {
                                EnhancedSongListItem(
                                    song = song,
                                    isPlaying = stablePlayerState.isPlaying && stablePlayerState.currentSong?.id == song.id,
                                    isCurrentSong = stablePlayerState.currentSong?.id == song.id,
                                    onClick = {
                                        // 1. Force an Error-level log that Realme cannot block
                                        Log.e("AKR_MUSIC", "👉 EXACT TAP DETECTED: ${song.title}")
                                        
                                        // 2. Force an immediate screen popup so we know the button isn't dead
                                        Toast.makeText(context, "Connecting to YouTube...", Toast.LENGTH_SHORT).show()
                                        
                                        youtubeViewModel.resolveStreamUrl(song,
                                            onResolved = { url ->
                                                Log.e("AKR_MUSIC", "✅ URL FOUND: $url")
                                                val updatedQueue = searchResults.map { s ->
                                                    if (s.id == song.id) s.copy(contentUriString = url) else s
                                                }
                                                playerViewModel.playSongs(updatedQueue, song.copy(contentUriString = url), "YouTube Search", null)
                                            },
                                            onError = { err ->
                                                Log.e("AKR_MUSIC", "❌ STREAM ERROR: $err")
                                                Toast.makeText(context, "Error: $err", Toast.LENGTH_LONG).show()
                                            }
                                        )
                                    },
                                    onMoreOptionsClick = {}
                                )
                            }
                        }
                    }
                }
            }
        }
        
        if (showPlaylistDialog) {
            AlertDialog(
                onDismissRequest = { showPlaylistDialog = false; playlistUrlError = false },
                title = { Text("Add Spotify and YT Playlists") },
                text = {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp)
                    ) {
                        OutlinedTextField(
                            value = playlistUrlInput,
                            onValueChange = { playlistUrlInput = it; playlistUrlError = false },
                            label = { Text("Paste YouTube or Spotify playlist URL") },
                            isError = playlistUrlError,
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )
                        if (playlistUrlError) {
                            Text(
                                text = "Invalid URL or ID",
                                color = MaterialTheme.colorScheme.error,
                                style = MaterialTheme.typography.bodySmall,
                                modifier = Modifier.padding(top = 4.dp)
                            )
                        }
                        
                        if (savedPlaylists.isNotEmpty()) {
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                text = "Saved Playlists",
                                style = MaterialTheme.typography.titleSmall,
                                color = MaterialTheme.colorScheme.primary
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            LazyColumn(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .heightIn(max = 200.dp)
                            ) {
                                items(savedPlaylists) { playlist ->
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clip(RoundedCornerShape(8.dp))
                                            .clickable {
                                                showPlaylistDialog = false
                                                playlistUrlInput = ""
                                                navController.navigate("youtube_playlist/${playlist.id}")
                                            }
                                            .padding(vertical = 8.dp, horizontal = 4.dp),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Column(modifier = Modifier.weight(1f)) {
                                            Text(
                                                text = playlist.name,
                                                style = MaterialTheme.typography.bodyMedium,
                                                maxLines = 1,
                                                overflow = TextOverflow.Ellipsis
                                            )
                                            Text(
                                                text = playlist.id,
                                                style = MaterialTheme.typography.bodySmall,
                                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                                maxLines = 1,
                                                overflow = TextOverflow.Ellipsis
                                            )
                                        }
                                        IconButton(
                                            onClick = {
                                                youtubeViewModel.removeSavedPlaylist(playlist.id)
                                            },
                                            modifier = Modifier.size(36.dp)
                                        ) {
                                            Icon(
                                                imageVector = Icons.Rounded.Delete,
                                                contentDescription = "Delete Playlist",
                                                tint = MaterialTheme.colorScheme.error.copy(alpha = 0.8f),
                                                modifier = Modifier.size(20.dp)
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                confirmButton = {
                    TextButton(onClick = {
                        val id = youtubeViewModel.extractPlaylistId(playlistUrlInput)
                        if (id != null) {
                            showPlaylistDialog = false
                            playlistUrlInput = ""
                            navController.navigate("youtube_playlist/$id")
                        } else {
                            playlistUrlError = true
                        }
                    }) { Text("Open") }
                },
                dismissButton = {
                    TextButton(onClick = { showPlaylistDialog = false; playlistUrlError = false }) {
                        Text("Cancel")
                    }
                }
            )
        }
    }
}
