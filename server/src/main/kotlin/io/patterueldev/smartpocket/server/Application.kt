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
import io.patterueldev.smartpocket.server.logic.GetActualGroupedCategoriesUseCase
import io.patterueldev.smartpocket.server.logic.AddReceiptUseCase
import io.patterueldev.smartpocket.server.logic.ParseReceiptUseCase
import io.patterueldev.smartpocket.shared.api.APIClient
import io.patterueldev.smartpocket.shared.api.APIClientConfiguration
import io.patterueldev.smartpocket.shared.api.APISessionManager
import io.patterueldev.smartpocket.shared.models.ParseRawRequest
import io.patterueldev.smartpocket.shared.models.AddReceiptRequest
import io.patterueldev.smartpocket.shared.models.actual.GetAccountsResponse
import io.patterueldev.smartpocket.shared.models.actual.GetActualCategoryGroupsResponse
import io.patterueldev.smartpocket.shared.models.actual.GetPayeesResponse
import org.koin.dsl.module
import org.koin.ktor.ext.inject
import org.koin.ktor.plugin.Koin

fun main() {
    // For debugging purposes, we can print the environment variable ACTUAL_REST_API_URL
    val url = System.getenv("ACTUAL_REST_API_URL")
    println("ACTUAL_REST_API_URL: $url")

    embeddedServer(Netty, port = 8080, watchPaths = listOf("classes"), host = "0.0.0.0", module = Application::module)
        .start(wait = true)
}

val appModule = module {
    single { ServerConfiguration.fromEnvironment() }
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
    single { ParseReceiptUseCase(openAIClient = get(), apiClient = get(), serverConfiguration = get()) }
    single { AddReceiptUseCase(apiClient = get(), configuration = get()) }
    single { GetActualGroupedCategoriesUseCase(apiClient = get(), serverConfiguration = get()) }
}

fun Application.module() {
    install(ContentNegotiation) {
        json()
    }
    install(Koin) {
        modules(appModule)
    }
    val parseReceiptUseCase by inject<ParseReceiptUseCase>()
    val addReceiptUseCase by inject<AddReceiptUseCase>()
    val getActualGroupedCategoriesUseCase by inject<GetActualGroupedCategoriesUseCase>()

    val apiClient by inject<APIClient>()
    val serverConfiguration by inject<ServerConfiguration>()

    routing {
        get("/") {
            call.respondText("Hello, world!!!")
        }

        post("/transactions/receipt/parse") {
            val request = call.receive<ParseRawRequest>()
            val result = parseReceiptUseCase(request)
            call.respond(result)
        }

        post("/transactions/receipt/add") {
            val request = call.receive<AddReceiptRequest>()
            val result = addReceiptUseCase(request)
            call.respond(result)
        }

        get("/metadata/grouped-categories") {
            val groupedCategoriesResponse: GetActualCategoryGroupsResponse = apiClient.requestWithEndpoint(
                endpoint = ActualBudgetEndpoint.GetCategoryGroups(
                    budgetId = serverConfiguration.budgetSyncId,
                )
            )
            call.respond(groupedCategoriesResponse)
        }

        get("/metadata/payees") {
            val payeesResponse: GetPayeesResponse = apiClient.requestWithEndpoint(
                endpoint = ActualBudgetEndpoint.GetPayees(
                    budgetId = serverConfiguration.budgetSyncId,
                )
            )
            call.respond(payeesResponse)
        }

        get("/metadata/accounts") {
            val accountsResponse: GetAccountsResponse = apiClient.requestWithEndpoint(
                endpoint = ActualBudgetEndpoint.GetAccounts(
                    budgetId = serverConfiguration.budgetSyncId,
                )
            )
            call.respond(accountsResponse)
        }
    }
}

