package io.patterueldev.smartpocket.server

data class ServerConfiguration(
    val openAiKey: String,
    val actualRestBaseURL: String,
    val actualRestAPIKey: String,
    val budgetSyncId: String,
    val dataDir: String,
) {
    companion object {
        private fun fromEnvOrThrow(envVar: String): String {
            val value = System.getenv(envVar)
            if (value.isBlank()) {
                throw IllegalArgumentException("$envVar is not set or is empty")
            }
            println("$envVar: $value")
            return value
        }

        fun fromEnvironment(): ServerConfiguration {
            return ServerConfiguration(
                openAiKey = fromEnvOrThrow("OPENAI_API_KEY"),
                actualRestBaseURL = fromEnvOrThrow("ACTUAL_REST_API_URL"),
                actualRestAPIKey = fromEnvOrThrow("ACTUAL_REST_API_KEY"),
                budgetSyncId = fromEnvOrThrow("BUDGET_SYNC_ID"),
                dataDir = fromEnvOrThrow("DATA_DIR")
            )
        }
    }
}