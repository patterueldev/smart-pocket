package io.patterueldev.smartpocket.shared.api

import io.github.kabirnayeem99.ktor2curl.CurlLogger
import io.github.kabirnayeem99.ktor2curl.KtorToCurl
import io.ktor.client.HttpClient
import io.ktor.client.plugins.HttpRequestRetry
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.plugins.timeout
import io.ktor.client.request.HttpRequestBuilder
import io.ktor.client.request.delete
import io.ktor.client.request.get
import io.ktor.client.request.headers
import io.ktor.client.request.patch
import io.ktor.client.request.post
import io.ktor.client.request.put
import io.ktor.client.request.setBody
import io.ktor.client.statement.HttpResponse
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.HttpMethod
import io.ktor.http.contentType
import io.ktor.serialization.kotlinx.json.json
import io.patterueldev.smartpocket.shared.api.generic.HttpRequestEndpoint
import io.patterueldev.smartpocket.shared.models.GenericResponse
import kotlin.math.min
import kotlin.math.pow
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

class APIClient(
    val configuration: APIClientConfiguration,
    private val sessionManager: APISessionManager,
) {
    private val client: HttpClient = HttpClient {
        install(KtorToCurl) {
            converter = object : CurlLogger {
                override fun log(curl: String) {
                    println("------START CURL------")
                    println("\$ $curl")
                    println("-------END CURL-------")
                }
            }
        }
        install(ContentNegotiation) {
            json()
        }
        install(HttpRequestRetry) {
            maxRetries = 3
            retryIf { _, response ->
                response.status.value == 503
            }
            delayMillis { retry ->
                val delay = 500L * 2.0.pow(retry).toLong()
                println("HttpRequestRetry, Request failed, retrying attempt: $retry with delay $delay")
                delay
            }
        }
    }

    val json: Json = Json { ignoreUnknownKeys = true; coerceInputValues = true }


    @Throws(Exception::class)
    suspend fun request(
        path: String,
        requiresAuth: Boolean,
        method: String,
        urlQueryParameters: Map<String, String>?,
        jsonPayload: String?,
        urlEncodedPayload: Map<String, String>?,
        requestTimeout: Long?,
        additionalRequestHeaders: Map<String, String>?,
        retries: Int = 0,
    ): APIResponse {
        if (retries >= configuration.requestMaxRetries) {
            return APIResponse(401, "Failed to refresh token ($retries)")
        }

        val httpMethod = HttpMethod.Companion.parse(method)
        val endpoint = configuration.buildEndpoint(path)
        // if customBaseUrl is provided, do not use sessionManager
        // customBaseUrl is for third-party APIs
        val requestBuilder: HttpRequestBuilder.() -> Unit = {
            if (requiresAuth) {
                val sessionHeader = sessionManager.buildHeaders()
                if (sessionHeader.isEmpty()) throw Exception("Authorization is required")
                if (sessionHeader.isNotEmpty()) {
                    headers {
                        for (key in sessionHeader.keys) {
                            sessionHeader[key]?.let { append(key, it) }
                        }
                    }
                }
            }

            urlQueryParameters?.forEach { (key, value) ->
                url.parameters.append(key, value)
            }

            if (jsonPayload != null) {
                contentType(ContentType.Application.Json)
                // deserialize jsonPayload to Map<String, Any?>
                val element = Json.Default.parseToJsonElement(jsonPayload)
                setBody(element)
            }

            if (urlEncodedPayload != null) {
                contentType(ContentType.Application.FormUrlEncoded)
                val encodedPayload: String = urlEncodedPayload.map { (key, value) ->
                    "$key=$value"
                }.joinToString("&")
                setBody(encodedPayload)
            }

            timeout {
                requestTimeoutMillis = requestTimeout ?: configuration.requestTimeoutMillis
            }

            configuration.additionalHeaders.forEach { (key, value) ->
                headers {
                    append(key, value)
                }
            }

            additionalRequestHeaders?.forEach { (key, value) ->
                headers {
                    append(key, value)
                }
            }
        }

        val response: HttpResponse =
            when (httpMethod) {
                HttpMethod.Companion.Get -> client.get(endpoint, requestBuilder)
                HttpMethod.Companion.Post -> client.post(endpoint, requestBuilder)
                HttpMethod.Companion.Patch -> client.patch(endpoint, requestBuilder)
                HttpMethod.Companion.Put -> client.put(endpoint, requestBuilder)
                HttpMethod.Companion.Delete -> client.delete(endpoint, requestBuilder)
                else -> throw Exception("Invalid method: $httpMethod")
            }

        val bodyText = response.bodyAsText()
        val charLimit = 2000
        val maxChar = min(charLimit, bodyText.length)
        val suffix = if (bodyText.length > charLimit) "..." else ""
        val printBody = when(bodyText.length) {
            0 -> "Empty Body"
            else -> bodyText.substring(0, maxChar) + suffix
        }
        println("Response for $path status code -> ${response.status.value}")
        println("Response Body -> $printBody")
        val responseCode = response.status.value

        return APIResponse(responseCode, bodyText)
    }

    @Throws(Exception::class)
    suspend inline fun <reified T> requestEndpoint(
        endpoint: HttpRequestEndpoint,
        requiresAuth: Boolean,
        method: HttpMethod,
        jsonPayload: String?,
        urlEncodedPayload: Map<String, String>?,
        requestTimeoutInMilliseconds: Long?,
        additionalRequestHeaders: MutableMap<String, String>,
    ) : T {
        val response = request(
            path = endpoint.path,
            requiresAuth = requiresAuth,
            method = method.value,
            urlQueryParameters = endpoint.urlQueryParameters,
            jsonPayload = jsonPayload,
            urlEncodedPayload = urlEncodedPayload,
            requestTimeout = requestTimeoutInMilliseconds,
            additionalRequestHeaders = additionalRequestHeaders,
        )
        return handleResponse(response)
    }

    @Throws(Exception::class)
    suspend inline fun <reified T> requestWithEndpoint(
        endpoint: HttpRequestEndpoint,
    ) : T = requestEndpoint(
        endpoint = endpoint,
        requiresAuth = endpoint.requiresAuth ?: throw GenericException("Endpoint requiresAuth is not set"),
        method = endpoint.method ?: throw GenericException("Endpoint method is not set"),
        jsonPayload = endpoint.jsonPayload,
        urlEncodedPayload = endpoint.urlQueryParameters,
        requestTimeoutInMilliseconds = endpoint.requestTimeoutInMilliseconds,
        additionalRequestHeaders = endpoint.additionalRequestHeaders.toMutableMap(),
    )

    inline fun <reified T> handleResponse(response: APIResponse): T {
        try {
            // regardless of the status code, we will try to decode the response body
            // e.g. scancode returns 400 with a valid json body
            return json.decodeFromString(response.body)
        } catch (e: Exception) {
            println("Error decoding response: ${e.message}")
            // if decoding fails, check the status code
            if (response.statusCode == 200) {
                // if status code is 200, it could actually be a serialization error
                throw GenericException("Error decoding response: ${e.message}; original response: ${response.body}")
            } else {
                // attempt to decode as a generic API error
                try {
                    val errorResponse: APIErrorResponse = json.decodeFromString(response.body)
                    throw APIException(errorResponse)
                } catch (e: Exception) {
                    // if decoding fails, throw generic exception based on status code
                    // if status is between 500 and 599 throw Server error
                    if (response.statusCode in 500..599) {
                        throw GenericException("Server error: ${response.statusCode}", code = response.statusCode)
                    }
                    // if status is between 400 and 499 throw Client error
                    else if (response.statusCode in 400..499) {
                        throw GenericException("Client error: ${response.statusCode}", code = response.statusCode)
                    }
                    // otherwise throw generic exception
                    else {
                        throw GenericException.message(e.message)
                    }
                }
            }
        }
    }
}

open class GenericException(
    override val message: String,
    open val title: String = "Error",
    val code: Int = 0,
) : Exception(message) {
    companion object {
        fun unknownError(): GenericException {
            return GenericException("Unknown error")
        }

        fun message(message: String?): GenericException {
            return message?.let { GenericException(it) } ?: unknownError()
        }
    }
}


@Serializable
data class APIErrorResponse(
    override val data: APIErrorResponseData?,
) : GenericResponse<APIErrorResponseData?>()

@Serializable
data class APIErrorResponseData(
    val code: String,
    val message: String,
)

data class APIException(
    val response: APIErrorResponse,
): Exception(response.data?.message ?: response.message)