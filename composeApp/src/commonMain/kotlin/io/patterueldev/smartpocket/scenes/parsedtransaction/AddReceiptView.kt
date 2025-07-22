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
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeContentPadding
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
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.navigation.NavHostController
import io.patterueldev.smartpocket.shared.extensions.toSnakeCase
import io.patterueldev.smartpocket.shared.models.ParsedReceiptItem
import kotlinx.datetime.LocalDateTime
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toInstant
import kotlinx.datetime.toLocalDateTime
import org.jetbrains.compose.ui.tooling.preview.Preview

@Composable
fun AddReceiptView(
    viewModel: AddReceiptViewModel,
    navController: NavHostController? = null,
) {
    LaunchedEffect(viewModel) {
        // Trigger loading of parsed transaction data
        viewModel.parseReceipt()
    }

    Column(modifier = Modifier.fillMaxSize()) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Start
        ) {
            TextButton(onClick = { navController?.popBackStack() }) {
                Text("Back")
            }
            Text(
                "Parsed Transaction",
                style = MaterialTheme.typography.headlineSmall,
                modifier = Modifier.weight(1f),
                textAlign = TextAlign.Center
            )
            TextButton(onClick = { viewModel.saveReceipt() }) {
                Text("Save")
            }
        }
        Spacer(modifier = Modifier.height(8.dp))

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
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun FormBody(viewModel: AddReceiptViewModel) {
    Text("Parsed Transaction", style = MaterialTheme.typography.headlineMedium)

    Spacer(Modifier.height(16.dp))

    // ✅ Date Field with DatePicker
    DateField(
        selectedDate = viewModel.parsedReceipt.date.toInstant(TimeZone.currentSystemDefault()),
        onDateSelected = { newDateInstant ->
            viewModel.updateReceipt { receipt ->
                val newDate: LocalDateTime = newDateInstant.toLocalDateTime(TimeZone.currentSystemDefault())
                receipt.copy(date = newDate) // Update the parsed receipt date
            }
        }
    )

    Spacer(Modifier.height(8.dp))

    // ✅ Merchant Dropdown
    DropdownField(
        label = "Payee",
        selectedItem = viewModel.parsedReceipt.actualPayee?.name,
        items = viewModel.payees,
        itemText = { it.name },
        onItemSelected = { selected ->
            viewModel.updateReceipt { receipt ->
                receipt.copy(
                    merchantKey = selected.name.toSnakeCase(),
                    actualPayee = selected
                )
            }
        }
    )

    Spacer(Modifier.height(8.dp))

    // ✅ Payment Method Dropdown
    DropdownField(
        label = "Account",
        selectedItem = viewModel.parsedReceipt.actualAccount?.name,
        items = viewModel.accounts,
        itemText = { it.name },
        onItemSelected = { selected ->
            viewModel.updateReceipt { receipt ->
                receipt.copy(
                    paymentMethodKey = selected.name.toSnakeCase(),
                    actualAccount = selected
                )
            }
        }
    )

    Spacer(Modifier.height(8.dp))

    // Totals Section
    TotalsView(viewModel)

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
            for (i in 0 until viewModel.parsedReceipt.items.size) {
                val item = viewModel.parsedReceipt.items[i]
                ItemRow(
                    viewModel = viewModel,
                    item = item,
                    onEdit = { updatedItem ->
                        // Update ViewModel's list
                        viewModel.updateReceipt { receipt ->
                            val updatedItems = receipt.items.toMutableList()
                            updatedItems[i] = updatedItem // Update the specific item
                            receipt.copy(items = updatedItems)
                        }
                    },
                    onDelete = {
                        // Remove item from ViewModel's list
                        viewModel.updateReceipt { receipt ->
                            val updatedItems = receipt.items.toMutableList()
                            updatedItems.removeAt(i) // Remove the specific item
                            receipt.copy(items = updatedItems)
                        }
                    }
                )
                if (i < viewModel.parsedReceipt.items.size - 1) {
                    HorizontalDivider(Modifier, DividerDefaults.Thickness, DividerDefaults.color)
                }
            }
        }
    }

    // ✅ Remarks Text View
    Spacer(Modifier.height(16.dp))

    var remarks: String by remember { mutableStateOf(viewModel.parsedReceipt.remarks) }

    Text("Remarks", style = MaterialTheme.typography.titleMedium)
    OutlinedTextField(
        value = remarks,
        onValueChange = { newRemarks ->
            viewModel.updateReceipt { receipt ->
                receipt.copy(remarks = newRemarks)
            }
        },
        label = { Text("Remarks") },
        modifier = Modifier.fillMaxWidth().onFocusChanged {
            // Update the ViewModel when the field loses focus
            viewModel.updateReceipt { receipt ->
                receipt.copy(remarks = remarks)
            }
        },
        maxLines = 5,
        singleLine = false
    )
}

@Composable
fun TotalsView(
    viewModel: AddReceiptViewModel
) {
    Spacer(Modifier.height(16.dp))
    Text("Total", style = MaterialTheme.typography.titleMedium)

    if (viewModel.totalItems.isEmpty()) {
        Text("No totals available", style = MaterialTheme.typography.bodyMedium)
    } else {
        Column {
            for (item in viewModel.totalItems) {
                var labelStyle = MaterialTheme.typography.bodyLarge
                var valueStyle = MaterialTheme.typography.bodyLarge
                if (item.isTotal) {
                    // Divider for the overall total
                    HorizontalDivider(
                        modifier = Modifier.padding(vertical = 8.dp),
                        thickness = DividerDefaults.Thickness,
                        color = MaterialTheme.colorScheme.primary
                    )

                    labelStyle = MaterialTheme.typography.headlineSmall
                    valueStyle = MaterialTheme.typography.headlineSmall
                }
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(item.label, style = labelStyle)
                    Text(item.amount.toString(), style = valueStyle)
                }
                Spacer(Modifier.height(4.dp))
            }
        }
    }
}

@Composable
fun ItemRow(
    viewModel: AddReceiptViewModel,
    item: ParsedReceiptItem,
    onEdit: (ParsedReceiptItem) -> Unit,
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
            Text("Raw Name: ${item.rawName}", style = MaterialTheme.typography.bodyLarge)
            Text("Name: ${item.name}", style = MaterialTheme.typography.bodyMedium)
            Text("Price: ${item.price}", style = MaterialTheme.typography.bodyMedium)
            Text("Quantity: ${item.quantity}", style = MaterialTheme.typography.bodyMedium)
            item.actualCategory?.name?.let {
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

                    var editedRawName by remember { mutableStateOf(item.rawName) }
                    var editedName by remember { mutableStateOf(item.name) }
                    var editedPrice by remember { mutableStateOf(item.price.toString()) }
                    var editedQuantity by remember { mutableStateOf(item.quantity.toString()) }
                    var editedCategory by remember { mutableStateOf(item.actualCategory) }

                    Spacer(Modifier.height(8.dp))

                    OutlinedTextField(
                        value = editedRawName,
                        onValueChange = { editedRawName = it },
                        label = { Text("Raw Name") },
                        modifier = Modifier.fillMaxWidth(),
                    )

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
                                price = editedPrice.toDouble(),
                                quantity = editedQuantity.toIntOrNull() ?: item.quantity,
                                categoryKey = editedCategory?.name?.toSnakeCase(),
                                actualCategory = editedCategory
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
    val viewModel = object : AddReceiptViewModel() {
        override fun parseReceipt() {
            isLoading = true
        }
        fun onBack() {}
        fun onSave() {}
    }
    AddReceiptView(viewModel)
}