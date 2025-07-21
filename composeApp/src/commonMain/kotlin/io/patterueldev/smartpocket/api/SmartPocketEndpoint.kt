package io.patterueldev.smartpocket.api

import io.ktor.http.HttpMethod
import io.patterueldev.smartpocket.shared.api.generic.HttpRequestEndpoint
import io.patterueldev.smartpocket.shared.models.ParseRawRequest
import kotlinx.serialization.json.Json

sealed class SmartPocketEndpoint(
    override val path: String,
    override val method: HttpMethod?,
    override val jsonPayload: String? = null,
    override val requestTimeoutInMilliseconds: Long? = null,
): HttpRequestEndpoint() {
    override val requiresAuth: Boolean? = false
    data class TransactionParse(val receiptString: String): SmartPocketEndpoint(
        path = "/transactions/parse",
        method = HttpMethod.Companion.Post,
        jsonPayload = Json.Default.encodeToString(ParseRawRequest(receiptString))
    )
}