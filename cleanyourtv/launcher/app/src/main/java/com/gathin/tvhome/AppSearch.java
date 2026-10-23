package com.gathin.tvhome;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;

/**
 * Ranks app names against what was typed in Search, the way Spotlight does: a name that starts with the query
 * beats one where a word starts with it, which beats initials ("yt" for YouTube, "pv" for Prime Video), then a
 * plain substring, then the letters in order with gaps. Accents and case are ignored. Plain Java, no Android
 * types, so SearchActivity's ranking is tested on the JVM (AppSearchTest).
 */
final class AppSearch {

    static final int NO_MATCH = -1;

    private AppSearch() {
    }

    /** A higher score is a better match; {@link #NO_MATCH} when the name does not match at all. */
    static int score(String name, String query) {
        String q = normalize(query).replace(" ", "");
        if (q.isEmpty()) return 0;
        String n = normalize(name);
        String compact = n.replace(" ", "");
        if (compact.equals(q)) return 1000;
        if (compact.startsWith(q)) return 900 - Math.min(99, compact.length() - q.length());
        List<String> words = words(name);
        for (int i = 0; i < words.size(); i++) {
            if (words.get(i).startsWith(q)) return 800 - Math.min(50, i * 10);
        }
        StringBuilder initials = new StringBuilder();
        for (String w : words) initials.append(w.charAt(0));
        if (q.length() >= 2 && initials.toString().startsWith(q)) return 700;
        int at = compact.indexOf(q);
        if (at >= 0) return 600 - Math.min(99, at);
        int gaps = subsequenceGaps(compact, q);
        if (gaps >= 0 && q.length() >= 2) return 300 - Math.min(199, gaps * 10);
        return NO_MATCH;
    }

    /** Indexes of {@code names} that match, best first; ties keep alphabetical order. At most {@code limit}. */
    static List<Integer> rank(List<String> names, String query, int limit) {
        List<int[]> hits = new ArrayList<>();
        for (int i = 0; i < names.size(); i++) {
            int s = score(names.get(i), query);
            if (s != NO_MATCH) hits.add(new int[]{i, s});
        }
        Collections.sort(hits, (a, b) -> a[1] != b[1] ? Integer.compare(b[1], a[1])
                : normalize(names.get(a[0])).compareTo(normalize(names.get(b[0]))));
        List<Integer> out = new ArrayList<>();
        for (int i = 0; i < hits.size() && out.size() < limit; i++) out.add(hits.get(i)[0]);
        return out;
    }

    /** Lower case, accents stripped, everything but letters and digits turned into single spaces. */
    static String normalize(String s) {
        if (s == null) return "";
        String plain = Normalizer.normalize(s, Normalizer.Form.NFD).replaceAll("\\p{M}+", "");
        return plain.toLowerCase(Locale.ROOT).replaceAll("[^\\p{L}\\p{N}]+", " ").trim();
    }

    /** The name's words, also split where a capital follows a lower-case letter: "YouTube" is "you", "tube". */
    static List<String> words(String name) {
        String split = name == null ? "" : name.replaceAll("(\\p{Ll})(\\p{Lu})", "$1 $2");
        List<String> out = new ArrayList<>();
        for (String w : normalize(split).split(" ")) if (!w.isEmpty()) out.add(w);
        return out;
    }

    /** Letters skipped while finding every letter of {@code q} in order in {@code s}, or -1 when they are not all there. */
    private static int subsequenceGaps(String s, String q) {
        int gaps = 0, j = 0;
        boolean started = false;
        for (int i = 0; i < s.length() && j < q.length(); i++) {
            if (s.charAt(i) == q.charAt(j)) {
                j++;
                started = true;
            } else if (started) {
                gaps++;
            }
        }
        return j == q.length() ? gaps : -1;
    }
}
