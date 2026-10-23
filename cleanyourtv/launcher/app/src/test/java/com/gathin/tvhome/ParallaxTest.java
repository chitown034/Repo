package com.gathin.tvhome;

import org.junit.Test;

import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertTrue;

/** Plain JVM tests for the parallax lean's direction (Parallax.tilt). */
public class ParallaxTest {

    private static final float EPS = 0.0001f;

    @Test
    public void noLeanWithoutAMove() {
        assertArrayEquals(new float[]{0f, 0f}, Parallax.tilt(-1, 3, 4, false), EPS);
        assertArrayEquals(new float[]{0f, 0f}, Parallax.tilt(3, 3, 4, false), EPS);
    }

    @Test
    public void rightLeansRightEdgeAwayDownTipsTopBack() {
        float[] right = Parallax.tilt(0, 1, 4, false);
        assertTrue(right[1] < 0 && right[0] == 0f);
        float[] down = Parallax.tilt(1, 5, 4, false);
        assertTrue(down[0] > 0 && down[1] == 0f);
        float[] upLeft = Parallax.tilt(5, 0, 4, false);
        assertTrue(upLeft[0] < 0 && upLeft[1] > 0);
    }

    @Test
    public void longJumpsLeanNoFurtherAndMirroringFlipsSides() {
        assertArrayEquals(Parallax.tilt(0, 1, 4, false), Parallax.tilt(0, 3, 4, false), EPS);
        assertArrayEquals(new float[]{0f, Parallax.TILT_DEG}, Parallax.tilt(0, 1, 4, true), EPS);
    }
}
