package io.patterueldev.smartpocket.parsedtransaction

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.safeContentPadding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier

@Composable
fun ParsedTransactionView(
    viewModel: ParsedTransactionViewModel
) {
    Column(
        modifier = Modifier.Companion
            .safeContentPadding()
            .fillMaxSize(),
        horizontalAlignment = Alignment.Companion.CenterHorizontally,
    ) {
        Text("Parsed Transaction", style = MaterialTheme.typography.headlineMedium)
        Text("Raw Scanned Text: ${viewModel.scannedReceipt.rawScannedText}")
        // Here you can display more parsed transaction details
    }
}