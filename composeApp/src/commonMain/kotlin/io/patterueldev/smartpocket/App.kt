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
import io.patterueldev.smartpocket.ui.category.CategoryEntryScreen
import io.patterueldev.smartpocket.ui.category.CategoryEntryViewModel
import io.patterueldev.smartpocket.ui.category.DefaultCategoryEntryViewModel
import io.patterueldev.smartpocket.ui.dashboard.DashboardView
import org.jetbrains.compose.ui.tooling.preview.Preview
import org.koin.compose.KoinApplication
import org.koin.compose.viewmodel.koinViewModel
import org.koin.core.module.dsl.viewModel
import org.koin.dsl.module

@Composable
@Preview
fun App() {
    KoinApplication(
        application = {
            modules (
                module {
                    viewModel<CategoryEntryViewModel> { DefaultCategoryEntryViewModel() }
                },
                module {}
            )
        }
    ) {
        MaterialTheme {
            var currentScreen by remember { mutableStateOf("home") }
            when (currentScreen) {
                "home" -> {
                    DashboardView()
                }
                "category" -> {
                    CategoryEntryScreen(viewModel = koinViewModel<CategoryEntryViewModel>())
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
}