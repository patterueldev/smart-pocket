package io.patterueldev.smartpocket.api

import io.ktor.http.HttpMethod
import io.patterueldev.smartpocket.shared.api.generic.HttpRequestEndpoint
import io.patterueldev.smartpocket.shared.models.AddReceiptRequest
import io.patterueldev.smartpocket.shared.models.ParseRawRequest
import kotlinx.serialization.json.Json

sealed class SmartPocketEndpoint(
    override val path: String,
    override val method: HttpMethod?,
    override val jsonPayload: String? = null,
    override val requestTimeoutInMilliseconds: Long? = null,
): HttpRequestEndpoint() {
    override val requiresAuth: Boolean? = false
    data class ParseReceipt(val receiptString: String): SmartPocketEndpoint(
        path = "/transactions/receipt/parse",
        method = HttpMethod.Companion.Post,
        jsonPayload = Json.Default.encodeToString(ParseRawRequest(receiptString))
    )
    data class AddReceipt(
        val receiptRequest: AddReceiptRequest
    ): SmartPocketEndpoint(
        path = "/transactions/receipt/add",
        method = HttpMethod.Companion.Post,
        jsonPayload = Json.Default.encodeToString(receiptRequest),
    )

    data object MetadataGroupedCategories: SmartPocketEndpoint(
        path = "/metadata/grouped-categories",
        method = HttpMethod.Companion.Get,
    )

    data object MetadataPayees: SmartPocketEndpoint(
        path = "/metadata/payees",
        method = HttpMethod.Companion.Get,
    )

    data object MetadataAccounts: SmartPocketEndpoint(
        path = "/metadata/accounts",
        method = HttpMethod.Companion.Get,
    )
}