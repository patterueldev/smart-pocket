package io.patterueldev.smartpocket.shared.models.actual

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class ActualTransaction(
    val id: String = "",
    val account: String,
    val amount: Long,
    val payee: String? = null, // if payee is provided, payee_name is ignored
    @SerialName("payee_name") val payeeName: String? = null,
    val date: String,
    val cleared: Boolean = false,
    val category: String? = null,
    @SerialName("is_parent") val isParent: Boolean = false,
    @SerialName("is_child") val isChild: Boolean = false,
    @SerialName("parent_id") val parentId: String? = null,
    val notes: String? = null,
    val subtransactions: List<ActualTransaction> = emptyList(),
)

