package io.patterueldev.smartpocket

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
import org.koin.dsl.module
import org.koin.ktor.ext.inject
import org.koin.ktor.plugin.Koin

fun main() {
    embeddedServer(Netty, port = 8080, watchPaths = listOf("classes"), host = "0.0.0.0", module = Application::module)
        .start(wait = true)
}

val appModule = module {
    single<OpenAIClient> {
        OpenAIOkHttpClient.builder()
            .apiKey("<YOUR_OPENAI_API_KEY>")
            .build()
    }
    single { TransactionParseUseCase(get()) }
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

