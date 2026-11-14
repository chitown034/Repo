package com.active_duty.active_dutyMobile

import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        // Pay It Forward: opens the texting app with a group text to the friend and Steven,
        // with the message filled in (the same intent the original app used).
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, "org.hometownhero.app/message_composer")
            .setMethodCallHandler { call, result ->
                if (call.method != "compose") {
                    result.notImplemented()
                    return@setMethodCallHandler
                }
                val recipients = call.argument<List<String>>("recipients").orEmpty()
                val body = call.argument<String>("body").orEmpty()
                val intent = Intent(Intent.ACTION_SENDTO, Uri.parse("smsto:" + recipients.joinToString(";")))
                    .putExtra("sms_body", body)
                try {
                    startActivity(intent)
                    result.success("opened")
                } catch (e: ActivityNotFoundException) {
                    result.success("unavailable")
                }
            }
    }
}
