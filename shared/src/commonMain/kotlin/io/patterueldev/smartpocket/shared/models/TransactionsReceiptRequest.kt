package io.patterueldev.smartpocket.shared.models

import kotlinx.datetime.LocalDateTime
import kotlinx.serialization.Serializable

@Serializable
data class AddReceiptRequest(
    val receipt: ParsedReceipt
)