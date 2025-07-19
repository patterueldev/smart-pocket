//
//  ScannerView.swift
//  iosApp
//
//  Created by John Patrick Teruel on 7/19/25.
//

import SwiftUI
import VisionKit
import Vision

struct ScannerView: View {
    @State private var recognizedText: String = ""
    @State private var isShowingScanner = false

    var body: some View {
        VStack {
            if recognizedText.isEmpty {
                Button("Scan Document") {
                    isShowingScanner = true
                }
            } else {
                ScrollView {
                    Text(recognizedText)
                        .padding()
                }
                Button("Copy to Clipboard") {
                    UIPasteboard.general.string = recognizedText
                }
                .padding(.top)
                Button("Scan Another") {
                    recognizedText = ""
                }
                .padding(.top)
            }
        }
        .sheet(isPresented: $isShowingScanner) {
            DocumentCameraView { text in
                self.recognizedText = text
                self.isShowingScanner = false
            }
        }
    }
}

struct DocumentCameraView: UIViewControllerRepresentable {
    var completion: (String) -> Void

    func makeCoordinator() -> Coordinator {
        Coordinator(completion: completion)
    }

    func makeUIViewController(context: Context) -> VNDocumentCameraViewController {
        let scanner = VNDocumentCameraViewController()
        scanner.delegate = context.coordinator
        return scanner
    }

    func updateUIViewController(_ uiViewController: VNDocumentCameraViewController, context: Context) {
        // No update needed
    }

    class Coordinator: NSObject, VNDocumentCameraViewControllerDelegate {
        var completion: (String) -> Void
        init(completion: @escaping (String) -> Void) {
            self.completion = completion
        }

        func documentCameraViewController(_ controller: VNDocumentCameraViewController, didFinishWith scan: VNDocumentCameraScan) {
            var recognizedStrings: [String] = []
            let dispatchGroup = DispatchGroup()
            for pageIndex in 0..<scan.pageCount {
                let image = scan.imageOfPage(at: pageIndex)
                guard let cgImage = image.cgImage else { continue }
                dispatchGroup.enter()
                let requestHandler = VNImageRequestHandler(cgImage: cgImage, options: [:])
                let request = VNRecognizeTextRequest { (request, error) in
                    if let observations = request.results as? [VNRecognizedTextObservation] {
                        let text = observations.compactMap { $0.topCandidates(1).first?.string }.joined(separator: "\n")
                        recognizedStrings.append(text)
                    }
                    dispatchGroup.leave()
                }
                request.recognitionLevel = .accurate
                request.usesLanguageCorrection = true
                DispatchQueue.global(qos: .userInitiated).async {
                    try? requestHandler.perform([request])
                }
            }
            dispatchGroup.notify(queue: .main) {
                let fullText = recognizedStrings.joined(separator: "\n\n")
                self.completion(fullText)
            }
        }

        func documentCameraViewControllerDidCancel(_ controller: VNDocumentCameraViewController) {
            controller.dismiss(animated: true) {
                self.completion("")
            }
        }

        func documentCameraViewController(_ controller: VNDocumentCameraViewController, didFailWithError error: Error) {
            controller.dismiss(animated: true) {
                self.completion("Scanning failed: \(error.localizedDescription)")
            }
        }
    }
}

#Preview {
    ScannerView()
}
