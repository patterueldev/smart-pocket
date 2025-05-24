package io.patterueldev.smartpocket.ui.category

import DynamicFormView
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import io.patterueldev.smartpocket.ui.dynamicform.FormField
import io.patterueldev.smartpocket.ui.utilities.PreviewScreen
import org.jetbrains.compose.ui.tooling.preview.Preview

abstract class CategoryEntryViewModel: ViewModel() {
    open var name: String by mutableStateOf("")
}

class DefaultCategoryEntryViewModel: CategoryEntryViewModel() {
    override var name: String by mutableStateOf("Test")
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CategoryEntryScreen(
    viewModel: CategoryEntryViewModel
) {
    val currencyOptions = listOf("USD", "PHP", "JPY")
    var currency by remember { mutableStateOf(currencyOptions.firstOrNull() ?: "") }
    val categories = listOf("Food", "Transport", "Shopping", "Bills")
    var category by remember { mutableStateOf(categories.firstOrNull() ?: "") }
    var remarks by remember { mutableStateOf("") }
    val accounts = listOf("Checking", "Credit Card", "Cash")
    var account by remember { mutableStateOf(accounts.firstOrNull() ?: "") }

    val fields = listOf(
        FormField.NumberField(
            label = "Name",
            value = viewModel.name,
            onValueChange = { viewModel.name = it }
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
            enabled = true,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Submit")
        }
    }
}

@Composable
@Preview
fun CategoryEntryScreenPreview() {
    PreviewScreen {
        CategoryEntryScreen(
            object : CategoryEntryViewModel() {
                override var name: String by mutableStateOf("Sample Category")
            }
        )
    }
}