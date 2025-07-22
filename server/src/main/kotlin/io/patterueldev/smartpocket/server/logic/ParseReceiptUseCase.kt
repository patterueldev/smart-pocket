package io.patterueldev.smartpocket.server.logic

import com.openai.client.OpenAIClient
import com.openai.models.ChatCompletionCreateParams
import com.openai.models.ChatModel
import com.openai.models.ResponseFormatJsonSchema
import com.raedghazal.kotlinx_datetime_ext.LocalDateTimeFormatter
import com.raedghazal.kotlinx_datetime_ext.Locale
import io.patterueldev.smartpocket.server.ActualBudgetEndpoint
import io.patterueldev.smartpocket.server.ServerConfiguration
import io.patterueldev.smartpocket.server.from
import io.patterueldev.smartpocket.shared.api.APIClient
import io.patterueldev.smartpocket.shared.models.actual.GetAccountsResponse
import io.patterueldev.smartpocket.shared.models.actual.GetCategoriesResponse
import io.patterueldev.smartpocket.shared.models.actual.GetPayeesResponse
import io.patterueldev.smartpocket.shared.models.ParseRawRequest
import io.patterueldev.smartpocket.shared.models.ParsedReceipt
import io.patterueldev.smartpocket.shared.models.ParsedReceiptResponse
import kotlinx.datetime.Clock
import kotlinx.datetime.LocalDateTime
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toLocalDateTime
import kotlinx.serialization.json.Json

class ParseReceiptUseCase(
    private val openAIClient: OpenAIClient,
    private val apiClient: APIClient,
    private val serverConfiguration: ServerConfiguration,
) {
    // injectable fields from ENV
    private val timezone: String = "Asia/Manila"
    private val json: Json = Json {
        ignoreUnknownKeys = true // Ignore unknown keys in JSON
        isLenient = true // Allow lenient parsing
    }

    suspend operator fun invoke(request: ParseRawRequest): ParsedReceiptResponse {
        // first, pull categories from actual budget API
        val categoriesResponse: GetCategoriesResponse = apiClient.requestWithEndpoint(
            endpoint = ActualBudgetEndpoint.GetCategories(
                budgetId = serverConfiguration.budgetSyncId,
            )
        )
        // next, for each category, we will make a snake_case version of the name and associate with the ID
        val snakeCaser = { name: String ->
            name.lowercase()
                .replace("&", "and")
                .replace(" ", "_")
                .replace(Regex("[^a-z0-9_]"), "") // Remove non-alphanumeric characters except underscores
        }
        val categoriesMap = categoriesResponse.data.associateBy { category -> snakeCaser(category.name) }
        // get the categories snake_cased
        val categoriesSnakeCased = categoriesMap.keys.toList()

        // ----- let's do the same for the payees -----
        val payeesResponse: GetPayeesResponse = apiClient.requestWithEndpoint(
            endpoint = ActualBudgetEndpoint.GetPayees(
                budgetId = serverConfiguration.budgetSyncId,
            )
        )
        // filter out payees that has transferAccount not null, as these are not actual payees; these are transfer accounts
        val filteredPayees = payeesResponse.data.filter { it.transferAccount == null }
        // create a map of payee names to IDs
        val payeesMap = filteredPayees.associateBy { payee -> snakeCaser(payee.name) }
        // get the payees snake_cased
        val payeesSnakeCased = payeesMap.keys.toList()

        // ----- let's do the same for the accounts, one more time -----
        val accountsResponse: GetAccountsResponse = apiClient.requestWithEndpoint(
            endpoint = ActualBudgetEndpoint.GetAccounts(
                budgetId = serverConfiguration.budgetSyncId,
            )
        )
        // create a map of account names to IDs
        val accountsMap = accountsResponse.data.associateBy { account -> snakeCaser(account.name) }
        // get the accounts snake_cased
        val accountsSnakeCased = accountsMap.keys.toList()

        // ----- now we can proceed with the OpenAI request -----
        ParsedReceipt.merchants = payeesSnakeCased
        ParsedReceipt.paymentMethods = accountsSnakeCased
        ParsedReceipt.categories = categoriesSnakeCased

        println("Loaded categories: $categoriesSnakeCased")
        println("Loaded payees: $payeesSnakeCased")
        println("Loaded accounts: $accountsSnakeCased")

        val raw = request.raw
        val params = ChatCompletionCreateParams.builder()
            .model(ChatModel.GPT_4O_MINI)
            .addSystemMessage("Parse the following receipt into JSON.")
            .addUserMessage(raw)
            .responseFormat(ResponseFormatJsonSchema.Companion.from(ParsedReceipt))
            .build()
        val completion = openAIClient.chat().completions().create(params)

        val output: String? = completion.choices().firstOrNull()?.message()?.content()?.orElse(null)
        // print
        println("OpenAI response: $output")

        // associate the parsed transaction with the payee and account IDs
        val data: ParsedReceipt = try {
            output ?: throw IllegalArgumentException("OpenAI response is null")
            var data = json.decodeFromString(ParsedReceipt.serializer(), output)

            // save raw receipt text to a file
            val formatter = LocalDateTimeFormatter.ofPattern("yyyyMMddHHmmss", Locale.en())
            val now = Clock.System.now().toLocalDateTime(timeZone = TimeZone.currentSystemDefault())
            val formattedDate = formatter.format(now)
            FileUtils.saveJson(
                baseDir = serverConfiguration.dataDir,
                subDir = "receipts/raw",
                fileName = "$formattedDate-raw",
                content = json.encodeToString(ParsedReceipt.serializer(), data),
            )

            data = data.copy(rawReceiptText = raw)
            // map the merchant to the payee
            // PS: Payee are more flexible, so we can use the name instead of the ID
            data.merchantKey?.let { merchantKey ->
                val actualPayee = payeesMap[merchantKey] ?: return@let data
                data = data.copy(actualPayee = actualPayee)
            }

            // map the payment method to the account ID
            data.paymentMethodKey?.let { paymentMethodKey ->
                val actualAccount = accountsMap[paymentMethodKey] ?: return@let data
                data = data.copy(actualAccount = actualAccount)
            }

            // map the items' categories to the category IDs
            data = data.copy(
                items = data.items.map { item ->
                    item.categoryKey?.let { categoryKey ->
                        val actualCategory = categoriesMap[categoryKey] ?: return@let item
                        item.copy(actualCategory = actualCategory)
                    } ?: item // if category is null, return the item as is
                }
            )
            data
        } catch (e: Exception) {
            e.printStackTrace()
            // if there's an error mapping the payee or payment method, we can still return the parsed transaction
            ParsedReceipt()
        }
        return ParsedReceiptResponse(data)
    }
}

