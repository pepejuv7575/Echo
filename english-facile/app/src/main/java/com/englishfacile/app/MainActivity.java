package com.englishfacile.app;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.speech.tts.Voice;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Locale;
import java.util.Set;

/**
 * English Facile : une WebView qui affiche l'application (assets/www)
 * + un pont JavaScript vers la synthèse vocale (TTS) et la reconnaissance
 * vocale d'Android, pour écouter et prononcer l'anglais.
 */
public class MainActivity extends Activity {

    private static final int REQ_MIC = 42;

    private WebView webView;
    private TextToSpeech tts;
    private boolean ttsReady = false;
    private SpeechRecognizer recognizer;
    private String pendingListenLang = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);
        webView.setBackgroundColor(Color.parseColor("#F5F3FF"));
        setContentView(webView);

        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setTextZoom(100);

        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String scheme = uri.getScheme();
                if ("http".equals(scheme) || "https".equals(scheme)) {
                    openExternal(uri.toString());
                    return true;
                }
                return false;
            }
        });

        webView.addJavascriptInterface(new Bridge(), "AndroidBridge");

        tts = new TextToSpeech(this, status -> {
            if (status == TextToSpeech.SUCCESS) {
                int r = tts.setLanguage(Locale.US);
                if (r == TextToSpeech.LANG_MISSING_DATA || r == TextToSpeech.LANG_NOT_SUPPORTED) {
                    tts.setLanguage(Locale.UK);
                }
                ttsReady = true;
                tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                    @Override public void onStart(String id) { js("window.onSpeakStart && window.onSpeakStart(" + JSONObject.quote(id) + ")"); }
                    @Override public void onDone(String id) { js("window.onSpeakDone && window.onSpeakDone(" + JSONObject.quote(id) + ")"); }
                    @Override public void onError(String id) { js("window.onSpeakDone && window.onSpeakDone(" + JSONObject.quote(id) + ")"); }
                });
                js("window.onTtsReady && window.onTtsReady()");
            }
        });

        webView.loadUrl("file:///android_asset/www/index.html");
    }

    private void js(final String code) {
        runOnUiThread(() -> {
            if (webView != null) webView.evaluateJavascript(code, null);
        });
    }

    private void openExternal(String url) {
        try {
            Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(i);
        } catch (Exception e) {
            js("window.toast && window.toast('Impossible d\\'ouvrir le lien')");
        }
    }

    /* ---------------- Reconnaissance vocale ---------------- */

    private void startListeningInternal(String lang) {
        if (!SpeechRecognizer.isRecognitionAvailable(this)) {
            js("window.onSpeechError && window.onSpeechError('unavailable')");
            return;
        }
        if (recognizer != null) {
            recognizer.destroy();
        }
        recognizer = SpeechRecognizer.createSpeechRecognizer(this);
        recognizer.setRecognitionListener(new RecognitionListener() {
            @Override public void onReadyForSpeech(Bundle params) { js("window.onSpeechReady && window.onSpeechReady()"); }
            @Override public void onBeginningOfSpeech() {}
            @Override public void onRmsChanged(float rmsdB) {}
            @Override public void onBufferReceived(byte[] buffer) {}
            @Override public void onEndOfSpeech() { js("window.onSpeechEnd && window.onSpeechEnd()"); }
            @Override public void onError(int error) {
                String code;
                switch (error) {
                    case SpeechRecognizer.ERROR_NO_MATCH: code = "nomatch"; break;
                    case SpeechRecognizer.ERROR_SPEECH_TIMEOUT: code = "timeout"; break;
                    case SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS: code = "permission"; break;
                    case SpeechRecognizer.ERROR_NETWORK:
                    case SpeechRecognizer.ERROR_NETWORK_TIMEOUT: code = "network"; break;
                    default: code = "error" + error;
                }
                js("window.onSpeechError && window.onSpeechError(" + JSONObject.quote(code) + ")");
            }
            @Override public void onResults(Bundle results) {
                ArrayList<String> list = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                JSONArray arr = new JSONArray();
                if (list != null) for (String t : list) arr.put(t);
                js("window.onSpeechResult && window.onSpeechResult(" + arr.toString() + ")");
            }
            @Override public void onPartialResults(Bundle partialResults) {}
            @Override public void onEvent(int eventType, Bundle params) {}
        });

        Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, lang);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, lang);
        intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 5);
        intent.putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, getPackageName());
        recognizer.startListening(intent);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQ_MIC) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                if (pendingListenLang != null) startListeningInternal(pendingListenLang);
            } else {
                js("window.onSpeechError && window.onSpeechError('permission')");
            }
            pendingListenLang = null;
        }
    }

    /* ---------------- Pont JavaScript ---------------- */

    public class Bridge {
        @JavascriptInterface
        public boolean isNative() { return true; }

        @JavascriptInterface
        public boolean ttsReady() { return ttsReady; }

        /** pitch : 1.0 normal ; voiceHint : "male" / "female" / "" */
        @JavascriptInterface
        public void speak(String text, float rate, float pitch, String id, String voiceHint) {
            if (!ttsReady) {
                js("window.onSpeakDone && window.onSpeakDone(" + JSONObject.quote(id) + ")");
                return;
            }
            try {
                applyVoiceHint(voiceHint);
            } catch (Exception ignored) {}
            tts.setSpeechRate(rate <= 0 ? 0.9f : rate);
            tts.setPitch(pitch <= 0 ? 1.0f : pitch);
            Bundle params = new Bundle();
            tts.speak(text, TextToSpeech.QUEUE_FLUSH, params, id);
        }

        @JavascriptInterface
        public void stopSpeaking() {
            if (tts != null) tts.stop();
        }

        @JavascriptInterface
        public void startListening(final String lang) {
            runOnUiThread(() -> {
                if (Build.VERSION.SDK_INT >= 23 &&
                        checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
                    pendingListenLang = lang;
                    requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, REQ_MIC);
                } else {
                    startListeningInternal(lang);
                }
            });
        }

        @JavascriptInterface
        public void stopListening() {
            runOnUiThread(() -> { if (recognizer != null) recognizer.stopListening(); });
        }

        @JavascriptInterface
        public void openUrl(String url) {
            openExternal(url);
        }

        @JavascriptInterface
        public void exitApp() {
            runOnUiThread(MainActivity.this::finish);
        }
    }

    private String lastVoiceHint = "";

    private void applyVoiceHint(String hint) {
        if (hint == null) hint = "";
        if (hint.equals(lastVoiceHint)) return;
        lastVoiceHint = hint;
        Set<Voice> voices = tts.getVoices();
        if (voices == null) return;
        Voice best = null;
        for (Voice v : voices) {
            Locale l = v.getLocale();
            if (l == null || !"en".equals(l.getLanguage())) continue;
            if (v.isNetworkConnectionRequired()) continue;
            String name = v.getName().toLowerCase(Locale.ROOT);
            boolean wantMale = hint.equals("male");
            boolean isMale = name.contains("male") && !name.contains("female")
                    || name.contains("#male") || name.contains("-iom") || name.contains("-iol");
            boolean isFemale = name.contains("female") || name.contains("-iob") || name.contains("-sfg") || name.contains("-tpf");
            if (hint.isEmpty()) {
                if ("US".equals(l.getCountry())) { best = v; break; }
            } else if (wantMale && isMale) { best = v; break; }
            else if (!wantMale && isFemale) { best = v; break; }
        }
        if (best != null) tts.setVoice(best);
        else tts.setLanguage(Locale.US);
    }

    @Override
    public void onBackPressed() {
        webView.evaluateJavascript("(window.goBack ? window.goBack() : false)", value -> {
            if (!"true".equals(value)) {
                MainActivity.super.onBackPressed();
            }
        });
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (tts != null) tts.stop();
    }

    @Override
    protected void onDestroy() {
        if (tts != null) { tts.stop(); tts.shutdown(); }
        if (recognizer != null) recognizer.destroy();
        if (webView != null) webView.destroy();
        super.onDestroy();
    }
}
