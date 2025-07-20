package io.patterueldev.smartpocket

import kotlinx.serialization.Serializable

@Serializable
data class ParseRawRequest(
    val raw: String,
)