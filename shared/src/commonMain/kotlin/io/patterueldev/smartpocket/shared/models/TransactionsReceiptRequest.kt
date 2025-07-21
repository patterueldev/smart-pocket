package io.patterueldev.smartpocket.shared.models

import kotlinx.datetime.LocalDateTime
import kotlinx.serialization.Serializable

@Serializable
data class ReceiptTransactionRequest(
    val date: LocalDateTime,
    val amount: Long,
    val accountId: String,
    val payeeId: String,
    val items: List<ReceiptItem>
)

@Serializable
data class ReceiptItem(
    val name: String,
    val quantity: Int,
    val price: Long,
    val categoryId: String,
)

