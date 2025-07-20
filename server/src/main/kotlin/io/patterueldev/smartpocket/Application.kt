package io.patterueldev.smartpocket

import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.request.receive
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

fun main() {
    embeddedServer(Netty, port = 8080, watchPaths = listOf("classes"), host = "0.0.0.0", module = Application::module)
        .start(wait = true)
}

fun Application.module() {
    install(ContentNegotiation) {
        json()
    }
    routing {
        get("/") {
            call.respondText("Hello, world!!!")
        }

        post("/transactions/parse") {
            // Deserialize request body as ParseRawRequest
            val request = call.receive<ParseRawRequest>()
            val useCase = TransactionParseUseCase()
            val result = useCase.execute(request)
            // Respond with a dummy parsed result as JSON
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