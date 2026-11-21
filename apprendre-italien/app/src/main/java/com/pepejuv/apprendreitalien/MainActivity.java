package com.pepejuv.apprendreitalien;

import android.app.Activity;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.util.Locale;

public class MainActivity extends Activity implements TextToSpeech.OnInitListener {

    private WebView web;
    private TextToSpeech tts;
    private volatile boolean ttsReady = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(0xFF00753A);
        web = new WebView(this);
        setContentView(web);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        web.setWebViewClient(new WebViewClient());
        web.addJavascriptInterface(new Bridge(), "Android");
        web.loadUrl("file:///android_asset/index.html");
        tts = new TextToSpeech(this, this);
    }

    @Override
    public void onInit(int status) {
        if (status == TextToSpeech.SUCCESS) {
            int r = tts.setLanguage(Locale.ITALIAN);
            ttsReady = r != TextToSpeech.LANG_MISSING_DATA && r != TextToSpeech.LANG_NOT_SUPPORTED;
            tts.setSpeechRate(0.8f);
        }
    }

    private class Bridge {
        @JavascriptInterface
        public boolean speak(String text) {
            if (!ttsReady || tts == null) return false;
            tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "it");
            return true;
        }
    }

    @Override
    public void onBackPressed() {
        web.evaluateJavascript("(window.goBack && goBack()) ? 'yes' : 'no'", value -> {
            if (value == null || !value.contains("yes")) {
                MainActivity.super.onBackPressed();
            }
        });
    }

    @Override
    protected void onDestroy() {
        if (tts != null) { tts.stop(); tts.shutdown(); }
        super.onDestroy();
    }
}
