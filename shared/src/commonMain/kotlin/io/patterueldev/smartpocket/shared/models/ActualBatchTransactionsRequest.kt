package io.patterueldev.smartpocket.shared.models

import kotlinx.serialization.Serializable

@Serializable
data class ActualBatchTransactionsRequest(
    val learnCategories: Boolean = false,
    val runTransfers: Boolean = true,
    val transactions: List<ActualTransaction>
)