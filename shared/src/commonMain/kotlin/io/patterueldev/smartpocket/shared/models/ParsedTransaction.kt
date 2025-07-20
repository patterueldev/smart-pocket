package io.patterueldev.smartpocket.shared.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class ParsedTransaction(
    @SerialName("date") val dateString: String? = null,
    val merchant: String? = null,
    val items: List<ParsedTransactionItem> = emptyList(),
    val paymentMethod: String? = null,
) {
    companion object: SchemaType {
        override fun schemaName(): String = "ParsedTransaction"
        override fun schemaDescription(): String = "A parsed transaction containing date, merchant, payment method, and items."
        override fun schemaMap() = mapOf(
            "type" to "object",
            "properties" to mapOf(
                "date" to mapOf("type" to "string"),
                "merchant" to mapOf("type" to "string"),
                "paymentMethod" to mapOf("type" to "string"),
                "items" to mapOf(
                    "type" to "array",
                    "items" to mapOf(
                        "type" to "object",
                        "properties" to mapOf(
                            "name" to mapOf("type" to "string"),
                            "price" to mapOf("type" to "string"),
                            "quantity" to mapOf("type" to "number"),
                            "category" to mapOf("type" to "string")
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
    @SerialName("price") val price: String? = null,
    @SerialName("quantity") val quantity: Int = 1,
    @SerialName("category") val category: String? = null,
)