package io.patterueldev.smartpocket.scenes.parsedtransaction

import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeContentPadding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.DividerDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun ParsedTransactionView(
    viewModel: ParsedTransactionViewModel
) {
    LaunchedEffect(viewModel) {
        // Trigger loading of parsed transaction data
        viewModel.parseTransaction()
    }
    Column(
        modifier = Modifier
            .fillMaxSize()
            .safeContentPadding()
            .padding(16.dp),
        horizontalAlignment = Alignment.Start
    ) {
        if (viewModel.isLoading) {
            Text("Loading...", style = MaterialTheme.typography.bodyLarge)
            return@Column
        }
        if (viewModel.errorString != null) {
            Text("Error: ${viewModel.errorString}", style = MaterialTheme.typography.bodyLarge)
            return@Column
        }
        FormBody(viewModel)
    }
}

@Composable
private fun FormBody(viewModel: ParsedTransactionViewModel) {
    Text("Parsed Transaction", style = MaterialTheme.typography.headlineMedium)

    Spacer(Modifier.height(16.dp))

    // ✅ Date Field
    OutlinedTextField(
        value = viewModel.dateString,
        onValueChange = { /* TODO: date picker or manual edit */ },
        label = { Text("Date") },
        modifier = Modifier.fillMaxWidth()
    )

    Spacer(Modifier.height(8.dp))

    // ✅ Merchant Dropdown
    DropfownField(
        label = "Merchant",
        selectedItem = viewModel.merchantString,
        items = listOf("Merchant 1", "Merchant 2", "Merchant 3"), // Replace with actual merchants
        onItemSelected = {

        }
    )

    Spacer(Modifier.height(8.dp))

    // ✅ Payment Method Dropdown
    DropfownField(
        label = "Payment Method",
        selectedItem = viewModel.paymentMethodString,
        items = listOf("Cash", "Credit Card", "Debit Card", "Mobile Payment"), // Replace with actual methods
        onItemSelected = { /* update VM */ }
    )

    Spacer(Modifier.height(16.dp))

    // ✅ Items Section
    Text("Items", style = MaterialTheme.typography.titleMedium)
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .heightIn(min = 150.dp, max = 300.dp)
            .border(1.dp, MaterialTheme.colorScheme.outline)
            .padding(8.dp)
    ) {
        LazyColumn {
            items(viewModel.items) { item ->
                ItemRow(
                    item = item,
                    onEdit = { /* open edit dialog */ },
                    onDelete = { /* remove item */ }
                )
                HorizontalDivider(Modifier, DividerDefaults.Thickness, DividerDefaults.color)
            }
        }
    }
}

@Composable
private fun DropfownField(
    label: String,
    selectedItem: String?,
    items: List<String>,
    onItemSelected: (String) -> Unit
) {
    OutlinedTextField(
        value = selectedItem ?: "",
        onValueChange = { /* no-op, handled by dropdown */ },
        label = { Text(label) },
        modifier = Modifier.fillMaxWidth(),
        readOnly = true,
        trailingIcon = {
            // Icon for dropdown
        }
    )
    // Dropdown logic here
}

@Composable
fun ItemRow(
    item: TransactionItem,
    onEdit: () -> Unit,
    onDelete: () -> Unit
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Text("Name: ${item.name}", style = MaterialTheme.typography.bodyLarge)
        Text("Price: ${item.price}", style = MaterialTheme.typography.bodyMedium)
        Text("Quantity: ${item.quantity}", style = MaterialTheme.typography.bodyMedium)
        item.category?.let {
            Text("Category: $it", style = MaterialTheme.typography.bodyMedium)
        }
        // Edit and Delete buttons can be added here
    }
}