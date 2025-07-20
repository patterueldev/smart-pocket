package io.patterueldev.smartpocket.shared.models

import kotlinx.serialization.Serializable

@Serializable
data class ParsedTransactionResponse(
    override val data: ParsedTransaction?
): GenericResponse<ParsedTransaction?>(
    success = data != null,
    message = if (data != null) "Transaction parsed successfully" else "Failed to parse transaction",
)