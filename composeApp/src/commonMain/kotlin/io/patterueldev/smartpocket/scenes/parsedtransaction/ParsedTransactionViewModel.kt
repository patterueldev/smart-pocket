package io.patterueldev.smartpocket.scenes.parsedtransaction

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import io.patterueldev.smartpocket.ScannedReceiptRoute
import io.patterueldev.smartpocket.api.SmartPocketEndpoint
import io.patterueldev.smartpocket.shared.api.APIClient
import io.patterueldev.smartpocket.shared.models.ParsedTransactionResponse
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

abstract class ParsedTransactionViewModel(): ViewModel() {
    var isLoading: Boolean by mutableStateOf(true)
    var errorString: String? by mutableStateOf(null)
    var merchantString: String by mutableStateOf("")
    var dateString: String by mutableStateOf("")
    var paymentMethodString: String by mutableStateOf("")
    var items = mutableStateListOf<TransactionItem>()

    open fun parseTransaction() {
        // This method should be overridden in the subclass to implement the parsing logic
        throw NotImplementedError("parseTransaction() must be implemented in the subclass")
    }
}

data class TransactionItem(
    val name: String = "",
    val price: String = "",
    val quantity: Int = 1,
    val category: String? = null
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
            // Simulate parsing delay
            try {
                isLoading = true
                val response: ParsedTransactionResponse = apiClient.requestWithEndpoint(
                    endpoint = SmartPocketEndpoint.TransactionParse(
                        receiptString = scannedReceiptRoute.rawScannedText
                    )
                )
                val data = response.data ?: throw Exception("No data found in response")
                // Update the UI state with parsed data
                merchantString = data.merchant ?: "Unknown Merchant"
                dateString = data.dateString ?: "Unknown Date" // TODO: Convert to a more readable format
                paymentMethodString = data.paymentMethod ?: "Unknown Payment Method"
                items.clear()
                data.items.forEach { item ->
                    items.add(
                        TransactionItem(
                            name = item.name ?: "Unknown Item",
                            price = item.price ?: "0.00",
                            quantity = item.quantity,
                            category = item.category
                        )
                    )
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
}