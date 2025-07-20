package io.patterueldev.smartpocket

import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.request.receive
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.Serializable
import org.koin.dsl.module
import org.koin.ktor.ext.inject
import org.koin.ktor.plugin.Koin

fun main() {
    embeddedServer(Netty, port = 8080, watchPaths = listOf("classes"), host = "0.0.0.0", module = Application::module)
        .start(wait = true)
}

val appModule = module {
    single { TransactionParseUseCase() }
}

fun Application.module() {
    install(ContentNegotiation) {
        json()
    }
    install(Koin) {
        modules(appModule)
    }
    val useCase by inject<TransactionParseUseCase>()
    routing {
        get("/") {
            call.respondText("Hello, world!!!")
        }

        post("/transactions/parse") {
            val request = call.receive<ParseRawRequest>()
            val result = useCase.execute(request)
            call.respond(result)
        }
    }
}

@Serializable
data class ParseRawRequest(
    val raw: String,
)

@Serializable
data class ParsedTransactionResponse(
    val parsed: Boolean,
    val input: String,
    val dummyField: String
)

class TransactionParseUseCase {
    fun execute(request: ParseRawRequest): ParsedTransactionResponse {
        // Dummy implementation for parsing logic
        return ParsedTransactionResponse(
            parsed = true,
            input = request.raw,
            dummyField = "This is a dummy field"
        )
    }
}