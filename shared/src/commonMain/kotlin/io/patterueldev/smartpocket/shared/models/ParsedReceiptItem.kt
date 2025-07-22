package io.patterueldev.smartpocket.shared.models

import io.patterueldev.smartpocket.shared.models.actual.ActualCategory
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class ParsedReceiptItem(
    val rawName: String? = null,
    val name: String? = null,
    val price: Double = 0.0,
    val quantity: Int = 1,
    @SerialName("category") val categoryKey: String? = null,

    val actualCategory: ActualCategory? = null,
)