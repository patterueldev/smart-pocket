package io.patterueldev.smartpocket

import androidx.compose.ui.window.ComposeUIViewController

fun MainViewController(
     viewModel: DashboardViewModel?
) = ComposeUIViewController { App(viewModel) }