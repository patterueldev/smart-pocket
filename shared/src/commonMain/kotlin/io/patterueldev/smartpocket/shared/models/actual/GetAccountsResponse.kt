package io.patterueldev.smartpocket.shared.models.actual

import kotlinx.serialization.Serializable

@Serializable
data class GetAccountsResponse(
    val data: List<ActualAccount> = emptyList()
)