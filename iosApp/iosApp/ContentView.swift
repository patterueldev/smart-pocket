import UIKit
import SwiftUI
import ComposeApp

struct ComposeView: UIViewControllerRepresentable {
    private let viewModel: DashboardViewModel?
    
    init(viewModel: DashboardViewModel?) {
        self.viewModel = viewModel
    }
    
    func makeUIViewController(context: Context) -> UIViewController {
        MainViewControllerKt.MainViewController(viewModel: viewModel)
    }

    func updateUIViewController(_ uiViewController: UIViewController, context: Context) {
    }
}

class DashboardViewModelImpl: ObservableObject, DashboardViewModel {
    @Published var isScanViewPresented: Bool = false
    
    func onScanReceiptClick() {
        isScanViewPresented.toggle()
    }
    
    func onSyncClick() {
        
    }
}

struct ContentView: View {
    @StateObject private var viewModel = DashboardViewModelImpl()

    var body: some View {
        ComposeView(viewModel: viewModel)
            .ignoresSafeArea(.keyboard) // Compose has own keyboard handler
            .sheet(isPresented: $viewModel.isScanViewPresented) {
                ScannerView()
            }
    }
}


