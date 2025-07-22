package io.patterueldev.smartpocket.shared.models

import kotlinx.serialization.Serializable

@Serializable
data class ParsedReceiptResponse(
    override val data: ParsedReceipt?
): GenericResponse<ParsedReceipt?>(
    success = data != null,
    message = if (data != null) "Transaction parsed successfully" else "Failed to parse transaction",
)