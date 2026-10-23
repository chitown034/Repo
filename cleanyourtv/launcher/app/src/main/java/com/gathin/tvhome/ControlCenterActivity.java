package com.gathin.tvhome;

import android.animation.ValueAnimator;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.os.Bundle;
import android.provider.Settings;
import android.view.View;
import android.view.animation.DecelerateInterpolator;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

/**
 * Control Center (config.xml control_center): a sheet of smoked glass that slides in from the right with the time,
 * the connection and a grid of tiles for picture, sound, network, Bluetooth, inputs, the screensaver, Search and
 * settings. Translucent and in its own task, like QuickSettingsActivity, so whatever plays behind keeps playing;
 * Back or a tile closes it. Each tile only opens a standard settings screen: nothing is changed from here.
 */
public final class ControlCenterActivity extends Activity {

    private static final int COLUMNS = 3;
    private LinearLayout row;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        setContentView(R.layout.activity_control_center);
        findViewById(R.id.scrim).setOnClickListener(v -> finish());
        showNetwork();

        LinearLayout tiles = findViewById(R.id.tiles);
        addTile(tiles, R.drawable.ic_picture, R.string.cc_picture, SystemSettings.intent(this, Settings.ACTION_DISPLAY_SETTINGS));
        addTile(tiles, R.drawable.ic_sound, R.string.cc_sound, SystemSettings.intent(this, Settings.ACTION_SOUND_SETTINGS));
        addTile(tiles, R.drawable.ic_wifi, R.string.cc_network, SystemSettings.intent(this, Settings.ACTION_WIFI_SETTINGS));
        addTile(tiles, R.drawable.ic_bluetooth, R.string.cc_bluetooth, SystemSettings.intent(this, Settings.ACTION_BLUETOOTH_SETTINGS));
        // Through Home, which owns the Inputs menu (the same route as the system's VIEW_INPUTS).
        addTile(tiles, R.drawable.ic_input, R.string.inputs,
                new Intent(this, MainActivity.class).setAction(MainActivity.ACTION_VIEW_INPUTS));
        addTile(tiles, R.drawable.ic_moon, R.string.cc_screensaver, new Intent(this, ClockActivity.class));
        addTile(tiles, R.drawable.ic_search, R.string.search, new Intent(this, SearchActivity.class));
        addTile(tiles, R.drawable.ic_home_settings, R.string.cc_home,
                new Intent(this, MainActivity.class).setAction(MainActivity.ACTION_LAUNCHER_SETTINGS));
        addTile(tiles, R.drawable.ic_settings, R.string.settings, SystemSettings.intent(this, Settings.ACTION_SETTINGS));
        ((LinearLayout) tiles.getChildAt(0)).getChildAt(0).requestFocus();

        Config cfg = Config.load(this);
        View sheet = findViewById(R.id.sheet);
        View scrim = findViewById(R.id.scrim);
        if (cfg.animations && !cfg.reducedMotion) {
            float density = getResources().getDisplayMetrics().density;
            sheet.setTranslationX(80f * density);
            sheet.setAlpha(0f);
            sheet.animate().translationX(0f).alpha(1f).setDuration(280)
                    .setInterpolator(new DecelerateInterpolator(2f)).start();
            // mutate(): the scrim drawable's alpha is shared with every other user of control_scrim otherwise.
            android.graphics.drawable.Drawable veil = scrim.getBackground().mutate();
            veil.setAlpha(0);
            ValueAnimator fade = ValueAnimator.ofInt(0, 255).setDuration(240);
            fade.addUpdateListener(a -> veil.setAlpha((int) a.getAnimatedValue()));
            fade.start();
        }
    }

    /** "Connected over Wi-Fi", "… Ethernet" or "Not connected", with the dot green or grey. */
    private void showNetwork() {
        TextView status = findViewById(R.id.networkStatus);
        View dot = findViewById(R.id.networkDot);
        ConnectivityManager cm = getSystemService(ConnectivityManager.class);
        Network network = cm == null ? null : cm.getActiveNetwork();
        NetworkCapabilities caps = network == null ? null : cm.getNetworkCapabilities(network);
        if (caps != null && caps.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET)) {
            status.setText(R.string.cc_ethernet_on);
        } else if (caps != null && caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI)) {
            status.setText(R.string.cc_wifi_on);
        } else {
            status.setText(R.string.cc_offline);
            dot.getBackground().mutate().setTint(0xFF8E8E93);
        }
    }

    private void addTile(LinearLayout tiles, int icon, int title, Intent target) {
        if (row == null || row.getChildCount() == COLUMNS) {
            row = new LinearLayout(this);
            row.setOrientation(LinearLayout.HORIZONTAL);
            row.setClipChildren(false);
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT);
            if (tiles.getChildCount() > 0) lp.topMargin = Math.round(10 * getResources().getDisplayMetrics().density);
            tiles.addView(row, lp);
        }
        View tile = getLayoutInflater().inflate(R.layout.item_control_tile, row, false);
        ((ImageView) tile.findViewById(R.id.icon)).setImageResource(icon);
        ((TextView) tile.findViewById(R.id.title)).setText(title);
        tile.setContentDescription(getString(title));
        if (row.getChildCount() > 0) {
            ((LinearLayout.LayoutParams) tile.getLayoutParams()).leftMargin =
                    Math.round(10 * getResources().getDisplayMetrics().density);
        }
        tile.setOnFocusChangeListener((v, focused) -> v.animate()
                .scaleX(focused ? 1.06f : 1f).scaleY(focused ? 1.06f : 1f)
                .translationZ(focused ? 6f * getResources().getDisplayMetrics().density : 0f)
                .setDuration(160).start());
        tile.setOnClickListener(v -> {
            try {
                startActivity(target.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
            } catch (ActivityNotFoundException | SecurityException e) {
                Toast.makeText(this, R.string.not_available, Toast.LENGTH_SHORT).show();
            }
            finish();
        });
        row.addView(tile);
    }

    /** Anything else taking the screen closes the sheet, as for the quick panel. */
    @Override
    protected void onPause() {
        super.onPause();
        finish();
        overridePendingTransition(0, 0);
    }
}
