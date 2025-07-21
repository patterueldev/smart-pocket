package io.patterueldev.smartpocket.shared.api

class APISessionManager {
    private var bearerToken: String? = null

    fun updateBearerToken(bearerToken: String) {
        println("Updating bearer token: $bearerToken")
        this.bearerToken = bearerToken
    }

    fun buildHeaders(): Map<String, String> {
        val bearerToken = bearerToken

        if (bearerToken == null) {
            throw Exception("Session not configured")
        }

        val header =
            mutableMapOf(
                "Authorization" to "Bearer $bearerToken",
            )
        return header
    }
}