import Flutter
import MessageUI
import UIKit

@main
@objc class AppDelegate: FlutterAppDelegate, FlutterImplicitEngineDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  func didInitializeImplicitFlutterEngine(_ engineBridge: FlutterImplicitEngineBridge) {
    GeneratedPluginRegistrant.register(with: engineBridge.pluginRegistry)
    if let registrar = engineBridge.pluginRegistry.registrar(forPlugin: "MessageComposerPlugin") {
      MessageComposerPlugin.register(with: registrar)
    }
  }
}

/// Pay It Forward: shows Apple's "New iMessage" sheet inside the app with the friend and Steven
/// as recipients and the message filled in, then reports whether the user tapped Send or Cancel.
/// This is what the original app did, so the next friend's text can open as soon as one is sent.
final class MessageComposerPlugin: NSObject, FlutterPlugin, MFMessageComposeViewControllerDelegate {
  private var pending: FlutterResult?

  static func register(with registrar: FlutterPluginRegistrar) {
    let channel = FlutterMethodChannel(
      name: "org.hometownhero.app/message_composer",
      binaryMessenger: registrar.messenger()
    )
    registrar.addMethodCallDelegate(MessageComposerPlugin(), channel: channel)
  }

  func handle(_ call: FlutterMethodCall, result: @escaping FlutterResult) {
    guard call.method == "compose" else {
      result(FlutterMethodNotImplemented)
      return
    }
    guard MFMessageComposeViewController.canSendText(), pending == nil,
      let presenter = Self.topViewController()
    else {
      result("unavailable")
      return
    }
    let args = call.arguments as? [String: Any] ?? [:]
    let sheet = MFMessageComposeViewController()
    sheet.messageComposeDelegate = self
    sheet.recipients = args["recipients"] as? [String] ?? []
    sheet.body = args["body"] as? String ?? ""
    pending = result
    presenter.present(sheet, animated: true)
  }

  func messageComposeViewController(
    _ controller: MFMessageComposeViewController,
    didFinishWith outcome: MessageComposeResult
  ) {
    let value: String
    switch outcome {
    case .sent: value = "sent"
    case .failed: value = "failed"
    case .cancelled: value = "cancelled"
    @unknown default: value = "cancelled"
    }
    controller.dismiss(animated: true) { [weak self] in
      self?.pending?(value)
      self?.pending = nil
    }
  }

  private static func topViewController() -> UIViewController? {
    let scenes = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }
    let windows = scenes.flatMap { $0.windows }
    var top = (windows.first { $0.isKeyWindow } ?? windows.first)?.rootViewController
    while let presented = top?.presentedViewController {
      top = presented
    }
    return top
  }
}
