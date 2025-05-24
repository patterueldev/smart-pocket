package io.patterueldev.smartpocket.ui.transaction

import DynamicFormView
import FormField
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import org.jetbrains.compose.ui.tooling.preview.Preview

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TransactionEntryScreen() {
    var amount by remember { mutableStateOf("") }
    val currencyOptions = listOf("USD", "PHP", "JPY")
    var currency by remember { mutableStateOf(currencyOptions.firstOrNull() ?: "") }
    val categories = listOf("Food", "Transport", "Shopping", "Bills")
    var category by remember { mutableStateOf(categories.firstOrNull() ?: "") }
    var remarks by remember { mutableStateOf("") }
    val accounts = listOf("Checking", "Credit Card", "Cash")
    var account by remember { mutableStateOf(accounts.firstOrNull() ?: "") }

    val fields = listOf(
        FormField.NumberField(
            label = "Amount",
            value = amount,
            onValueChange = { amount = it }
        ),
        FormField.DropdownField(
            label = "Currency",
            options = currencyOptions,
            value = currency,
            onValueChange = { currency = it }
        ),
        FormField.DropdownField(
            label = "Account",
            options = accounts,
            value = account,
            onValueChange = { account = it }
        ),
        FormField.DropdownField(
            label = "Category",
            options = categories,
            value = category,
            onValueChange = { category = it }
        ),
        FormField.MultilineField(
            label = "Remarks / Notes",
            value = remarks,
            onValueChange = { remarks = it }
        )
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        DynamicFormView(fields)
        Spacer(modifier = Modifier.weight(1f))
        Button(
            onClick = {
                // TODO: Hook up submit logic with ViewModel
            },
            enabled = amount.isNotBlank() && category.isNotBlank(),
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Submit")
        }
    }
}

@Preview
@Composable
fun UpsertTransactionPreview() {
    Surface(color = MaterialTheme.colorScheme.background) {
        TransactionEntryScreen()
    }
}
