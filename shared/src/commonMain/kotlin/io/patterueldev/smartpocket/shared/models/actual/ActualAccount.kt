package io.patterueldev.smartpocket.shared.models.actual

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class ActualAccount(
    val id: String,
    val name: String,
    @SerialName("offbudget") val offBudget: Boolean,
    val closed: Boolean
)