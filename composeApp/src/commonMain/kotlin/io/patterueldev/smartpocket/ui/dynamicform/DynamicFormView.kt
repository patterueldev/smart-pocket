import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MenuAnchorType
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import org.jetbrains.compose.ui.tooling.preview.Preview

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DynamicFormView(
    fields: List<FormField>,
    spacing: Int = 8,
) {
    Column {
        fields.forEach { field ->
            when (field) {
                is FormField.TextField -> {
                    OutlinedTextField(
                        value = field.value,
                        onValueChange = field.onValueChange,
                        label = { Text(field.label) },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
                is FormField.NumberField -> {
                    OutlinedTextField(
                        value = field.value,
                        onValueChange = { newValue ->
                            if (newValue.matches(Regex("^\\d*\\.?\\d{0,2}\$"))) {
                                field.onValueChange(newValue)
                            }
                        },
                        label = { Text(field.label) },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.fillMaxWidth()
                    )
                }
                is FormField.DropdownField -> {
                    var expanded by remember { mutableStateOf(false) }
                    ExposedDropdownMenuBox(
                        expanded = expanded,
                        onExpandedChange = { expanded = !expanded },
                    ) {
                        OutlinedTextField(
                            readOnly = true,
                            value = field.value,
                            onValueChange = {},
                            label = { Text(field.label) },
                            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },
                            modifier = Modifier
                                .fillMaxWidth()
                                .menuAnchor(MenuAnchorType.PrimaryNotEditable, true)
                        )
                        ExposedDropdownMenu(
                            expanded = expanded,
                            onDismissRequest = {
                                println("Dropdown dismissed")
                                expanded = false
                            },
                        ) {
                            field.options.forEach { selectionOption ->
                                DropdownMenuItem(
                                    text = { Text(selectionOption) },
                                    onClick = {
                                        field.onValueChange(selectionOption)
                                        expanded = false
                                    }
                                )
                            }
                        }
                    }
                }
                is FormField.MultilineField -> {
                    OutlinedTextField(
                        value = field.value,
                        onValueChange = field.onValueChange,
                        label = { Text(field.label) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(100.dp),
                        maxLines = 4
                    )
                }
            }
            Spacer(modifier = Modifier.height(spacing.dp))
        }
    }
}

@Composable
fun PreviewScreen(content: @Composable () -> Unit) {
    MaterialTheme {
        Surface(color = MaterialTheme.colorScheme.background) {
            Box(modifier = Modifier.height(640.dp)) {
                content()
            }
        }
    }
}

@Composable
@Preview
fun DynamicFormPreview() {
    val fields = listOf(
        FormField.TextField(
            label = "Name",
            value = "John Doe",
            onValueChange = {}
        ),
        FormField.NumberField(
            label = "Age",
            value = "30",
            onValueChange = {}
        ),
        // DropdownField with sample options
        FormField.DropdownField(
            label = "Country",
            options = listOf("USA", "Canada", "UK", "Australia"),
            value = "USA",
            onValueChange = {}
        ),
    )
    PreviewScreen {
        DynamicFormView(fields)
    }
}

sealed class FormField {
    data class TextField(
        val label: String,
        val value: String,
        val onValueChange: (String) -> Unit
    ) : FormField()

    data class NumberField(
        val label: String,
        val value: String,
        val onValueChange: (String) -> Unit
    ) : FormField()

    data class DropdownField(
        val label: String,
        val options: List<String>,
        val value: String,
        val onValueChange: (String) -> Unit
    ) : FormField()

    data class MultilineField(
        val label: String,
        val value: String,
        val onValueChange: (String) -> Unit
    ) : FormField()
}