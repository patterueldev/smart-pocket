package io.patterueldev.smartpocket

import com.openai.client.OpenAIClient
import com.openai.models.ChatCompletionCreateParams
import com.openai.models.ChatModel
import com.openai.models.ResponseFormatJsonSchema
import io.patterueldev.smartpocket.shared.models.ParseRawRequest
import io.patterueldev.smartpocket.shared.models.ParsedTransaction
import io.patterueldev.smartpocket.shared.models.ParsedTransactionResponse
import kotlinx.serialization.json.Json

class TransactionParseUseCase(
    private val openAIClient: OpenAIClient
) {
    // injectable fields from ENV
    private val timezone: String = "Asia/Manila"
    private val json: Json = Json {
        ignoreUnknownKeys = true // Ignore unknown keys in JSON
        isLenient = true // Allow lenient parsing
    }

    fun execute(request: ParseRawRequest): ParsedTransactionResponse {
        val raw = request.raw
        val params = ChatCompletionCreateParams.builder()
            .model(ChatModel.GPT_4O_MINI)
            .addSystemMessage("Parse the following receipt into JSON.")
            .addSystemMessage("The receipt date/time is in $timezone timezone. Convert it to UTC in the format YYYY-MM-DD'T'HH:mm:ss'Z'.")
            .addSystemMessage("The payment method detected might read Maya or BDO, but it's just the POS terminal name. Consider reading other clues in the receipt to determine the actual payment method.")
            .addUserMessage(raw)
            .responseFormat(ResponseFormatJsonSchema.from(ParsedTransaction))
            .build()
        val completion = openAIClient.chat().completions().create(params)

        val output: String? = completion.choices().firstOrNull()?.message()?.content()?.orElse(null)
        val data: ParsedTransaction? = output?.let {
            try {
                json.decodeFromString(ParsedTransaction.serializer(), it)
            } catch (e: Exception) {
                e.printStackTrace()
                null // Handle parsing error
            }
        }
        return ParsedTransactionResponse(data)
    }
}