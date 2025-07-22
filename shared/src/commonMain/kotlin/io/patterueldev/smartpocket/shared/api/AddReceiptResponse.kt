package io.patterueldev.smartpocket.shared.api

import io.patterueldev.smartpocket.shared.models.GenericResponse
import io.patterueldev.smartpocket.shared.models.actual.ActualTransaction
import kotlinx.serialization.Serializable

@Serializable
data class AddReceiptResponse (
    override val data: Boolean = false,
    val errorMessage: String? = null,
): GenericResponse<Boolean>(
    success = errorMessage == null,
)

