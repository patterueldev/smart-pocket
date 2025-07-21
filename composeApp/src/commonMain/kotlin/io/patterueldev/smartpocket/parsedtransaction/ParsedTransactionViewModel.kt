package io.patterueldev.smartpocket.parsedtransaction

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import io.patterueldev.smartpocket.ScannedReceipt
import io.patterueldev.smartpocket.shared.models.ParsedTransaction
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

abstract class ParsedTransactionViewModel(): ViewModel() {
    var isLoading: Boolean by mutableStateOf(false)
    var errorString: String? by mutableStateOf(null)
        private set
    var merchantString: String by mutableStateOf("")
        private set
    var dateString: String by mutableStateOf("")
        private set
    var paymentMethodString: String by mutableStateOf("")
        private set
    var items = mutableStateListOf<TransactionItem>()
        private set
}

data class TransactionItem(
    val name: String = "",
    val price: String = "",
    val quantity: Int = 1,
    val category: String? = null
)

class DefaultParsedTransactionViewModel(
    val scannedReceipt: ScannedReceipt,
): ParsedTransactionViewModel() {

    val scope: CoroutineScope = CoroutineScope(Dispatchers.Main)
    fun parseTransaction() {
        // Logic to parse the scanned receipt text into a structured format
        // This could involve regex matching, string manipulation, or using a library
        // to extract relevant fields like date, amount, merchant, etc.

        scope.launch {
            isLoading = true
            // Simulate parsing delay
            kotlinx.coroutines.delay(2000)
            // Here you would implement the actual parsing logic
            // For now, we just set isLoading to false after the delay
            isLoading = false
        }
    }
}