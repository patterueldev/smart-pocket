package io.patterueldev.smartpocket.shared.models.actual

import io.patterueldev.smartpocket.shared.models.actual.ActualPayee
import kotlinx.serialization.Serializable

@Serializable
data class GetPayeesResponse(
    val data: List<ActualPayee> = emptyList()
)