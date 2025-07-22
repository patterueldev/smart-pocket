package io.patterueldev.smartpocket.scenes.parsedtransaction

import androidx.compose.material3.CalendarLocale
import androidx.compose.material3.DatePickerState
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import io.patterueldev.smartpocket.ScannedReceiptRoute
import io.patterueldev.smartpocket.api.SmartPocketEndpoint
import io.patterueldev.smartpocket.shared.api.APIClient
import io.patterueldev.smartpocket.shared.models.ParsedTransactionResponse
import io.patterueldev.smartpocket.shared.models.actual.ActualAccount
import io.patterueldev.smartpocket.shared.models.actual.ActualCategory
import io.patterueldev.smartpocket.shared.models.actual.ActualPayee
import io.patterueldev.smartpocket.shared.models.actual.GetAccountsResponse
import io.patterueldev.smartpocket.shared.models.actual.GetActualCategoryGroupsResponse
import io.patterueldev.smartpocket.shared.models.actual.GetPayeesResponse
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.datetime.Clock
import kotlinx.datetime.Instant
import kotlinx.datetime.LocalDateTime
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toInstant

abstract class ParsedTransactionViewModel(): ViewModel() {
    var isLoading: Boolean by mutableStateOf(true)
    var errorString: String? by mutableStateOf(null)
    var payee: ActualPayee? by mutableStateOf(null)
    var payees = mutableStateListOf<ActualPayee>()
    var date: Instant by mutableStateOf(Clock.System.now())
    var account: ActualAccount? by mutableStateOf(null)
    var accounts = mutableStateListOf<ActualAccount>()
    var items = mutableStateListOf<TransactionItem>()
    var categories = mutableStateListOf<ActualCategory>()

    open fun parseTransaction() {
        // This method should be overridden in the subclass to implement the parsing logic
        throw NotImplementedError("parseTransaction() must be implemented in the subclass")
    }
    fun updateItem(updatedItem: TransactionItem) {
        val index = items.indexOfFirst { it.idx == updatedItem.idx }
        if (index != -1) {
            items[index] = updatedItem
        }
    }
    fun removeItem(item: TransactionItem) {
        val index = items.indexOfFirst { it.idx == item.idx }
        if (index != -1) {
            items.removeAt(index)
        }
    }
}

data class TransactionItem(
    val idx: Int,
    val name: String = "",
    val price: String = "",
    val quantity: Int = 1,
    val category: ActualCategory? = null
)

class DefaultParsedTransactionViewModel(
    val scannedReceiptRoute: ScannedReceiptRoute,
    val apiClient: APIClient,
): ParsedTransactionViewModel() {
    val scope: CoroutineScope = CoroutineScope(Dispatchers.Main)
    override fun parseTransaction() {
        // Logic to parse the scanned receipt text into a structured format
        // This could involve regex matching, string manipulation, or using a library
        // to extract relevant fields like date, amount, merchant, etc.

        scope.launch {
            // if blank, skip;
            if (scannedReceiptRoute.rawScannedText.isBlank()) {
                isLoading = true
                // simulate a delay to mimic network call
                kotlinx.coroutines.delay(2000)
                isLoading = false
                return@launch
            }
            try {
                isLoading = true
                val response: ParsedTransactionResponse = apiClient.requestWithEndpoint(
                    endpoint = SmartPocketEndpoint.TransactionParse(
                        receiptString = scannedReceiptRoute.rawScannedText
                    )
                )
                val data = response.data ?: throw Exception("No data found in response")
                // Update the UI state with parsed data
                payee = data.actualPayee
                data.date?.let { date = it.toInstant(TimeZone.currentSystemDefault()) }
                account = data.actualAccount
                items.clear()
                var idx = 0
                data.items.forEach { item ->
                    items.add(
                        TransactionItem(
                            idx = idx++,
                            name = item.name ?: "Unknown Item",
                            price = item.price.toString(),
                            quantity = item.quantity,
                            category = item.actualCategory,
                        )
                    )
                }

                // load payees, accounts, and categories
                val payeesResponse: GetPayeesResponse = apiClient.requestWithEndpoint(
                    endpoint = SmartPocketEndpoint.MetadataPayees
                )
                payees.clear()
                payees.addAll(payeesResponse.data)

                val accountsResponse: GetAccountsResponse = apiClient.requestWithEndpoint(
                    endpoint = SmartPocketEndpoint.MetadataAccounts
                )
                accounts.clear()
                accounts.addAll(accountsResponse.data)

                val groupedCategoriesResponse: GetActualCategoryGroupsResponse = apiClient.requestWithEndpoint(
                    endpoint = SmartPocketEndpoint.MetadataGroupedCategories
                )
                categories.clear()
                categories.addAll(groupedCategoriesResponse.data.map { it.categories }.flatten())

            } catch (e: Exception) {
                errorString = e.message ?: "An error occurred while parsing the transaction."
                isLoading = false
                return@launch
            } finally {
                isLoading = false
            }
        }
    }
}