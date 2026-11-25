# Command Deck — Apple-style navigation shell (2026-11-25)

`apple-shell.html` is inserted once, just before the deck's last `</body>` (marker `<!-- == APPLE SHELL 2026-11-25 == -->`).
Live since deck version 1795629268-94df.

- **Mac / desktop (≥ 900 px):** a translucent sidebar like Mail or Settings. It holds the 15 pages in five groups with icons and panel counts, Search (⌘K), Other dashboards, and at the bottom Net Worth, the status pills and world clocks.
- **Large page title:** every page gets one, which collapses into the slim sticky toolbar on scroll. The toolbar keeps only search, alerts and backup.
- **iPhone (< 900 px):** a translucent bottom tab bar with Today · Lending · Markets · Team · More. More opens a bottom sheet with the full sidebar. Close it with Done, the scrim or Esc.
- **How it works:** the shell clicks the existing `.page-tab` buttons, so `switchPage`, its saved page, the `[` `]` and number keys, search jumps and `#panel-` links all keep working. A MutationObserver keeps the shell in sync.
- **Hidden, not deleted:** the old tab strip, Pages menu, breadcrumb, section slider and its dock button, and the world-clock bar. Net Worth, the pills, the clocks and the Dashboards menu are moved (same ids) into the sidebar.
- **Start here row:** a single scrolling row, shown on Daily Ops only.
- **Accessibility:** respects reduced motion, reduced transparency and print.
- **To remove:** delete the marked block and the old navigation returns unchanged.
