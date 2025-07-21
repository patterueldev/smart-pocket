package io.patterueldev.smartpocket.shared.models

import io.patterueldev.smartpocket.shared.models.actual.ActualAccount
import io.patterueldev.smartpocket.shared.models.actual.ActualCategory
import io.patterueldev.smartpocket.shared.models.actual.ActualCategoryGroup
import io.patterueldev.smartpocket.shared.models.actual.ActualPayee
import kotlinx.datetime.LocalDateTime
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class ParsedTransaction(
    val date: LocalDateTime? = null,
    @SerialName("merchant") val merchantKey: String? = null,
    val items: List<ParsedTransactionItem> = emptyList(),
    @SerialName("paymentMethod") val paymentMethodKey: String? = null,

    val actualPayee: ActualPayee? = null,
    val actualAccount: ActualAccount? = null,
) {
    companion object: SchemaType {
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
                    "description" to "Payment method used for the transaction. Null if not applicable."
                ),
                "items" to mapOf(
                    "type" to "array",
                    "items" to mapOf(
                        "type" to "object",
                        "properties" to mapOf(
                            "name" to mapOf("type" to "string"),
                            "price" to mapOf("type" to "number"),
                            "quantity" to mapOf("type" to "number"),
                            "category" to mapOf(
                                "type" to "string",
                                "enum" to categories,
                                "description" to "Category of the item, if applicable. Null if not applicable."
                            )
                        ),
                        "required" to listOf("name", "price", "quantity", "category"),
                        "additionalProperties" to false
                    )
                ),
            ),
            "required" to listOf("date", "merchant", "paymentMethod", "items"),
            "additionalProperties" to false
        )
    }
}

@Serializable
data class ParsedTransactionItem(
    @SerialName("name") val name: String? = null,
    @SerialName("price") val price: Double = 0.0,
    @SerialName("quantity") val quantity: Int = 1,
    @SerialName("category") val categoryKey: String? = null,

    val actualCategory: ActualCategory? = null,
)