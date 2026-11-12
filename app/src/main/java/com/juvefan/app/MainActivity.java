package com.juvefan.app;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.TypedValue;
import android.util.Xml;
import android.view.Gravity;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

import org.json.JSONArray;
import org.json.JSONObject;
import org.xmlpull.v1.XmlPullParser;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.TimeZone;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class MainActivity extends Activity {

    // TheSportsDB (clé gratuite publique), Juventus = 133676, Serie A = 4332
    private static final String API = "https://www.thesportsdb.com/api/v1/json/123/";
    private static final String TEAM = "133676";
    private static final String LEAGUE = "4332";

    private static final int BG = Color.parseColor("#0B0B0B");
    private static final int CARD = Color.parseColor("#1C1C1C");
    private static final int GOLD = Color.parseColor("#D4AF37");
    private static final int GREY = Color.parseColor("#A0A0A0");

    private static final String[] TABS = {"Matchs", "Actus", "Mercato", "Joueurs", "Vidéos"};

    private LinearLayout content;
    private ScrollView scroll;
    private final TextView[] tabViews = new TextView[TABS.length];
    private int currentTab = 0;
    private int token = 0;

    private final ExecutorService pool = Executors.newFixedThreadPool(3);
    private final Handler main = new Handler(Looper.getMainLooper());

    // ---------- Modèle simple de ligne ----------
    private static class Row {
        static final int SECTION = 0, CARD = 1, TABLE = 2, INFO = 3;
        int type; String title, sub, meta, url; boolean highlight;
        Row(int type, String title, String sub, String meta, String url) {
            this.type = type; this.title = title; this.sub = sub; this.meta = meta; this.url = url;
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(BG);

        // En-tête
        LinearLayout header = new LinearLayout(this);
        header.setOrientation(LinearLayout.HORIZONTAL);
        header.setGravity(Gravity.CENTER_VERTICAL);
        header.setPadding(dp(16), dp(14), dp(12), dp(14));
        header.setBackgroundColor(Color.BLACK);

        TextView title = new TextView(this);
        title.setText("JUVE FAN");
        title.setTextColor(Color.WHITE);
        title.setTextSize(TypedValue.COMPLEX_UNIT_SP, 22);
        title.setTypeface(Typeface.DEFAULT_BOLD);
        title.setLetterSpacing(0.15f);
        header.addView(title, new LinearLayout.LayoutParams(0, -2, 1f));

        TextView refresh = new TextView(this);
        refresh.setText("⟳");
        refresh.setTextColor(GOLD);
        refresh.setTextSize(TypedValue.COMPLEX_UNIT_SP, 26);
        refresh.setPadding(dp(12), 0, dp(8), 0);
        refresh.setOnClickListener(v -> showTab(currentTab));
        header.addView(refresh);
        root.addView(header);

        View line = new View(this);
        line.setBackgroundColor(GOLD);
        root.addView(line, new LinearLayout.LayoutParams(-1, dp(2)));

        // Contenu défilant
        scroll = new ScrollView(this);
        content = new LinearLayout(this);
        content.setOrientation(LinearLayout.VERTICAL);
        content.setPadding(dp(12), dp(8), dp(12), dp(16));
        scroll.addView(content);
        root.addView(scroll, new LinearLayout.LayoutParams(-1, 0, 1f));

        // Barre d'onglets
        LinearLayout bar = new LinearLayout(this);
        bar.setOrientation(LinearLayout.HORIZONTAL);
        bar.setBackgroundColor(Color.BLACK);
        for (int i = 0; i < TABS.length; i++) {
            final int idx = i;
            TextView t = new TextView(this);
            t.setText(TABS[i]);
            t.setGravity(Gravity.CENTER);
            t.setTextSize(TypedValue.COMPLEX_UNIT_SP, 13);
            t.setPadding(0, dp(14), 0, dp(14));
            t.setOnClickListener(v -> showTab(idx));
            tabViews[i] = t;
            bar.addView(t, new LinearLayout.LayoutParams(0, -2, 1f));
        }
        root.addView(bar);

        setContentView(root);
        showTab(0);
    }

    @Override
    protected void onDestroy() {
        pool.shutdownNow();
        super.onDestroy();
    }

    // ---------- Navigation ----------
    private void showTab(int idx) {
        currentTab = idx;
        for (int i = 0; i < tabViews.length; i++) {
            tabViews[i].setTextColor(i == idx ? GOLD : GREY);
            tabViews[i].setTypeface(i == idx ? Typeface.DEFAULT_BOLD : Typeface.DEFAULT);
        }
        content.removeAllViews();
        addInfo("Chargement…");
        scroll.scrollTo(0, 0);
        final int myToken = ++token;
        pool.execute(() -> {
            List<Row> rows = new ArrayList<>();
            switch (idx) {
                case 0: loadMatches(rows); break;
                case 1: loadNews(rows, "Actualité de la Juventus", "Juventus Turin"); break;
                case 2: loadNews(rows, "Mercato & transferts", "Juventus mercato OR transfert"); break;
                case 3: loadPlayers(rows); break;
                default: loadVideos(rows); break;
            }
            main.post(() -> { if (myToken == token) render(rows); });
        });
    }

    // ---------- Chargement des données (thread de fond) ----------
    private void loadMatches(List<Row> rows) {
        rows.add(new Row(Row.SECTION, "Prochains matchs", null, null, null));
        try {
            JSONArray ev = new JSONObject(download(API + "eventsnext.php?id=" + TEAM)).optJSONArray("events");
            if (ev == null || ev.length() == 0) rows.add(info("Aucun match programmé trouvé."));
            else for (int i = 0; i < ev.length(); i++) {
                JSONObject e = ev.getJSONObject(i);
                rows.add(new Row(Row.CARD, s(e, "strHomeTeam") + "  vs  " + s(e, "strAwayTeam"),
                        s(e, "strLeague") + (s(e, "strVenue").isEmpty() ? "" : " · " + s(e, "strVenue")),
                        matchDate(e), null));
            }
        } catch (Exception ex) { rows.add(info("Matchs indisponibles (" + ex.getMessage() + ")")); }

        rows.add(new Row(Row.SECTION, "Derniers résultats", null, null, null));
        try {
            JSONArray ev = new JSONObject(download(API + "eventslast.php?id=" + TEAM)).optJSONArray("results");
            if (ev == null || ev.length() == 0) rows.add(info("Aucun résultat trouvé."));
            else for (int i = 0; i < ev.length(); i++) {
                JSONObject e = ev.getJSONObject(i);
                rows.add(new Row(Row.CARD, score(e), s(e, "strLeague"),
                        matchDate(e) + "  ·  ▶ Voir les buts", highlightUrl(e)));
            }
        } catch (Exception ex) { rows.add(info("Résultats indisponibles (" + ex.getMessage() + ")")); }

        rows.add(new Row(Row.SECTION, "Classement Serie A " + season(), null, null, null));
        try {
            JSONArray t = new JSONObject(download(API + "lookuptable.php?l=" + LEAGUE + "&s=" + season()))
                    .optJSONArray("table");
            if (t == null || t.length() == 0) rows.add(info("Classement indisponible."));
            else for (int i = 0; i < t.length(); i++) {
                JSONObject e = t.getJSONObject(i);
                Row r = new Row(Row.TABLE, s(e, "intRank") + ".  " + s(e, "strTeam"),
                        s(e, "intPlayed") + " J", s(e, "intPoints") + " pts", null);
                r.highlight = s(e, "strTeam").toLowerCase(Locale.ROOT).contains("juventus");
                rows.add(r);
            }
        } catch (Exception ex) { rows.add(info("Classement indisponible (" + ex.getMessage() + ")")); }
    }

    private void loadNews(List<Row> rows, String section, String query) {
        rows.add(new Row(Row.SECTION, section, null, null, null));
        try {
            List<Row> items = rss(query, 40);
            if (items.isEmpty()) rows.add(info("Aucun article trouvé."));
            rows.addAll(items);
        } catch (Exception ex) { rows.add(info("Articles indisponibles (" + ex.getMessage() + ")")); }
    }

    private void loadPlayers(List<Row> rows) {
        rows.add(new Row(Row.SECTION, "Le quotidien des joueurs", null, null, null));
        try {
            List<Row> items = rss("Juventus joueur OR joueurs OR entraînement", 20);
            if (items.isEmpty()) rows.add(info("Aucun article trouvé."));
            rows.addAll(items);
        } catch (Exception ex) { rows.add(info("Articles indisponibles (" + ex.getMessage() + ")")); }

        rows.add(new Row(Row.SECTION, "Effectif", null, null, null));
        try {
            JSONArray p = new JSONObject(download(API + "lookup_all_players.php?id=" + TEAM)).optJSONArray("player");
            if (p == null || p.length() == 0) rows.add(info("Effectif indisponible."));
            else for (int i = 0; i < p.length(); i++) {
                JSONObject e = p.getJSONObject(i);
                String num = s(e, "strNumber");
                String name = (num.isEmpty() ? "" : num + "  ") + s(e, "strPlayer");
                String born = s(e, "dateBorn");
                String sub = s(e, "strPosition") + (s(e, "strNationality").isEmpty() ? "" : " · " + s(e, "strNationality"));
                rows.add(new Row(Row.CARD, name, sub, born.isEmpty() ? "" : "Né le " + born,
                        "https://www.google.com/search?q=" + enc(s(e, "strPlayer") + " Juventus")));
            }
        } catch (Exception ex) { rows.add(info("Effectif indisponible (" + ex.getMessage() + ")")); }
    }

    private void loadVideos(List<Row> rows) {
        rows.add(new Row(Row.SECTION, "Buts des derniers matchs", null, null, null));
        try {
            JSONArray ev = new JSONObject(download(API + "eventslast.php?id=" + TEAM)).optJSONArray("results");
            if (ev == null || ev.length() == 0) rows.add(info("Aucun match récent."));
            else for (int i = 0; i < ev.length(); i++) {
                JSONObject e = ev.getJSONObject(i);
                rows.add(new Row(Row.CARD, "▶  " + score(e), s(e, "strLeague"), matchDate(e), highlightUrl(e)));
            }
        } catch (Exception ex) { rows.add(info("Matchs indisponibles (" + ex.getMessage() + ")")); }

        rows.add(new Row(Row.SECTION, "Chaînes officielles", null, null, null));
        rows.add(new Row(Row.CARD, "▶  Juventus (YouTube officiel)", "Résumés, buts, coulisses", "",
                "https://www.youtube.com/@juventus/videos"));
        rows.add(new Row(Row.CARD, "▶  Serie A (YouTube officiel)", "Résumés de tous les matchs", "",
                "https://www.youtube.com/@SerieA/videos"));
        rows.add(new Row(Row.CARD, "▶  Tous les buts de la Juve", "Recherche YouTube", "",
                "https://www.youtube.com/results?search_query=" + enc("Juventus tous les buts highlights")));

        rows.add(new Row(Row.SECTION, "Vidéos dans l'actualité", null, null, null));
        try { rows.addAll(rss("Juventus vidéo but", 15)); }
        catch (Exception ex) { rows.add(info("Indisponible (" + ex.getMessage() + ")")); }
    }

    // ---------- Affichage ----------
    private void render(List<Row> rows) {
        content.removeAllViews();
        for (Row r : rows) {
            switch (r.type) {
                case Row.SECTION: addSection(r.title); break;
                case Row.INFO: addInfo(r.title); break;
                case Row.TABLE: addTableRow(r); break;
                default: addCard(r); break;
            }
        }
    }

    private void addSection(String text) {
        TextView t = new TextView(this);
        t.setText(text.toUpperCase(Locale.FRENCH));
        t.setTextColor(GOLD);
        t.setTypeface(Typeface.DEFAULT_BOLD);
        t.setTextSize(TypedValue.COMPLEX_UNIT_SP, 14);
        t.setLetterSpacing(0.08f);
        t.setPadding(dp(4), dp(18), dp(4), dp(8));
        content.addView(t);
    }

    private void addInfo(String text) {
        TextView t = new TextView(this);
        t.setText(text);
        t.setTextColor(GREY);
        t.setTextSize(TypedValue.COMPLEX_UNIT_SP, 14);
        t.setPadding(dp(4), dp(8), dp(4), dp(8));
        content.addView(t);
    }

    private void addCard(Row r) {
        LinearLayout card = new LinearLayout(this);
        card.setOrientation(LinearLayout.VERTICAL);
        card.setPadding(dp(14), dp(12), dp(14), dp(12));
        GradientDrawable bg = new GradientDrawable();
        bg.setColor(CARD);
        bg.setCornerRadius(dp(12));
        card.setBackground(bg);

        TextView t = new TextView(this);
        t.setText(r.title);
        t.setTextColor(Color.WHITE);
        t.setTypeface(Typeface.DEFAULT_BOLD);
        t.setTextSize(TypedValue.COMPLEX_UNIT_SP, 15);
        card.addView(t);

        if (r.sub != null && !r.sub.isEmpty()) {
            TextView s = new TextView(this);
            s.setText(r.sub);
            s.setTextColor(GREY);
            s.setTextSize(TypedValue.COMPLEX_UNIT_SP, 13);
            s.setPadding(0, dp(4), 0, 0);
            card.addView(s);
        }
        if (r.meta != null && !r.meta.isEmpty()) {
            TextView m = new TextView(this);
            m.setText(r.meta);
            m.setTextColor(GOLD);
            m.setTextSize(TypedValue.COMPLEX_UNIT_SP, 12);
            m.setPadding(0, dp(6), 0, 0);
            card.addView(m);
        }
        if (r.url != null) {
            final String url = r.url;
            card.setOnClickListener(v -> open(url));
        }
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(-1, -2);
        lp.setMargins(0, dp(4), 0, dp(4));
        content.addView(card, lp);
    }

    private void addTableRow(Row r) {
        LinearLayout row = new LinearLayout(this);
        row.setOrientation(LinearLayout.HORIZONTAL);
        row.setPadding(dp(12), dp(8), dp(12), dp(8));
        if (r.highlight) {
            GradientDrawable bg = new GradientDrawable();
            bg.setColor(Color.parseColor("#2A2410"));
            bg.setStroke(dp(1), GOLD);
            bg.setCornerRadius(dp(8));
            row.setBackground(bg);
        }
        TextView name = new TextView(this);
        name.setText(r.title);
        name.setTextColor(r.highlight ? GOLD : Color.WHITE);
        name.setTextSize(TypedValue.COMPLEX_UNIT_SP, 14);
        if (r.highlight) name.setTypeface(Typeface.DEFAULT_BOLD);
        row.addView(name, new LinearLayout.LayoutParams(0, -2, 1f));

        TextView played = new TextView(this);
        played.setText(r.sub);
        played.setTextColor(GREY);
        played.setTextSize(TypedValue.COMPLEX_UNIT_SP, 13);
        played.setPadding(dp(8), 0, dp(12), 0);
        row.addView(played);

        TextView pts = new TextView(this);
        pts.setText(r.meta);
        pts.setTextColor(Color.WHITE);
        pts.setTypeface(Typeface.DEFAULT_BOLD);
        pts.setTextSize(TypedValue.COMPLEX_UNIT_SP, 14);
        row.addView(pts);
        content.addView(row);
    }

    private void open(String url) {
        try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url))); }
        catch (Exception ignored) { }
    }

    // ---------- Outils ----------
    private int dp(int v) {
        return Math.round(v * getResources().getDisplayMetrics().density);
    }

    private static Row info(String text) { return new Row(Row.INFO, text, null, null, null); }

    private static String s(JSONObject o, String k) {
        if (o.isNull(k)) return "";
        String v = o.optString(k, "");
        return "null".equals(v) ? "" : v.trim();
    }

    private static String enc(String v) {
        try { return URLEncoder.encode(v, "UTF-8"); } catch (Exception e) { return v; }
    }

    private static String season() {
        java.util.Calendar c = java.util.Calendar.getInstance();
        int y = c.get(java.util.Calendar.YEAR);
        int start = c.get(java.util.Calendar.MONTH) >= java.util.Calendar.JULY ? y : y - 1;
        return start + "-" + (start + 1);
    }

    private static String score(JSONObject e) {
        return s(e, "strHomeTeam") + "  " + s(e, "intHomeScore") + " - " + s(e, "intAwayScore") + "  " + s(e, "strAwayTeam");
    }

    private static String highlightUrl(JSONObject e) {
        String v = s(e, "strVideo");
        if (v.startsWith("http")) return v;
        return "https://www.youtube.com/results?search_query="
                + enc(s(e, "strHomeTeam") + " " + s(e, "strAwayTeam") + " highlights buts " + s(e, "dateEvent"));
    }

    private static String matchDate(JSONObject e) {
        String d = s(e, "dateEvent");
        String t = s(e, "strTime");
        try {
            if (!t.isEmpty() && !t.startsWith("00:00")) {
                SimpleDateFormat in = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.ROOT);
                in.setTimeZone(TimeZone.getTimeZone("UTC"));
                Date date = in.parse(d + " " + (t.length() == 5 ? t + ":00" : t.substring(0, 8)));
                return new SimpleDateFormat("EEE d MMM yyyy · HH:mm", Locale.FRENCH).format(date);
            }
            Date date = new SimpleDateFormat("yyyy-MM-dd", Locale.ROOT).parse(d);
            return new SimpleDateFormat("EEE d MMM yyyy", Locale.FRENCH).format(date);
        } catch (Exception ex) {
            return d;
        }
    }

    /** Lit le flux RSS Google Actualités en français pour la recherche donnée. */
    private static List<Row> rss(String query, int max) throws Exception {
        String url = "https://news.google.com/rss/search?q=" + enc(query) + "&hl=fr&gl=FR&ceid=FR:fr";
        String xml = download(url);
        XmlPullParser p = Xml.newPullParser();
        p.setInput(new ByteArrayInputStream(xml.getBytes(StandardCharsets.UTF_8)), "UTF-8");
        List<Row> out = new ArrayList<>();
        String title = null, link = null, date = null, source = null, tag = null;
        boolean inItem = false;
        SimpleDateFormat rfc = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss zzz", Locale.ENGLISH);
        SimpleDateFormat show = new SimpleDateFormat("EEE d MMM · HH:mm", Locale.FRENCH);
        int ev = p.getEventType();
        while (ev != XmlPullParser.END_DOCUMENT && out.size() < max) {
            if (ev == XmlPullParser.START_TAG) {
                tag = p.getName();
                if ("item".equals(tag)) { inItem = true; title = link = date = source = null; }
            } else if (ev == XmlPullParser.TEXT && inItem && tag != null) {
                String txt = p.getText();
                if ("title".equals(tag)) title = (title == null ? "" : title) + txt;
                else if ("link".equals(tag)) link = (link == null ? "" : link) + txt;
                else if ("pubDate".equals(tag)) date = (date == null ? "" : date) + txt;
                else if ("source".equals(tag)) source = (source == null ? "" : source) + txt;
            } else if (ev == XmlPullParser.END_TAG) {
                if ("item".equals(p.getName()) && title != null) {
                    String t = title.trim();
                    String src = source == null ? "" : source.trim();
                    if (!src.isEmpty() && t.endsWith(" - " + src)) t = t.substring(0, t.length() - src.length() - 3);
                    String when = "";
                    try { if (date != null) when = show.format(rfc.parse(date.trim())); } catch (Exception ignored) { }
                    out.add(new Row(Row.CARD, t, src, when, link == null ? null : link.trim()));
                    inItem = false;
                }
                tag = null;
            }
            ev = p.next();
        }
        return out;
    }

    private static String download(String address) throws Exception {
        URL u = new URL(address);
        for (int i = 0; i < 5; i++) {
            HttpURLConnection c = (HttpURLConnection) u.openConnection();
            try {
                c.setInstanceFollowRedirects(false);
                c.setConnectTimeout(12000);
                c.setReadTimeout(15000);
                c.setRequestProperty("User-Agent",
                        "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/124 Mobile Safari/537.36");
                c.setRequestProperty("Accept-Language", "fr-FR,fr;q=0.9");
                int code = c.getResponseCode();
                if (code >= 300 && code < 400) {
                    String loc = c.getHeaderField("Location");
                    if (loc == null) throw new Exception("redirection invalide");
                    u = new URL(u, loc);
                    continue;
                }
                if (code >= 400) throw new Exception("erreur " + code);
                try (InputStream in = c.getInputStream()) {
                    ByteArrayOutputStream out = new ByteArrayOutputStream();
                    byte[] buf = new byte[8192];
                    int n;
                    while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
                    return new String(out.toByteArray(), StandardCharsets.UTF_8);
                }
            } finally {
                c.disconnect();
            }
        }
        throw new Exception("trop de redirections");
    }
}
