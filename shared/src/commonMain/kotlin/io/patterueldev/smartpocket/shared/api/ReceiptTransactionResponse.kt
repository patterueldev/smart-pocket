package io.patterueldev.smartpocket.shared.api

import io.patterueldev.smartpocket.shared.models.GenericResponse
import kotlinx.serialization.Serializable

@Serializable
data class ReceiptTransactionResponse (
    override val data: String? = null,
    val errorMessage: String? = null,
): GenericResponse<String?>(
    success = data != null,
    message = errorMessage
)

@Serializable
data class ActualBudgetGenericResponse(
    val message: String? = null,
)