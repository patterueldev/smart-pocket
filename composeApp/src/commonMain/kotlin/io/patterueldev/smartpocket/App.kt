package io.patterueldev.smartpocket

import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.toRoute
import io.patterueldev.smartpocket.parsedtransaction.DefaultParsedTransactionViewModel
import io.patterueldev.smartpocket.parsedtransaction.ParsedTransactionView
import io.patterueldev.smartpocket.parsedtransaction.ParsedTransactionViewModel
import org.jetbrains.compose.ui.tooling.preview.Preview
import org.koin.compose.KoinApplication
import org.koin.compose.viewmodel.koinViewModel
import org.koin.core.module.dsl.viewModel
import org.koin.core.parameter.parametersOf
import org.koin.dsl.module

@Composable
@Preview
fun App(
    navController: NavHostController = rememberNavController(),
    receiptScannerPresenter: ReceiptScannerPresenter?,
) {
    KoinApplication(
        application = {
            modules(
                module {
                    viewModel { DashboardViewModel() }
                    viewModel <ParsedTransactionViewModel> { (scannedReceipt: ScannedReceipt) -> DefaultParsedTransactionViewModel(scannedReceipt) }
                },
                module {}
            )
        }
    ) {

    }
    MaterialTheme {
        NavHost(navController = navController, startDestination = "dashboard") {
            composable("dashboard") {
                DashboardView(receiptScannerPresenter, navController)
            }

            composable<ScannedReceipt> { backStackEntry ->
                val scannedReceipt: ScannedReceipt = backStackEntry.toRoute()
                val viewModel: ParsedTransactionViewModel = koinViewModel(
                    parameters = { parametersOf(scannedReceipt) }
                )
                ParsedTransactionView(viewModel)
            }
        }
    }
}