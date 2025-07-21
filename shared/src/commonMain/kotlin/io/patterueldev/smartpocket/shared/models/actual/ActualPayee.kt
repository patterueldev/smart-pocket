package io.patterueldev.smartpocket.shared.models.actual

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class ActualPayee(
    val id: String,
    val name: String,
    @SerialName("transfer_acct") val transferAccount: String? = null
)