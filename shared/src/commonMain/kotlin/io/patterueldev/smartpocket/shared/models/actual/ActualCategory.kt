package io.patterueldev.smartpocket.shared.models.actual

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class ActualCategory(
    val id: String,
    val name: String,
    @SerialName("is_income") val isIncome: Boolean,
    val hidden: Boolean,
    @SerialName("group_id") val groupId: String
)

