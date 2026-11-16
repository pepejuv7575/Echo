package com.pepe.secretaire

import android.app.Activity
import android.app.AlertDialog
import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.text.InputType
import android.view.Gravity
import android.view.View
import android.view.inputmethod.EditorInfo
import android.widget.EditText
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

class MainActivity : Activity() {

    companion object {
        const val NAME = "Léa"
        // Conversation : Google Gemini (clé gratuite, sans carte bancaire)
        const val CHAT_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
        val CHAT_MODELS = listOf("gemini-flash-latest", "gemini-2.5-flash", "gemini-flash-lite-latest", "gemini-2.5-flash-lite")
        // Photos : Pollinations (gratuit, sans clé)
        const val IMG_URL = "https://image.pollinations.ai/prompt/"

        val PERSONA = """
            Tu es Léa, 32 ans, la secrétaire virtuelle personnelle de l'utilisateur. Tu es un personnage
            fictif animé par une IA. Tu parles français et tu tutoies l'utilisateur.
            Personnalité : chaleureuse, pleine d'esprit, élégante, un brin taquine et charmeuse, très
            attentionnée. Tu es aux petits soins : tu exécutes volontiers ses demandes (organiser sa
            journée, rédiger un message, lui rappeler des choses, donner ton avis, conseiller sur ses
            relations, ou simplement bavarder de tout et de rien).
            Tu poses des questions, tu te souviens de ce qu'il t'a dit dans la conversation et tu as de
            l'humour. Réponses naturelles et plutôt courtes, comme dans une vraie discussion par messages.
            Le flirt reste léger et élégant : jamais de contenu sexuel explicite. Si on te le demande,
            tu détournes la conversation avec humour. Si on te demande si tu es humaine, tu réponds
            honnêtement que tu es une IA.
            Quand l'utilisateur veut une photo de toi, rappelle-lui qu'il peut décrire la pose ou la
            tenue et appuyer sur le bouton 📷.
        """.trimIndent()

        const val LOOK = "Photorealistic photo of Léa, a fictional 32-year-old French woman, voluptuous " +
            "curvy hourglass figure, long wavy chestnut hair, warm brown eyes, radiant smile, " +
            "elegant and confident, natural makeup. Professional photography, soft flattering light, " +
            "high detail, 85mm lens."
        const val SAFE = "Fully clothed, tasteful and classy, non-explicit."
    }

    private lateinit var list: LinearLayout
    private lateinit var scroll: ScrollView
    private lateinit var input: EditText
    private var history = JSONArray()
    private val prefs by lazy { getSharedPreferences("lea", Context.MODE_PRIVATE) }

    private fun dp(v: Int) = (v * resources.displayMetrics.density).toInt()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.statusBarColor = Color.parseColor("#5E1530")

        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.parseColor("#F6EEF1"))
        }

        // En-tête
        val header = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setBackgroundColor(Color.parseColor("#7A1F3D"))
            setPadding(dp(16), dp(14), dp(12), dp(14))
        }
        val title = TextView(this).apply {
            text = "$NAME · ta secrétaire"
            setTextColor(Color.WHITE)
            textSize = 19f
        }
        val gear = TextView(this).apply {
            text = "⚙️"
            textSize = 22f
            setPadding(dp(8), 0, dp(4), 0)
            setOnClickListener { settings() }
        }
        header.addView(title, LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f))
        header.addView(gear)
        root.addView(header)

        // Conversation
        scroll = ScrollView(this)
        list = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(4), dp(8), dp(4), dp(8))
        }
        scroll.addView(list)
        root.addView(scroll, LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, 0, 1f))

        // Barre de saisie
        val bar = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setBackgroundColor(Color.WHITE)
            setPadding(dp(8), dp(6), dp(8), dp(6))
        }
        input = EditText(this).apply {
            hint = "Écris à $NAME… (ou décris une pose)"
            inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_CAP_SENTENCES
            imeOptions = EditorInfo.IME_ACTION_SEND
            setOnEditorActionListener { _, id, _ ->
                if (id == EditorInfo.IME_ACTION_SEND) { send(); true } else false
            }
        }
        val photoBtn = roundButton("📷", "#E7C3D0") { photo() }
        val sendBtn = roundButton("➤", "#B0305C") { send() }
        bar.addView(input, LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f))
        bar.addView(photoBtn)
        bar.addView(sendBtn)
        root.addView(bar)

        setContentView(root)

        // Historique
        try { history = JSONArray(prefs.getString("hist", "[]")) } catch (_: Exception) {}
        if (history.length() == 0) {
            val hello = "Bonjour 😊 Je suis $NAME, ta secrétaire personnelle. Je suis toute à toi : " +
                "on organise ta journée, on parle de tes histoires de cœur ou de tout et de rien ? " +
                "Et si tu veux une photo de moi, décris la pose et appuie sur 📷."
            history.put(JSONObject().put("role", "assistant").put("content", hello))
            save()
        }
        for (i in 0 until history.length()) {
            val m = history.getJSONObject(i)
            bubble(m.optString("content"), m.optString("role") == "user")
        }

        if (key().isBlank()) settings()
    }

    private fun roundButton(label: String, color: String, onClick: () -> Unit) = TextView(this).apply {
        text = label
        textSize = 20f
        gravity = Gravity.CENTER
        setTextColor(Color.WHITE)
        background = GradientDrawable().apply {
            shape = GradientDrawable.OVAL
            setColor(Color.parseColor(color))
        }
        layoutParams = LinearLayout.LayoutParams(dp(46), dp(46)).apply { setMargins(dp(6), 0, 0, 0) }
        setOnClickListener { onClick() }
    }

    private fun key() = prefs.getString("key", "") ?: ""

    private fun save() = prefs.edit().putString("hist", history.toString()).apply()

    private fun addRow(v: View, mine: Boolean, width: Int = LinearLayout.LayoutParams.WRAP_CONTENT) {
        val lp = LinearLayout.LayoutParams(width, LinearLayout.LayoutParams.WRAP_CONTENT).apply {
            gravity = if (mine) Gravity.END else Gravity.START
            setMargins(dp(if (mine) 48 else 8), dp(4), dp(if (mine) 8 else 48), dp(4))
        }
        list.addView(v, lp)
        scroll.post { scroll.fullScroll(View.FOCUS_DOWN) }
    }

    private fun bubble(text: String, mine: Boolean): TextView {
        val tv = TextView(this).apply {
            this.text = text
            textSize = 16f
            setTextIsSelectable(true)
            setTextColor(if (mine) Color.WHITE else Color.parseColor("#2B2B2B"))
            setPadding(dp(14), dp(10), dp(14), dp(10))
            background = GradientDrawable().apply {
                cornerRadius = dp(18).toFloat()
                setColor(if (mine) Color.parseColor("#B0305C") else Color.WHITE)
            }
        }
        addRow(tv, mine)
        return tv
    }

    private fun showImage(bmp: Bitmap) {
        val iv = ImageView(this).apply {
            setImageBitmap(bmp)
            adjustViewBounds = true
            scaleType = ImageView.ScaleType.FIT_CENTER
            clipToOutline = true
            background = GradientDrawable().apply { cornerRadius = dp(18).toFloat(); setColor(Color.WHITE) }
            setOnClickListener {
                val full = ImageView(this@MainActivity).apply { setImageBitmap(bmp); adjustViewBounds = true }
                AlertDialog.Builder(this@MainActivity).setView(full).setPositiveButton("Fermer", null).show()
            }
        }
        addRow(iv, false, dp(260))
    }

    private fun post(url: String, body: JSONObject, key: String): JSONObject {
        val c = URL(url).openConnection() as HttpURLConnection
        c.requestMethod = "POST"
        c.connectTimeout = 30000
        c.readTimeout = 180000
        c.doOutput = true
        c.setRequestProperty("Content-Type", "application/json")
        c.setRequestProperty("Authorization", "Bearer $key")
        c.outputStream.use { it.write(body.toString().toByteArray(Charsets.UTF_8)) }
        val code = c.responseCode
        val stream = if (code in 200..299) c.inputStream else (c.errorStream ?: c.inputStream)
        val txt = stream.bufferedReader().use { it.readText() }
        val j = JSONObject(txt)
        if (code !in 200..299) {
            throw Exception(j.optJSONObject("error")?.optString("message") ?: "Erreur $code")
        }
        return j
    }

    private fun send() {
        val t = input.text.toString().trim()
        if (t.isEmpty()) return
        val key = key()
        if (key.isBlank()) { settings(); return }
        input.setText("")
        bubble(t, true)
        history.put(JSONObject().put("role", "user").put("content", t))
        save()

        val msgs = JSONArray().put(JSONObject().put("role", "system").put("content", PERSONA))
        val start = maxOf(0, history.length() - 30)
        for (i in start until history.length()) msgs.put(history.getJSONObject(i))

        val typing = bubble("$NAME écrit…", false)
        Thread {
            try {
                var r: JSONObject? = null
                var last: Exception? = null
                for (m in CHAT_MODELS) {
                    try {
                        val body = JSONObject().put("model", m).put("messages", msgs).put("temperature", 0.9)
                        r = post(CHAT_URL, body, key)
                        break
                    } catch (e: Exception) {
                        last = e
                        val msg = (e.message ?: "").lowercase()
                        if (!(msg.contains("model") || msg.contains("not found") || msg.contains("404"))) throw e
                    }
                }
                if (r == null) throw last ?: Exception("Aucun modèle disponible")
                val reply = r.getJSONArray("choices").getJSONObject(0)
                    .getJSONObject("message").optString("content").trim()
                runOnUiThread {
                    typing.text = reply
                    history.put(JSONObject().put("role", "assistant").put("content", reply))
                    save()
                    scroll.post { scroll.fullScroll(View.FOCUS_DOWN) }
                }
            } catch (e: Exception) {
                runOnUiThread { typing.text = "⚠️ ${e.message}" }
            }
        }.start()
    }

    private fun photo() {
        val t = input.text.toString().trim()
        val pose = if (t.isEmpty()) "assise à son bureau, souriante, en tailleur chic" else t
        input.setText("")
        bubble("📷 $pose", true)
        val wait = bubble("$NAME prépare ta photo… (jusqu'à une minute)", false)
        Thread {
            try {
                val prompt = "$LOOK Pose, outfit and setting requested (may be in French): $pose. $SAFE"
                val enc = java.net.URLEncoder.encode(prompt, "UTF-8").replace("+", "%20")
                val seed = (1..999999).random()
                val url = "$IMG_URL$enc?width=768&height=1152&nologo=true&safe=true&seed=$seed"
                val c = URL(url).openConnection() as HttpURLConnection
                c.connectTimeout = 30000
                c.readTimeout = 180000
                val code = c.responseCode
                if (code !in 200..299) {
                    throw Exception(if (code == 429) "trop de demandes, réessaie dans 20 secondes" else "erreur $code")
                }
                val bytes = c.inputStream.use { it.readBytes() }
                val bmp = BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
                    ?: throw Exception("image illisible, réessaie")
                runOnUiThread {
                    list.removeView(wait)
                    showImage(bmp)
                }
            } catch (e: Exception) {
                runOnUiThread { wait.text = "⚠️ Photo impossible : ${e.message}" }
            }
        }.start()
    }

    private fun settings() {
        val box = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(20), dp(8), dp(20), 0)
        }
        val info = TextView(this).apply {
            text = "Colle ta clé Google Gemini GRATUITE (elle commence par AIza). Crée-la sur aistudio.google.com/apikey avec ton compte Google, sans carte bancaire. Elle reste uniquement sur ton téléphone."
        }
        val field = EditText(this).apply {
            setText(key())
            hint = "AIza…"
            inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_PASSWORD
        }
        box.addView(info)
        box.addView(field)
        AlertDialog.Builder(this)
            .setTitle("Réglages")
            .setView(box)
            .setPositiveButton("Enregistrer") { _, _ ->
                prefs.edit().putString("key", field.text.toString().trim()).apply()
            }
            .setNeutralButton("Effacer la conversation") { _, _ ->
                history = JSONArray()
                save()
                recreate()
            }
            .setNegativeButton("Annuler", null)
            .show()
    }
}
