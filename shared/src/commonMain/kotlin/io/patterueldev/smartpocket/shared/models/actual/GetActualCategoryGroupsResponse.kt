package io.patterueldev.smartpocket.shared.models.actual

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class GetActualCategoryGroupsResponse(
    @SerialName("data") val data: List<ActualCategoryGroup>
)