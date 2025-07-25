package io.patterueldev.savealong

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.safeContentPadding
import androidx.compose.material3.Button
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import org.jetbrains.compose.ui.tooling.preview.Preview

interface DashboardViewModel {
    fun onScanReceiptClick()
    fun onSyncClick()
}

@Composable
@Preview
fun App(
    viewModel: DashboardViewModel? = null
) {
    MaterialTheme {
        Column(
            modifier = Modifier
                .safeContentPadding()
                .fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text("Dashboard", style = MaterialTheme.typography.headlineMedium)
            Text("Lorem ipsum dolor sit amet, consectetur adipiscing elit.")
            Spacer(Modifier.height(24.dp))
            Button(
                onClick = {
                    viewModel?.onScanReceiptClick()
                },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(8.dp)
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.Start
                ) {
                    Text("Scan Receipt")
                    Text("Scan your receipts easily with your camera", style = MaterialTheme.typography.bodySmall)
                }
            }
            Spacer(Modifier.height(16.dp))
            Button(
                onClick = {
                    viewModel?.onSyncClick()
                },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(8.dp)
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.Start
                ) {
                    Text("Sync")
                    Text("Lipsum subtitle for sync action", style = MaterialTheme.typography.bodySmall)
                }
            }
        }
    }
}