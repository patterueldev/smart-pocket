package io.patterueldev.smartpocket.server

import com.openai.client.OpenAIClient
import com.openai.client.okhttp.OpenAIOkHttpClient
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.request.receive
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.json.*
import io.patterueldev.smartpocket.shared.api.APIClient
import io.patterueldev.smartpocket.shared.api.APIClientConfiguration
import io.patterueldev.smartpocket.shared.api.APISessionManager
import io.patterueldev.smartpocket.shared.models.ParseRawRequest
import io.patterueldev.smartpocket.shared.models.ReceiptTransactionRequest
import org.koin.dsl.module
import org.koin.ktor.ext.inject
import org.koin.ktor.plugin.Koin

fun main() {
    val openAiKey = System.getenv("OPENAI_API_KEY")
    val actualRestBaseURL = System.getenv("ACTUAL_REST_API_URL")
    println("OpenAI Key: $openAiKey")
    println("Actual REST Base URL: $actualRestBaseURL")
    embeddedServer(Netty, port = 8080, watchPaths = listOf("classes"), host = "0.0.0.0", module = Application::module)
        .start(wait = true)
}

data class ServerConfiguration(
    val openAiKey: String,
    val actualRestBaseURL: String,
    val actualRestAPIKey: String,
    val budgetSyncId: String,
)

val appModule = module {
    single {
        val openAiKey = System.getenv("OPENAI_API_KEY") ?: throw IllegalArgumentException("OPENAI_API_KEY is not set")
        val actualRestBaseURL = System.getenv("ACTUAL_REST_API_URL") ?: throw IllegalArgumentException("ACTUAL_REST_API_URL is not set")
        val actualAPIKey = System.getenv("ACTUAL_REST_API_KEY") ?: throw IllegalArgumentException("ACTUAL_API_KEY is not set")
        val budgetSyncId = System.getenv("BUDGET_SYNC_ID") ?: throw IllegalArgumentException("BUDGET_SYNC_ID is not set")
        ServerConfiguration(
            openAiKey = openAiKey,
            actualRestBaseURL = actualRestBaseURL,
            actualRestAPIKey = actualAPIKey,
            budgetSyncId = budgetSyncId,
        )
    }
    single<OpenAIClient> {
        val configuration: ServerConfiguration = get()
        OpenAIOkHttpClient.builder()
            .apiKey(configuration.openAiKey)
            .build()
    }
    single<APIClient> {
        val configuration: ServerConfiguration = get()
        APIClient(
            configuration = APIClientConfiguration(
                baseUrl = configuration.actualRestBaseURL,
                additionalHeaders = mapOf(
                    "x-api-key" to configuration.actualRestAPIKey,
                )
            ),
            sessionManager = APISessionManager(),
        )
    }
    single { TransactionParseUseCase(openAIClient = get(), apiClient = get(), serverConfiguration = get()) }
    single { ReceiptTransactionUseCase(apiClient = get(), configuration = get()) }
}

fun Application.module() {
    install(ContentNegotiation) {
        json()
    }
    install(Koin) {
        modules(appModule)
    }
    val transactionParseUseCase by inject<TransactionParseUseCase>()
    val receiptTransactionUseCase by inject<ReceiptTransactionUseCase>()
    routing {
        get("/") {
            call.respondText("Hello, world!!!")
        }

        post("/transactions/parse") {
            val request = call.receive<ParseRawRequest>()
            val result = transactionParseUseCase(request)
            call.respond(result)
        }

        post("/transactions/receipt") {
            val request = call.receive<ReceiptTransactionRequest>()
            val result = receiptTransactionUseCase(request)
            call.respond(result)
        }
    }
}

