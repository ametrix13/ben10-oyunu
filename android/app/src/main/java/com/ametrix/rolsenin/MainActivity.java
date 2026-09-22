package com.ametrix.rolsenin;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;

public class MainActivity extends Activity {
    private static final String GAME_URL = "https://wruxmjgzosrmblbkfwde.supabase.co/functions/v1/rol-senin-polish-web";
    private WebView webView;
    private LinearLayout errorView;
    private ProgressBar progressBar;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Window window = getWindow();
        window.setStatusBarColor(Color.TRANSPARENT);
        window.setNavigationBarColor(Color.TRANSPARENT);

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.rgb(245, 245, 247));
        root.setOnApplyWindowInsetsListener((v, insets) -> {
            if (android.os.Build.VERSION.SDK_INT >= 30) {
                android.graphics.Insets bars = insets.getInsets(
                    WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars()
                );
                v.setPadding(bars.left, bars.top, bars.right, bars.bottom);
            }
            return insets;
        });

        webView = new WebView(this);
        FrameLayout.LayoutParams webParams = new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
        );
        root.addView(webView, webParams);

        progressBar = new ProgressBar(this);
        FrameLayout.LayoutParams progressParams = new FrameLayout.LayoutParams(54, 54);
        progressParams.gravity = Gravity.CENTER;
        root.addView(progressBar, progressParams);

        errorView = new LinearLayout(this);
        errorView.setOrientation(LinearLayout.VERTICAL);
        errorView.setGravity(Gravity.CENTER);
        errorView.setPadding(48, 48, 48, 48);
        errorView.setBackgroundColor(Color.rgb(245, 245, 247));
        errorView.setVisibility(View.GONE);

        TextView errorTitle = new TextView(this);
        errorTitle.setText("Rol Senin açılamadı");
        errorTitle.setTextSize(22);
        errorTitle.setTextColor(Color.rgb(20, 20, 22));
        errorTitle.setGravity(Gravity.CENTER);
        errorTitle.setPadding(0, 0, 0, 14);
        errorView.addView(errorTitle);

        TextView errorText = new TextView(this);
        errorText.setText("İnternet bağlantını kontrol edip tekrar dene.");
        errorText.setTextSize(14);
        errorText.setTextColor(Color.rgb(100, 100, 108));
        errorText.setGravity(Gravity.CENTER);
        errorText.setPadding(0, 0, 0, 26);
        errorView.addView(errorText);

        TextView retry = new TextView(this);
        retry.setText("Tekrar Dene");
        retry.setTextSize(16);
        retry.setTextColor(Color.WHITE);
        retry.setGravity(Gravity.CENTER);
        retry.setBackgroundColor(Color.rgb(20, 20, 22));
        retry.setPadding(38, 18, 38, 18);
        retry.setOnClickListener(v -> {
            errorView.setVisibility(View.GONE);
            progressBar.setVisibility(View.VISIBLE);
            webView.setVisibility(View.VISIBLE);
            webView.loadUrl(GAME_URL);
        });
        errorView.addView(retry);

        FrameLayout.LayoutParams errorParams = new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
        );
        root.addView(errorView, errorParams);

        setContentView(root);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);

        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        cookieManager.setAcceptThirdPartyCookies(webView, true);

        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String host = uri.getHost();
                if (host != null && (
                    host.endsWith("supabase.co") ||
                    host.endsWith("githubusercontent.com") ||
                    host.endsWith("githack.com")
                )) {
                    return false;
                }
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, uri));
                } catch (Exception ignored) {
                }
                return true;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                progressBar.setVisibility(View.GONE);
                errorView.setVisibility(View.GONE);
                webView.setVisibility(View.VISIBLE);
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) {
                    progressBar.setVisibility(View.GONE);
                    webView.setVisibility(View.GONE);
                    errorView.setVisibility(View.VISIBLE);
                }
            }
        });

        if (savedInstanceState == null) {
            webView.loadUrl(GAME_URL);
        } else {
            webView.restoreState(savedInstanceState);
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        webView.saveState(outState);
        super.onSaveInstanceState(outState);
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
}
