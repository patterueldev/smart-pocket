package io.patterueldev.smartpocket.shared.models

import kotlinx.serialization.Serializable

@Serializable
data class ParseRawRequest(
    val raw: String,
)