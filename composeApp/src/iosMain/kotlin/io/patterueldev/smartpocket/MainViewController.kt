package io.patterueldev.smartpocket

import androidx.compose.ui.window.ComposeUIViewController

fun MainViewController(
     receiptScannerPresenter: ReceiptScannerPresenter?
) = ComposeUIViewController { App(
     receiptScannerPresenter = receiptScannerPresenter
) }