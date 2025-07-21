package io.patterueldev.smartpocket.scenes.parsedtransaction

import androidx.compose.foundation.background
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
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DividerDefaults
import org.jetbrains.compose.ui.tooling.preview.Preview

@Composable
fun ParsedTransactionView(
    viewModel: ParsedTransactionViewModel
) {
    LaunchedEffect(viewModel) {
        // Trigger loading of parsed transaction data
        viewModel.parseTransaction()
    }

    Box(modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .safeContentPadding()
                .padding(16.dp),
            horizontalAlignment = Alignment.Start
        ) {
            FormBody(viewModel)
        }

        if (viewModel.isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator()
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun FormBody(viewModel: ParsedTransactionViewModel) {
    Text("Parsed Transaction", style = MaterialTheme.typography.headlineMedium)

    Spacer(Modifier.height(16.dp))

    // ✅ Date Field with DatePicker
    DateField(
        selectedDate = viewModel.date,
        onDateSelected = { newDate ->
            viewModel.date = newDate // Update the ViewModel with the selected date
        }
    )

    Spacer(Modifier.height(8.dp))

    // ✅ Merchant Dropdown
    DropfownField(
        label = "Merchant",
        selectedItem = viewModel.payee?.name,
        items = listOf("Merchant 1", "Merchant 2", "Merchant 3"), // Replace with actual merchants
        onItemSelected = {

        }
    )

    Spacer(Modifier.height(8.dp))

    // ✅ Payment Method Dropdown
    DropfownField(
        label = "Payment Method",
        selectedItem = viewModel.account?.name,
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
        item.category?.name?.let {
            Text("Category: $it", style = MaterialTheme.typography.bodyMedium)
        }
        // Edit and Delete buttons can be added here
    }
}

@Composable
@Preview
fun ParsedTransactionViewPreview() {
    val viewModel = object : ParsedTransactionViewModel() {
        override fun parseTransaction() {
            isLoading = true
        }
    }
    ParsedTransactionView(viewModel)
}