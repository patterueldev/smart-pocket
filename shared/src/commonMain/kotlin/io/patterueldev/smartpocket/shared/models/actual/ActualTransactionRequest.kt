package io.patterueldev.smartpocket.shared.models.actual

import kotlinx.serialization.Serializable

@Serializable
data class ActualTransactionRequest(
    val learnCategories: Boolean = false,
    val runTransfers: Boolean = true,
    val transaction: ActualTransaction
)