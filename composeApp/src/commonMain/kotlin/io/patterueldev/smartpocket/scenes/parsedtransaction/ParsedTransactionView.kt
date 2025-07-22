package io.patterueldev.smartpocket.scenes.parsedtransaction

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeContentPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DividerDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
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
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
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
    DropdownField(
        label = "Payee",
        selectedItem = viewModel.payee?.name,
        items = viewModel.payees,
        itemText = { it.name },
        onItemSelected = { selected ->
            viewModel.payee = selected
        }
    )

    Spacer(Modifier.height(8.dp))

    // ✅ Payment Method Dropdown
    DropdownField(
        label = "Account",
        selectedItem = viewModel.account?.name,
        items = viewModel.accounts,
        itemText = { it.name },
        onItemSelected = { selected ->
            viewModel.account = selected
        }
    )

    Spacer(Modifier.height(16.dp))

    // ✅ Items Section
    Text("Items", style = MaterialTheme.typography.titleMedium)
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, MaterialTheme.colorScheme.outline)
            .padding(8.dp)
    ) {
        Column {
            viewModel.items.forEach { item ->
                ItemRow(
                    viewModel = viewModel,
                    item = item,
                    onEdit = { updatedItem ->
                        // Update ViewModel's list
                        viewModel.updateItem(updatedItem)
                    },
                    onDelete = {
                        // Remove item from ViewModel's list
                        viewModel.removeItem(item) // make sure to have a prompt, if possible
                    }
                )
                HorizontalDivider(Modifier, DividerDefaults.Thickness, DividerDefaults.color)
            }
        }
    }
}

@Composable
fun ItemRow(
    viewModel: ParsedTransactionViewModel,
    item: TransactionItem,
    onEdit: (TransactionItem) -> Unit,
    onDelete: () -> Unit
) {
    var showEditDialog by remember { mutableStateOf(false) }
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(
            modifier = Modifier.weight(1f)
        ) {
            Text("Name: ${item.name}", style = MaterialTheme.typography.bodyLarge)
            Text("Price: ${item.price}", style = MaterialTheme.typography.bodyMedium)
            Text("Quantity: ${item.quantity}", style = MaterialTheme.typography.bodyMedium)
            item.category?.name?.let {
                Text("Category: $it", style = MaterialTheme.typography.bodyMedium)
            }
        }

        Column(
            horizontalAlignment = Alignment.End,
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            TextButton(onClick = { showEditDialog = true }) {
                Text("Edit")
            }
            TextButton(onClick = onDelete) {
                Text("Delete")
            }
        }
    }

    if (showEditDialog) {
        Dialog(
            onDismissRequest = {
                showEditDialog = false
            }
        ) {
            Box(
                modifier = Modifier.Companion
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.surface)
                    .padding(16.dp),
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("Edit Item", style = MaterialTheme.typography.headlineMedium)

                    var editedName by remember { mutableStateOf(item.name) }
                    var editedPrice by remember { mutableStateOf(item.price) }
                    var editedQuantity by remember { mutableStateOf(item.quantity.toString()) }
                    var editedCategory by remember { mutableStateOf(item.category) }

                    Spacer(Modifier.height(8.dp))

                    OutlinedTextField(
                        value = editedName,
                        onValueChange = { editedName = it },
                        label = { Text("Name") },
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(Modifier.height(8.dp))

                    OutlinedTextField(
                        value = editedPrice,
                        onValueChange = { editedPrice = it },
                        label = { Text("Price") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )

                    Spacer(Modifier.height(8.dp))

                    OutlinedTextField(
                        value = editedQuantity,
                        onValueChange = { editedQuantity = it.filter { ch -> ch.isDigit() } },
                        label = { Text("Quantity") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )

                    Spacer(Modifier.height(8.dp))

                    DropdownField(
                        label = "Category",
                        selectedItem = editedCategory?.name,
                        items = viewModel.categories, // replace with actual category list if available
                        itemText = { it.name },
                        onItemSelected = { selected -> editedCategory = selected }
                    )

                    Spacer(Modifier.height(16.dp))

                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        TextButton(onClick = {
                            val updatedItem = item.copy(
                                name = editedName,
                                price = editedPrice,
                                quantity = editedQuantity.toIntOrNull() ?: item.quantity,
                                category = editedCategory
                            )
                            onEdit(updatedItem) // pass back edited item to ViewModel
                            showEditDialog = false
                        }) {
                            Text("Save")
                        }
                        TextButton(onClick = { showEditDialog = false }) {
                            Text("Cancel")
                        }
                    }
                }
            }
        }
    }
}

@Composable
@Preview
fun ParsedTransactionViewPreview() {
    val viewModel = object : ParsedTransactionViewModel() {
        override fun parseTransaction() {
            isLoading = true
            items.add(
                TransactionItem(
                    idx = 0,
                    name = "Sample Item",
                    price = "11.11",
                    quantity = 1,
                    category = null
                )
            )
        }
    }
    ParsedTransactionView(viewModel)
}