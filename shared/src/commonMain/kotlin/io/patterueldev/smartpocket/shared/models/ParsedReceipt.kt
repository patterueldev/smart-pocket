package io.patterueldev.smartpocket.shared.models

import io.patterueldev.smartpocket.shared.models.actual.ActualAccount
import io.patterueldev.smartpocket.shared.models.actual.ActualPayee
import kotlinx.datetime.LocalDateTime
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class ParsedReceipt(
    val date: LocalDateTime? = null,
    @SerialName("merchant") val merchantKey: String? = null,
    val items: List<ParsedReceiptItem> = emptyList(),
    @SerialName("paymentMethod") val paymentMethodKey: String? = null,

    val rawReceiptText: String = "",
    val actualPayee: ActualPayee? = null,
    val actualAccount: ActualAccount? = null,
    val remarks: String = "",
) {
    companion object Companion : SchemaType {
        var merchants: List<String> = emptyList()
        var paymentMethods: List<String> = emptyList()
        var categories: List<String> = emptyList()

        override fun schemaName(): String = "ParsedTransaction"
        override fun schemaDescription(): String = "A parsed transaction containing date, merchant, payment method, and items."
        override fun schemaMap() = mapOf(
            "type" to "object",
            "properties" to mapOf(
                "date" to mapOf("type" to "string", "description" to "Transaction date in format YYYY-MM-ddTHH:mm:ss; Null if not applicable."),
                "merchant" to mapOf(
                    "type" to "string",
                    "enum" to merchants,
                    "description" to "Closest match for the merchant name, if applicable. Otherwise, the name of the merchant as found in the receipt."
                ),
                "paymentMethod" to mapOf(
                    "type" to "string",
                    "enum" to paymentMethods,
                    "description" to "Payment method used for the transaction. Might read Maya or BDO, but possibly a POS terminal name. Check other clues on the receipt, or return null if not applicable."
                ),
                "items" to mapOf(
                    "type" to "array",
                    "items" to mapOf(
                        "type" to "object",
                        "properties" to mapOf(
                            "rawName" to mapOf("type" to "string", "description" to "Raw name of the item as found in the receipt."),
                            "name" to mapOf("type" to "string", "description" to "Cleaned name of the item, if applicable. Null if not applicable."),
                            "price" to mapOf("type" to "number"),
                            "quantity" to mapOf("type" to "number", "description" to "Quantity of the item, if applicable. Defaults to 1 if not specified."),
                            "category" to mapOf(
                                "type" to "string",
                                "enum" to categories,
                                "description" to "Category of the item, if applicable. Null if not applicable."
                            )
                        ),
                        "required" to listOf("rawName", "name", "price", "quantity", "category"),
                        "additionalProperties" to false
                    )
                ),
            ),
            "required" to listOf("date", "merchant", "paymentMethod", "items"),
            "additionalProperties" to false
        )
    }
}