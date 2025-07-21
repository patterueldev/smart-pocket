package io.patterueldev.smartpocket

import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.toRoute
import io.patterueldev.smartpocket.scenes.parsedtransaction.DefaultParsedTransactionViewModel
import io.patterueldev.smartpocket.scenes.parsedtransaction.ParsedTransactionView
import io.patterueldev.smartpocket.scenes.parsedtransaction.ParsedTransactionViewModel
import io.patterueldev.smartpocket.shared.api.APIClient
import io.patterueldev.smartpocket.shared.api.APIClientConfiguration
import io.patterueldev.smartpocket.shared.api.APISessionManager
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
                    single<APIClient> {
                        APIClient(
                            configuration = APIClientConfiguration(
                                baseUrl = "https://savealong.mintfin.space", // TODO: Move to uncommitted config
                            ),
                            sessionManager = APISessionManager(),
                        )
                    }
                    viewModel { DashboardViewModel() }
                    viewModel <ParsedTransactionViewModel> { (scannedReceiptRoute: ScannedReceiptRoute) ->
                        DefaultParsedTransactionViewModel(scannedReceiptRoute, get())
                    }
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

            composable<ScannedReceiptRoute> { backStackEntry ->
                val scannedReceiptRoute: ScannedReceiptRoute = backStackEntry.toRoute()
                val viewModel: ParsedTransactionViewModel = koinViewModel(
                    parameters = { parametersOf(scannedReceiptRoute) }
                )
                ParsedTransactionView(viewModel)
            }
        }
    }
}