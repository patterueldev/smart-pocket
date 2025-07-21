package io.patterueldev.smartpocket.shared.models

import kotlinx.serialization.Serializable

@Serializable
data class ActualTransactionRequest(
    val learnCategories: Boolean = false,
    val runTransfers: Boolean = true,
    val transaction: ActualTransaction
)