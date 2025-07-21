package io.patterueldev.smartpocket.shared.models.actual

import kotlinx.serialization.Serializable

@Serializable
data class GetCategoriesResponse(
    val data: List<ActualCategory> = emptyList()
)