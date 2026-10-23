package com.gathin.tvhome;

import org.junit.Test;

import java.util.Arrays;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

/** Plain JVM tests for Search's ranking (AppSearch). */
public class AppSearchTest {

    @Test
    public void emptyQueryMatchesEverything() {
        assertEquals(0, AppSearch.score("Netflix", ""));
        assertEquals(0, AppSearch.score("Netflix", "   "));
    }

    @Test
    public void exactBeatsPrefixBeatsWordBeatsInitialsBeatsSubstring() {
        int exact = AppSearch.score("Plex", "plex");
        int prefix = AppSearch.score("Plexamp", "plex");
        int word = AppSearch.score("Prime Video", "video");
        int initials = AppSearch.score("Prime Video", "pv");
        int substring = AppSearch.score("Disney+ Hotstar", "star");
        assertTrue(exact > prefix);
        assertTrue(prefix > word);
        assertTrue(word > initials);
        assertTrue(initials > substring);
        assertTrue(substring > AppSearch.score("Spotify", "sty"));
    }

    @Test
    public void camelCaseSplitsIntoWords() {
        assertEquals(Arrays.asList("you", "tube"), AppSearch.words("YouTube"));
        assertEquals(700, AppSearch.score("YouTube", "yt"));
        assertTrue(AppSearch.score("YouTube", "tube") >= 750);
    }

    @Test
    public void ignoresCaseAccentsAndPunctuation() {
        assertEquals(1000, AppSearch.score("Télé-Loisirs", "teleloisirs"));
        assertEquals(1000, AppSearch.score("Disney+", "DISNEY"));
        assertEquals("tele loisirs", AppSearch.normalize("  Télé–Loisirs! "));
    }

    @Test
    public void lettersInOrderStillMatch() {
        assertTrue(AppSearch.score("Netflix", "nfx") > 0);
        assertEquals(AppSearch.NO_MATCH, AppSearch.score("Netflix", "xn"));
        assertEquals(AppSearch.NO_MATCH, AppSearch.score("Netflix", "q"));
    }

    @Test
    public void ranksBestFirstAlphabeticalOnTiesAndLimits() {
        List<String> names = Arrays.asList("YouTube Kids", "Spotify", "YouTube", "Prime Video", "YouTube Music");
        assertEquals(Arrays.asList(2, 0, 4), AppSearch.rank(names, "youtube", 10));
        assertEquals(Arrays.asList(2, 0), AppSearch.rank(names, "youtube", 2));
        assertEquals(Arrays.asList(3), AppSearch.rank(names, "pv", 10));
        assertEquals(5, AppSearch.rank(names, "", 10).size());
    }
}
