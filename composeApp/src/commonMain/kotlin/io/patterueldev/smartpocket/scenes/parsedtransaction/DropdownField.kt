package io.patterueldev.smartpocket.scenes.parsedtransaction

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog

@Composable
fun <T> DropdownField(
    label: String,
    selectedItem: String?,
    items: List<T> = emptyList(),
    itemText: (T) -> String,
    onItemSelected: (T) -> Unit
) {
    var showPicker: Boolean by remember { mutableStateOf(false) }

    Box {
        OutlinedTextField(
            value = selectedItem ?: "",
            onValueChange = { /* no-op, handled by dropdown */ },
            label = { Text(label) },
            modifier = Modifier.Companion.fillMaxWidth(),
            readOnly = true,
            enabled = true,
            trailingIcon = {
                Icon(
                    imageVector = Icons.Default.ArrowDropDown,
                    contentDescription = "Select"
                )
            }
        )
        // icon caret
        IconButton(
            onClick = { showPicker = true },
            modifier = Modifier.Companion.align(Alignment.Companion.CenterEnd)
        ) {
            Icon(
                imageVector = Icons.Default.CalendarToday,
                contentDescription = "Select Date"
            )
        }
    }

    // Show dropdown when user taps
    if (showPicker) {
        Dialog(
            onDismissRequest = { showPicker = false }) {
            Box(
                modifier = Modifier.Companion
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.surface)
                    .padding(16.dp)
            ) {
                Column {
                    Text("Select $label", style = MaterialTheme.typography.titleMedium)
                    Spacer(Modifier.Companion.height(8.dp))
                    LazyColumn {
                        items(items) { item ->
                            Text(
                                text = itemText(item),
                                modifier = Modifier.Companion
                                    .fillMaxWidth()
                                    .clickable {
                                        onItemSelected(item)
                                        showPicker = false
                                    }
                                    .padding(8.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}