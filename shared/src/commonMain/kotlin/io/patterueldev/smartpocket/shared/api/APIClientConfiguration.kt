package io.patterueldev.smartpocket.shared.api

data class APIClientConfiguration(
    internal val baseUrl: String,
    // default request timeout if not specified from the request
    val requestTimeoutMillis: Long = 60000, // 60 seconds
    val requestMaxRetries: Int = 10, // default max retries for requests
) {
    fun buildEndpoint(path: String): String {
        val filteredBaseUrl = baseUrl.removeSuffix("/")
        val filteredPath = path.removePrefix("/")
        return "$filteredBaseUrl/$filteredPath"
    }

    companion object {
        fun create(
            baseUrl: String,
            requestTimeoutMillis: Long,
            requestMaxRetries: Int,
        ): APIClientConfiguration {
            return APIClientConfiguration(
                baseUrl = baseUrl,
                requestTimeoutMillis = requestTimeoutMillis,
                requestMaxRetries = requestMaxRetries,
            )
        }

        // with default request timeout of 60 seconds
        fun withBaseUrl(baseUrl: String): APIClientConfiguration {
            return APIClientConfiguration(
                baseUrl = baseUrl,
                requestTimeoutMillis = 60000, // 60 seconds
                requestMaxRetries = 10,
            )
        }
    }
}