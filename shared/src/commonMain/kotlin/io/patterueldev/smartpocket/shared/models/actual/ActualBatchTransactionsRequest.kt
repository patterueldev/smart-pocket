package io.patterueldev.smartpocket.shared.models.actual

import kotlinx.serialization.Serializable

@Serializable
data class ActualBatchTransactionsRequest(
    val learnCategories: Boolean = false,
    val runTransfers: Boolean = true,
    val transactions: List<ActualTransaction>
)