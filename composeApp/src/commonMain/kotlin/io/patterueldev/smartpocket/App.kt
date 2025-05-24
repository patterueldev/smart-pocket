package io.patterueldev.smartpocket

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.safeContentPadding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import io.patterueldev.smartpocket.ui.transaction.TransactionEntryScreen
import org.jetbrains.compose.ui.tooling.preview.Preview

@Composable
@Preview
fun App() {
    MaterialTheme {
        var currentScreen by remember { mutableStateOf("home") }

        when (currentScreen) {
            "home" -> {
                TransactionEntryScreen()
            }

            "backup" -> {
                Column(
                    modifier = Modifier
                        .safeContentPadding()
                        .fillMaxSize(),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Button(onClick = { currentScreen = "transaction" }) {
                        Text("Click me!")
                    }
                }
            }
        }
    }
}