package io.patterueldev.smartpocket.server.logic

import com.raedghazal.kotlinx_datetime_ext.LocalDateTimeFormatter
import com.raedghazal.kotlinx_datetime_ext.Locale
import io.patterueldev.smartpocket.server.ActualBudgetEndpoint
import io.patterueldev.smartpocket.server.ServerConfiguration
import io.patterueldev.smartpocket.shared.AmountHelper
import io.patterueldev.smartpocket.shared.api.APIClient
import io.patterueldev.smartpocket.shared.models.actual.ActualBudgetGenericResponse
import io.patterueldev.smartpocket.shared.api.AddReceiptResponse
import io.patterueldev.smartpocket.shared.models.actual.ActualTransaction
import io.patterueldev.smartpocket.shared.models.AddReceiptRequest
import io.patterueldev.smartpocket.shared.models.ParsedReceipt
import io.patterueldev.smartpocket.shared.models.ParsedReceiptItem
import io.patterueldev.smartpocket.shared.models.actual.ActualBatchTransactionsRequest
import io.patterueldev.smartpocket.shared.models.actual.ActualImportTransactionsRequest
import io.patterueldev.smartpocket.shared.models.actual.ImportTransactionsResponse
import kotlin.uuid.ExperimentalUuidApi
import kotlinx.datetime.Clock
import kotlinx.datetime.LocalDateTime
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toLocalDateTime
import kotlinx.serialization.json.Json

class AddReceiptUseCase(
    val apiClient: APIClient,
    val configuration: ServerConfiguration,
) {
    private val json: Json = Json {
        ignoreUnknownKeys = true // Ignore unknown keys in JSON
        isLenient = true // Allow lenient parsing
    }

    @OptIn(ExperimentalUuidApi::class)
    suspend operator fun invoke(request: AddReceiptRequest): AddReceiptResponse { // TODO: Change result
        try {
            val receipt = request.receipt

            val accountId = receipt.actualAccount?.id ?: throw IllegalArgumentException("Account ID is required")
            val payeeName = receipt.actualPayee?.name ?: throw IllegalArgumentException("Payee name is required")

            // First, try to group the items by categories
            val groupedItems = receipt.items.groupBy { it.actualCategory?.id ?: throw IllegalArgumentException("Item must have a category") }
            // If there is only a single category, we can add one single transaction
            val categoryIds = groupedItems.keys.toList()
            // if for whatever reason the categories are empty, we return a failure response
            if (categoryIds.isEmpty()) { throw IllegalArgumentException("Receipt must have at least one category") }

            val date: LocalDateTime = receipt.date ?: throw IllegalArgumentException("Receipt date is required")
            val formatter = LocalDateTimeFormatter.ofPattern("yyyy-MM-dd", Locale.default())
            val formattedDate = formatter.format(date)

            var principalCategoryId: String? = null
            var principalNotes: String? = null
            if (categoryIds.size == 1) {
                val categoryId = categoryIds.first()
                val items = groupedItems[categoryId] ?: throw IllegalStateException("Items for category $categoryId not found")
                principalCategoryId = categoryId
                principalNotes = consolidateItemsToNotes(items)
            }

            val amounts: List<Double> = receipt.items.map { it.price }
            val total: Long = AmountHelper.sumAmountsToMinorUnit(amounts)

            val principalTransaction = ActualTransaction(
                account = accountId,
                amount = total,
                payeeName = payeeName,
                date = formattedDate,
                category = principalCategoryId,
                isParent = categoryIds.size > 1,
                notes = principalNotes,
            )
            val importTransactionsResponse: ImportTransactionsResponse = apiClient.requestWithEndpoint(
                endpoint = ActualBudgetEndpoint.ImportTransactions(
                    budgetId = configuration.budgetSyncId,
                    accountId = accountId,
                    request = ActualImportTransactionsRequest(
                        transactions = listOf(principalTransaction),
                    )
                )
            )
            if(importTransactionsResponse.data.added.size != 1) {
                throw IllegalStateException("Failed to add principal transaction, expected 1 transaction to be added, but got ${importTransactionsResponse.data.added.size}")
            }
            val principalTransactionId = importTransactionsResponse.data.added.first()

            if (categoryIds.size > 1) {
                // Now, create the child transactions for each category
                val childTransactions = groupedItems.map { (categoryId, items) ->
                    val totalForCategory = AmountHelper.sumAmountsToMinorUnit(items.map { it.price })

                    // Update the notes of the principal transaction to the consolidated items
                    val items = groupedItems[categoryId] ?: throw IllegalStateException("Items for category $categoryId not found")
                    val notes = consolidateItemsToNotes(items)

                    ActualTransaction(
                        account = accountId,
                        amount = totalForCategory,
                        payeeName = payeeName,
                        date = formattedDate,
                        category = categoryId,
                        isChild = true,
                        parentId = principalTransactionId,
                        notes = notes,
                    )
                }
                val addBatchTransactionsResponse: ActualBudgetGenericResponse = apiClient.requestWithEndpoint(
                    endpoint = ActualBudgetEndpoint.AddBatchTransactions(
                        budgetId = configuration.budgetSyncId,
                        accountId = accountId,
                        request = ActualBatchTransactionsRequest(
                            transactions = childTransactions
                        ),
                    )
                )
                if (addBatchTransactionsResponse.message != "ok") {
                    throw IllegalStateException("Failed to add batch transactions, expected 'ok' message, but got '${addBatchTransactionsResponse.message}'")
                }
            }

            // Store the transactions into json
            val fileDateFormatter = LocalDateTimeFormatter.ofPattern("yyyyMMddHHmmss", Locale.en())
            val now = Clock.System.now().toLocalDateTime(timeZone = TimeZone.currentSystemDefault())
            val fileDate = fileDateFormatter.format(now)
            FileUtils.saveJson(
                configuration.dataDir,
                "receipts/transactions",
                "$fileDate-$principalTransactionId",
                content = json.encodeToString(ParsedReceipt.serializer(), receipt),
            )
            return AddReceiptResponse(true)
        } catch (e: Exception) {
            e.printStackTrace()
            return AddReceiptResponse(errorMessage = "An error occurred while processing the receipt transaction: ${e.message ?: "Unknown error"}")
        }
    }

    fun consolidateItemsToNotes(items: List<ParsedReceiptItem>): String {
        return items.joinToString(separator = "; ") { item ->
            val itemName = item.name ?: "Unnamed Item"
            val quantity = item.quantity
            val itemPrice = item.price
            val totalPriceInMinorUnits = AmountHelper.toMinorUnit(itemPrice) * quantity
            val totalPrice = AmountHelper.toMajorUnit(totalPriceInMinorUnits)
            "$itemName (x$quantity) @ ₱$itemPrice → ₱$totalPrice"
        }
    }
}
