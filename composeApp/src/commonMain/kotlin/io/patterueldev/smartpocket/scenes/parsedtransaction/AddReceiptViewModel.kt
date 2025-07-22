package io.patterueldev.smartpocket.scenes.parsedtransaction

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.navigation.NavController
import io.patterueldev.smartpocket.ScannedReceiptRoute
import io.patterueldev.smartpocket.api.SmartPocketEndpoint
import io.patterueldev.smartpocket.shared.amountMultipledBy
import io.patterueldev.smartpocket.shared.amountSum
import io.patterueldev.smartpocket.shared.api.APIClient
import io.patterueldev.smartpocket.shared.api.AddReceiptResponse
import io.patterueldev.smartpocket.shared.models.AddReceiptRequest
import io.patterueldev.smartpocket.shared.models.ParsedReceipt
import io.patterueldev.smartpocket.shared.models.ParsedReceiptResponse
import io.patterueldev.smartpocket.shared.models.actual.ActualAccount
import io.patterueldev.smartpocket.shared.models.actual.ActualCategory
import io.patterueldev.smartpocket.shared.models.actual.ActualPayee
import io.patterueldev.smartpocket.shared.models.actual.GetAccountsResponse
import io.patterueldev.smartpocket.shared.models.actual.GetActualCategoryGroupsResponse
import io.patterueldev.smartpocket.shared.models.actual.GetPayeesResponse
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

data class TotalItem(
    val label: String,
    val amount: Double,
    val isTotal: Boolean = false, // Indicates if this is the overall total
)

abstract class AddReceiptViewModel(): ViewModel() {
    var isLoading: Boolean by mutableStateOf(true)
    var errorString: String? by mutableStateOf(null)
    var parsedReceipt: ParsedReceipt by mutableStateOf(ParsedReceipt())
        private set
    var totalItems: MutableList<TotalItem> = mutableStateListOf()

    // Metadata
    var payees = mutableStateListOf<ActualPayee>()
    var accounts = mutableStateListOf<ActualAccount>()
    var categories = mutableStateListOf<ActualCategory>()

    open fun parseReceipt() {
        // This method should be overridden in the subclass to implement the parsing logic
        throw NotImplementedError("parseReceipt() must be implemented in the subclass")
    }

    open fun saveReceipt() {
        throw NotImplementedError("saveReceipt() must be implemented in the subclass")
    }

    fun updateReceipt(updater: (ParsedReceipt) -> ParsedReceipt) {
        // This method should be overridden in the subclass to implement the receipt update logic
        parsedReceipt = updater(parsedReceipt)
        // After updating the receipt, we should recalculate the totals
        calculateTotals()
    }
    fun calculateTotals() {
        totalItems.clear()
        // calculate totals per category

        // First, try to group the items by categories
        val uncategorizedKey = "uncategorized"
        val groupedItems = parsedReceipt.items.groupBy { it.actualCategory?.id ?: uncategorizedKey }

        // If there is only a single category, we can add one single transaction
        val categoryIds = groupedItems.keys.toList()

        categoryIds.forEach { categoryId ->
            val items = groupedItems[categoryId] ?: emptyList()
            val totalAmount = items.map { it.price.amountMultipledBy(it.quantity) }.amountSum()
            val categoryName = items.firstOrNull()?.actualCategory?.name ?: "Uncategorized"
            totalItems.add(TotalItem(label = categoryName, amount = totalAmount))
        }

        // Overall total
        val overallTotal = parsedReceipt.items.map { it.price.amountMultipledBy(it.quantity) }.amountSum()
        totalItems.add(TotalItem(label = "Total", amount = overallTotal, isTotal = true))
    }
}

class DefaultAddReceiptViewModel(
    val scannedReceiptRoute: ScannedReceiptRoute,
    val apiClient: APIClient,
    val navController: NavController,
): AddReceiptViewModel() {
    val scope: CoroutineScope = CoroutineScope(Dispatchers.Main)
    override fun parseReceipt() {
        // Logic to parse the scanned receipt text into a structured format
        // This could involve regex matching, string manipulation, or using a library
        // to extract relevant fields like date, amount, merchant, etc.

        scope.launch {
            try {
                isLoading = true

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

                // if rawScannedText is not blank, parse the receipt
                if (scannedReceiptRoute.rawScannedText.isNotBlank()) {
                    val response: ParsedReceiptResponse = apiClient.requestWithEndpoint(
                        endpoint = SmartPocketEndpoint.ParseReceipt(
                            receiptString = scannedReceiptRoute.rawScannedText
                        )
                    )
                    val parsedReceipt = response.data ?: throw Exception("No data found in response")
                    updateReceipt { parsedReceipt }
                }
            } catch (e: Exception) {
                errorString = e.message ?: "An error occurred while parsing the transaction."
                isLoading = false
                return@launch
            } finally {
                isLoading = false
            }
        }
    }

    override fun saveReceipt() {
        scope.launch {
            try {
                isLoading = true
                // TODO: Implement validation logic for the parsed receipt before saving

                // Save the parsed receipt to the server or database
                val response: AddReceiptResponse = apiClient.requestWithEndpoint(
                    endpoint = SmartPocketEndpoint.AddReceipt(
                        receiptRequest = AddReceiptRequest(
                            receipt = parsedReceipt
                        )
                    )
                )

                if(!response.success) {
                    throw Exception("Failed to save the receipt: ${response.errorMessage}")
                }

                // Handle the response as needed, e.g., navigate back or show a success message
                navController.popBackStack() // Navigate back to the previous screen
            } catch (e: Exception) {
                errorString = e.message ?: "An error occurred while saving the receipt."
            } finally {
                isLoading = false
            }
        }
    }
}