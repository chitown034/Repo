package com.gathin.tvhome;

import android.view.View;

import androidx.dynamicanimation.animation.DynamicAnimation;
import androidx.dynamicanimation.animation.SpringAnimation;
import androidx.dynamicanimation.animation.SpringForce;

/**
 * tvOS parallax (config.xml tile_parallax): the tile focus lands on leans a few degrees towards the side it came
 * from, as if the move pushed it, then springs back flat. Two springs on rotation only, so it never fights the
 * focus zoom, which animates scale and translation.
 */
final class Parallax {

    /** Lean, in degrees, for a move of one tile. */
    static final float TILT_DEG = 7f;

    private Parallax() {
    }

    /**
     * {rotationX, rotationY} for focus moving from position {@code from} to {@code to} in a grid of
     * {@code columns}. Moving right leans the tile's right edge away (negative rotationY); moving down tips its
     * top edge back (positive rotationX). A jump of more than one tile leans no further, and a first focus
     * ({@code from} &lt; 0) or the same tile leans nowhere. {@code mirrored}: the grid lays out right to left.
     */
    static float[] tilt(int from, int to, int columns, boolean mirrored) {
        if (from < 0 || to < 0 || from == to || columns <= 0) return new float[]{0f, 0f};
        int dx = Integer.signum(to % columns - from % columns);
        int dy = Integer.signum(to / columns - from / columns);
        if (mirrored) dx = -dx;
        return new float[]{dy * TILT_DEG * 0.7f, -dx * TILT_DEG};
    }

    /** Starts the lean on {@code card} and springs it back to flat. */
    static void nudge(View card, float[] tilt) {
        if (tilt[0] == 0f && tilt[1] == 0f) return;
        card.setCameraDistance(card.getResources().getDisplayMetrics().density * 9000f);
        spring(card, R.id.parallax_x, DynamicAnimation.ROTATION_X, tilt[0]);
        spring(card, R.id.parallax_y, DynamicAnimation.ROTATION_Y, tilt[1]);
    }

    /** Puts a tile that lost focus back flat at once, so a quick move never leaves one leaning. */
    static void settle(View card) {
        for (int key : new int[]{R.id.parallax_x, R.id.parallax_y}) {
            Object running = card.getTag(key);
            if (running instanceof SpringAnimation) ((SpringAnimation) running).cancel();
        }
        card.setRotationX(0f);
        card.setRotationY(0f);
    }

    /** One spring per tile and axis, kept on the view (tag {@code key}) and restarted for each lean. */
    private static void spring(View card, int key, DynamicAnimation.ViewProperty property, float start) {
        Object tagged = card.getTag(key);
        SpringAnimation s;
        if (tagged instanceof SpringAnimation) {
            s = (SpringAnimation) tagged;
            s.cancel();
        } else {
            s = new SpringAnimation(card, property, 0f);
            s.getSpring().setStiffness(SpringForce.STIFFNESS_LOW).setDampingRatio(0.55f);
            card.setTag(key, s);
        }
        if (start == 0f) return;
        s.setStartValue(start);
        s.start();
    }
}
