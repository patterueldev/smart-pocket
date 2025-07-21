package io.patterueldev.smartpocket.shared.api.generic

import io.ktor.http.HttpMethod

abstract class HttpRequestEndpoint {
    abstract val path: String
    // for now, these are defaulted to null. but in the future, we will migrate existing endpoints to use these properties and will turn these required
    open val requiresAuth: Boolean? = null
    open val method: HttpMethod? = null
    open val jsonPayload: String? = null
    open val urlQueryParameters: Map<String, String>? = null
    open val requestTimeoutInMilliseconds: Long? = null
    open val additionalRequestHeaders: MutableMap<String, String> = mutableMapOf()
}