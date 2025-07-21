package io.patterueldev.smartpocket.scenes.parsedtransaction

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberDatePickerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import kotlinx.datetime.Instant

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DateField(
    selectedDate: Instant,
    onDateSelected: (Instant) -> Unit,
) {
    // ✅ Control dialog visibility
    var showDatePicker: Boolean by remember { mutableStateOf(false) }

    // ✅ Show current date as text
    val formattedDate = remember(selectedDate) {
        selectedDate.toString() // Or format nicely
    }

    // ✅ Read-only textfield that triggers the dialog
    Box {
        OutlinedTextField(
            value = formattedDate,
            onValueChange = {},
            label = { Text("Date") },
            modifier = Modifier.Companion.fillMaxWidth(),
            readOnly = true,
            enabled = true,
        )
        // icon caret
        IconButton(
            onClick = { showDatePicker = true },
            modifier = Modifier.Companion.align(Alignment.Companion.CenterEnd)
        ) {
            Icon(
                imageVector = Icons.Default.CalendarToday,
                contentDescription = "Select Date"
            )
        }
    }

    // ✅ Show dialog when user taps
    if (showDatePicker) {
        val dateState = rememberDatePickerState(
            initialSelectedDateMillis = selectedDate.toEpochMilliseconds()
        )

        DatePickerDialog(
            onDismissRequest = { showDatePicker = false },
            confirmButton = {
                TextButton(
                    onClick = {
                        dateState.selectedDateMillis?.let { millis ->
                            onDateSelected(Instant.Companion.fromEpochMilliseconds(millis))
                        }
                        showDatePicker = false
                    }
                ) { Text("OK") }
            },
            dismissButton = {
                TextButton(onClick = { showDatePicker = false }) {
                    Text("Cancel")
                }
            }
        ) {
            DatePicker(state = dateState)
        }
    }
}