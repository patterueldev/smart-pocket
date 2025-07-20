import UIKit
import SwiftUI
import ComposeApp

struct ComposeView: UIViewControllerRepresentable {
    private let viewModel: DashboardViewModelImpl?
    
    init(viewModel: DashboardViewModelImpl?) {
        self.viewModel = viewModel
    }
    
    func makeUIViewController(context: Context) -> UIViewController {
        MainViewControllerKt.MainViewController(receiptScannerPresenter: viewModel)
    }

    func updateUIViewController(_ uiViewController: UIViewController, context: Context) {
    }
}

class DashboardViewModelImpl: ObservableObject, ReceiptScannerPresenter {
    @Published var isScanViewPresented: Bool = false
    private var onReceiptScanned: ((String) -> Void)?

    func navigateToReceiptScanner(onReceiptScanned: @escaping (String) -> Void) {
        self.onReceiptScanned = onReceiptScanned
        isScanViewPresented.toggle()
    }
    
    func handleReceiptScanned(_ text: String) {
        onReceiptScanned?(text)
        onReceiptScanned = nil // clear after use if you want
    }
}

struct ContentView: View {
    @StateObject private var viewModel = DashboardViewModelImpl()

    var body: some View {
        ComposeView(viewModel: viewModel)
            .ignoresSafeArea(.keyboard) // Compose has own keyboard handler
            .sheet(isPresented: $viewModel.isScanViewPresented) {
                DocumentCameraView { text in
                    viewModel.isScanViewPresented.toggle()
                    viewModel.handleReceiptScanned(text)
                }
            }
    }
}
