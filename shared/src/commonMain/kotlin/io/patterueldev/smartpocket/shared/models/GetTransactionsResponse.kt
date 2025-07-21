package io.patterueldev.smartpocket.shared.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class GetTransactionsResponse(
    @SerialName("data") val transactions: List<ActualTransaction>,
)