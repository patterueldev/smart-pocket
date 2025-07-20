package io.patterueldev.smartpocket

import kotlinx.serialization.Serializable

@Serializable
data class ScannedReceipt(
    val rawScannedText: String
)