package com.gathin.tvhome;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.graphics.drawable.Drawable;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.KeyEvent;
import android.view.LayoutInflater;
import android.view.View;
import android.view.animation.DecelerateInterpolator;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Search (config.xml spotlight_search): type on a tvOS letter row, or on any keyboard paired with the TV, and the
 * installed apps that match line up as tiles, best match first (AppSearch). With nothing typed it shows the apps
 * Home opened most recently, then the rest alphabetically. Opened from the Search pill, the remote's Search key, or
 * by typing on Home. Reads only the package manager: no network, no index kept on disk.
 */
public final class SearchActivity extends Activity {

    /** Sent with the first letter when typing on Home opened Search. */
    static final String EXTRA_QUERY = "com.gathin.tvhome.extra.QUERY";
    private static final int MAX_RESULTS = 14;
    private static final String KEYS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    private static final class App {
        final String pkg;
        final String label;
        final Drawable banner;
        final Drawable icon;

        App(String pkg, String label, Drawable banner, Drawable icon) {
            this.pkg = pkg;
            this.label = label;
            this.banner = banner;
            this.icon = icon;
        }
    }

    private final Handler handler = new Handler(Looper.getMainLooper());
    private final StringBuilder query = new StringBuilder();
    private List<App> apps = Collections.emptyList();
    private TextView queryView;
    private TextView section;
    private TextView empty;
    private LinearLayout results;
    private View resultsScroll;
    private LinearLayout keys;
    /** The key focus was on before Down went into the results, so Up goes back to it. */
    private View lastKey;
    private boolean animations;
    private boolean reducedMotion;
    private float density;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        setContentView(R.layout.activity_search);
        density = getResources().getDisplayMetrics().density;
        Config cfg = Config.load(this);
        animations = cfg.animations;
        reducedMotion = cfg.reducedMotion;
        queryView = findViewById(R.id.query);
        section = findViewById(R.id.section);
        empty = findViewById(R.id.empty);
        results = findViewById(R.id.results);
        resultsScroll = findViewById(R.id.resultsScroll);
        keys = findViewById(R.id.keys);
        buildKeys();
        String first = getIntent().getStringExtra(EXTRA_QUERY);
        if (first != null) query.append(first);
        showQuery();

        if (animations && !reducedMotion) {
            View content = findViewById(R.id.searchContent);
            content.setAlpha(0f);
            content.setTranslationY(18f * density);
            content.animate().alpha(1f).translationY(0f).setDuration(260)
                    .setInterpolator(new DecelerateInterpolator(1.6f)).start();
        }

        Set<String> hidden = new HashSet<>(cfg.hiddenApps);
        // Banners decode from every app's resources; off the main thread so the letter row is usable at once.
        new Thread(() -> {
            List<App> loaded = loadApps(hidden);
            handler.post(() -> {
                if (isDestroyed()) return;
                apps = loaded;
                refresh();
            });
        }, "search-apps").start();
    }

    private void buildKeys() {
        LayoutInflater inflater = getLayoutInflater();
        addKey(inflater, null, R.drawable.ic_space, getString(R.string.search_space), () -> type(' '));
        addKey(inflater, null, R.drawable.ic_backspace, getString(R.string.search_delete), this::deleteOne);
        for (int i = 0; i < KEYS.length(); i++) {
            char c = KEYS.charAt(i);
            View key = addKey(inflater, String.valueOf(c), 0, null, () -> type(c));
            if (c == 'A') key.post(key::requestFocus);
        }
    }

    private View addKey(LayoutInflater inflater, String text, int icon, String description, Runnable action) {
        TextView key = (TextView) inflater.inflate(R.layout.item_search_key, keys, false);
        if (text != null) key.setText(text);
        if (icon != 0) {
            key.setCompoundDrawablesRelativeWithIntrinsicBounds(icon, 0, 0, 0);
            key.setPadding(Math.round(12 * density), 0, 0, 0);
            key.setContentDescription(description);
        }
        key.setNextFocusDownId(R.id.card);
        key.setOnClickListener(v -> action.run());
        key.setOnFocusChangeListener((v, focused) -> {
            if (focused) lastKey = v;
            if (!animations) return;
            v.animate().scaleX(focused ? 1.12f : 1f).scaleY(focused ? 1.12f : 1f)
                    .setDuration(reducedMotion ? Motion.REDUCED_MS : 140).start();
        });
        keys.addView(key);
        return key;
    }

    private void type(char c) {
        if (c == ' ' && (query.length() == 0 || query.charAt(query.length() - 1) == ' ')) return;
        if (query.length() >= 40) return;
        query.append(c);
        showQuery();
    }

    private void deleteOne() {
        if (query.length() == 0) return;
        query.setLength(query.length() - 1);
        showQuery();
    }

    private void showQuery() {
        queryView.setText(query.length() == 0 ? "" : query.toString());
        refresh();
    }

    /** A keyboard paired with the TV types straight in; Delete removes the last letter. */
    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_DEL) {
            deleteOne();
            return true;
        }
        if (keyCode == KeyEvent.KEYCODE_SEARCH) return true;
        int unicode = event.getUnicodeChar();
        if (unicode > 0 && (Character.isLetterOrDigit(unicode) || unicode == ' ')) {
            type(Character.toUpperCase((char) unicode));
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    private void refresh() {
        List<App> shown = new ArrayList<>();
        String q = query.toString().trim();
        if (q.isEmpty()) {
            shown.addAll(recentFirst(apps));
            boolean anyRecent = !shown.isEmpty() && LastOpened.get(this, shown.get(0).pkg) > 0;
            section.setText(anyRecent ? R.string.search_recent : R.string.search_all_apps);
        } else {
            List<String> names = new ArrayList<>();
            for (App a : apps) names.add(a.label);
            for (int i : AppSearch.rank(names, q, MAX_RESULTS)) shown.add(apps.get(i));
            section.setText(R.string.search_top_hits);
        }
        if (shown.size() > MAX_RESULTS) shown = shown.subList(0, MAX_RESULTS);
        boolean none = shown.isEmpty() && !q.isEmpty();
        empty.setVisibility(none ? View.VISIBLE : View.GONE);
        section.setVisibility(none ? View.INVISIBLE : View.VISIBLE);
        resultsScroll.setVisibility(none ? View.GONE : View.VISIBLE);
        fill(shown);
    }

    /** Apps Home opened, most recent first, then everything else in alphabetical order. */
    private List<App> recentFirst(List<App> all) {
        List<App> sorted = new ArrayList<>(all);
        Map<String, Long> when = new LinkedHashMap<>();
        for (App a : sorted) when.put(a.pkg, LastOpened.get(this, a.pkg));
        Collections.sort(sorted, (a, b) -> {
            int byTime = Long.compare(when.get(b.pkg), when.get(a.pkg));
            return byTime != 0 ? byTime : a.label.compareToIgnoreCase(b.label);
        });
        return sorted;
    }

    private void fill(List<App> shown) {
        LayoutInflater inflater = getLayoutInflater();
        boolean hadFocus = results.hasFocus();
        results.removeAllViews();
        for (int i = 0; i < shown.size(); i++) {
            App app = shown.get(i);
            View item = inflater.inflate(R.layout.item_search_result, results, false);
            View card = item.findViewById(R.id.card);
            ImageView banner = item.findViewById(R.id.banner);
            ImageView icon = item.findViewById(R.id.icon);
            TextView name = item.findViewById(R.id.name);
            name.setText(app.label);
            if (app.banner != null) {
                banner.setImageDrawable(app.banner);
            } else {
                banner.setVisibility(View.GONE);
                icon.setVisibility(View.VISIBLE);
                icon.setImageDrawable(app.icon);
            }
            card.setClipToOutline(true);
            card.setContentDescription(app.label);
            card.setOnClickListener(v -> launch(app));
            card.setOnKeyListener((v, keyCode, event) -> {
                if (event.getAction() != KeyEvent.ACTION_DOWN || keyCode != KeyEvent.KEYCODE_DPAD_UP) return false;
                if (lastKey != null) lastKey.requestFocus();
                return true;
            });
            card.setOnFocusChangeListener((v, focused) -> {
                name.animate().alpha(focused ? 1f : 0.7f).setDuration(160).start();
                name.setTextColor(focused ? 0xFFFFFFFF : 0xB3FFFFFF);
                if (!animations) return;
                v.animate().scaleX(focused ? 1.1f : 1f).scaleY(focused ? 1.1f : 1f)
                        .translationZ(focused ? 10f * density : 0f)
                        .setDuration(reducedMotion ? Motion.REDUCED_MS : 200)
                        .setInterpolator(new DecelerateInterpolator(1.5f)).start();
            });
            results.addView(item);
            if (animations && !reducedMotion) {
                item.setAlpha(0f);
                item.setTranslationX(14f * density);
                item.animate().alpha(1f).translationX(0f).setStartDelay(Math.min(i, 6) * 28L)
                        .setDuration(220).setInterpolator(new DecelerateInterpolator()).start();
            }
        }
        if (hadFocus && results.getChildCount() > 0) results.getChildAt(0).findViewById(R.id.card).requestFocus();
        else if (hadFocus && lastKey != null) lastKey.requestFocus();
    }

    private void launch(App app) {
        PackageManager pm = getPackageManager();
        Intent i = pm.getLeanbackLaunchIntentForPackage(app.pkg);
        if (i == null) i = pm.getLaunchIntentForPackage(app.pkg);
        if (i == null) {
            Toast.makeText(this, getString(R.string.cant_open, app.label), Toast.LENGTH_SHORT).show();
            return;
        }
        try {
            startActivity(i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED));
            LastOpened.record(this, app.pkg);
            finish();
            overridePendingTransition(R.anim.app_open_enter, R.anim.app_open_exit);
        } catch (Exception e) {
            Toast.makeText(this, getString(R.string.cant_open, app.label), Toast.LENGTH_SHORT).show();
        }
    }

    /** TV apps and phone apps alike, one entry per package, without this launcher or hidden_apps. */
    private List<App> loadApps(Set<String> hidden) {
        PackageManager pm = getPackageManager();
        Map<String, App> byPkg = new LinkedHashMap<>();
        for (String category : new String[]{Intent.CATEGORY_LEANBACK_LAUNCHER, Intent.CATEGORY_LAUNCHER}) {
            Intent main = new Intent(Intent.ACTION_MAIN).addCategory(category);
            for (ResolveInfo ri : pm.queryIntentActivities(main, 0)) {
                ActivityInfo ai = ri.activityInfo;
                if (ai == null || byPkg.containsKey(ai.packageName) || hidden.contains(ai.packageName)
                        || ai.packageName.equals(getPackageName())) continue;
                Drawable banner = null, icon = null;
                try {
                    banner = ai.loadBanner(pm);
                    if (banner == null) banner = ai.applicationInfo.loadBanner(pm);
                    if (banner == null) icon = ai.loadIcon(pm);
                } catch (Exception ignored) {
                    // An app whose resources fail to load still shows, by name, on a blank card.
                }
                byPkg.put(ai.packageName, new App(ai.packageName, String.valueOf(ri.loadLabel(pm)), banner, icon));
            }
        }
        List<App> list = new ArrayList<>(byPkg.values());
        Collections.sort(list, (a, b) -> a.label.compareToIgnoreCase(b.label));
        return list;
    }
}
