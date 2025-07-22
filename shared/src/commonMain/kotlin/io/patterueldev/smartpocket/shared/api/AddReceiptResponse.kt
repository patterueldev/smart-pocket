package io.patterueldev.smartpocket.shared.api

import io.patterueldev.smartpocket.shared.models.actual.ActualTransaction
import kotlinx.serialization.Serializable

@Serializable
data class AddReceiptResponse (
//    override val data: String? = null,
    val addedTransactions: List<ActualTransaction> = emptyList(),
    val errorMessage: String? = null,
)

