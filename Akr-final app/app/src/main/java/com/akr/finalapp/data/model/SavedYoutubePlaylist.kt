package com.akr.finalapp.data.model

import androidx.compose.runtime.Immutable
import kotlinx.serialization.Serializable

@Immutable
@Serializable
data class SavedYoutubePlaylist(
    val id: String,
    val name: String,
    val url: String? = null,
    val lastAccessed: Long = System.currentTimeMillis()
)
