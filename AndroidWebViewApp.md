# Creating an Android WebView App for Daksh

This guide shows how to create a simple Android app that wraps your Daksh web app in a WebView, allowing you to distribute it via the Google Play Store.

## Prerequisites

1. Install Android Studio from [developer.android.com](https://developer.android.com/studio)
2. Ensure you have a hosted version of your Daksh web app (e.g., on Vercel, Netlify, etc.)

## Steps to Create the Android App

### 1. Create a New Android Project

1. Open Android Studio
2. Click "New Project"
3. Select "Empty Views Activity" and click "Next"
4. Configure your project:
   - Name: "Daksh"
   - Package name: "io.daksh.app"
   - Language: Kotlin
   - Minimum SDK: API 21 (Android 5.0) or higher
5. Click "Finish"

### 2. Configure App Permissions

1. Open `AndroidManifest.xml` in the `app/src/main` directory
2. Add internet permission inside the `<manifest>` tag:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.CAMERA" /> <!-- For QR scanning -->
```

### 3. Configure the WebView

1. Open `activity_main.xml` in the `app/src/main/res/layout` directory
2. Replace the content with:

```xml
<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".MainActivity">

    <WebView
        android:id="@+id/webView"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />

    <ProgressBar
        android:id="@+id/progressBar"
        style="?android:attr/progressBarStyleLarge"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_centerInParent="true" />

</RelativeLayout>
```

### 4. Implement the WebView in MainActivity

1. Open `MainActivity.kt` in the `app/src/main/java/io/daksh/app` directory
2. Replace the content with:

```kotlin
package io.daksh.app

import android.annotation.SuppressLint
import android.os.Bundle
import android.view.View
import android.webkit.*
import android.widget.ProgressBar
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView
    private lateinit var progressBar: ProgressBar

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webView)
        progressBar = findViewById(R.id.progressBar)

        // Configure WebView
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            setGeolocationEnabled(true)
            setSupportZoom(false)
            useWideViewPort = true
            loadWithOverviewMode = true
            cacheMode = WebSettings.LOAD_DEFAULT
        }

        // Handle camera and file access for QR code scanning
        webView.settings.allowFileAccess = true
        webView.settings.allowContentAccess = true

        // Enable Chrome DevTools debugging on WebView
        WebView.setWebContentsDebuggingEnabled(true)

        // Handle WebView loading
        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView, url: String) {
                progressBar.visibility = View.GONE
            }

            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                return false
            }
        }

        // Handle JavaScript permissions
        webView.webChromeClient = object : WebChromeClient() {
            override fun onPermissionRequest(request: PermissionRequest) {
                runOnUiThread {
                    request.grant(request.resources)
                }
            }
        }

        // Load your web app URL
        webView.loadUrl("https://your-deployed-daksh-app.com")
    }

    // Handle back button presses within the WebView
    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
```

### 5. Update the App Icon

1. In Android Studio, right-click on the `app/src/main/res` directory
2. Select New > Image Asset
3. Select "Launcher Icons (Adaptive and Legacy)"
4. Browse for your Daksh app icon (use your 512x512 icon)
5. Configure as needed and click "Next" then "Finish"

### 6. Build the APK

1. Click on "Build" in the menu
2. Select "Build Bundle(s) / APK(s)"
3. Choose "Build APK(s)"
4. Once completed, click on "locate" to find your APK file

## Using PWA2APK Service (Alternative)

If you don't want to create the app manually, you can use the PWA2APK service:

1. Go to [https://pwa2apk.com/](https://pwa2apk.com/)
2. Enter your hosted PWA URL
3. Configure app details (name, icon, splash screen)
4. Generate and download your APK