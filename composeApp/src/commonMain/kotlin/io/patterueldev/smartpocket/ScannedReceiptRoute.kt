package io.patterueldev.smartpocket

import kotlinx.serialization.Serializable

@Serializable
data class ScannedReceiptRoute(
    val rawScannedText: String
)