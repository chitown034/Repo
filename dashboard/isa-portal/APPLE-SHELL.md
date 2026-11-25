# ISA Portal — Apple-style navigation shell (2026-11-25)

`apple-shell.html` is inserted once, just before the portal's last `</body>` (marker `<!-- == APPLE SHELL (ISA) 2026-11-25 == -->`).
Live since ISA Portal version 1795649072-bfb8 (v49). The full published page is mirrored at `dashboard/isa/isa-portal.html`.

The portal is one long page, not a set of pages. So the sidebar and the tab bar navigate between sections: a tap scrolls to that panel, and scroll-spy highlights the panel in view.

- **Desktop (≥ 900 px):** a translucent sidebar with the 14 panels and the Capability Pack, in five groups, each with an icon and its panel number:
  - Today: AI Team & ISA Line, Your Week, Sync Status
  - Pipeline: CRM Import, Real Estate Clients, Mortgage Pipeline, Showings
  - Market & lending: Rates & Market, Property Search, Loan Programs
  - Playbooks & ops: Workflows, Team & Delegation, EA / ISA Operations, VA Loan Mastermind
  - Reference: Capability Pack

  The sync pill and the world clocks sit at the bottom of the sidebar. The portal has no search, so the sidebar has none.
- **Large title:** the existing hero ("Pipeline Access") restyled with a date eyebrow. Once it scrolls away, the slim sticky toolbar shows the current section and its group.
- **iPhone (< 900 px):** a bottom tab bar with Team, Today, Clients, Pipeline and More. More opens the sidebar as a bottom sheet; close it with Done, the scrim or Esc, and Tab stays inside the open sheet.
- **ISA line unread:** the unread pill stays in the toolbar. Its count also appears as a red badge on AI Team in the sidebar and on the Team tab.
- **Scrolling:** panels use `content-visibility:auto`, so the jump re-measures for a few frames until the panel sits under the toolbar. In-page `#` links get a 76 px scroll margin instead of 360 px, because the header is slim now.
- **Hidden, not deleted:** the section slider, its dock button, the contents (☰) dock and the brand block. The back-to-top button stays. `#pillSync` and `#worldClockBar` are moved with their ids kept, so their update scripts still work.
- **Accessibility:** reduced motion turns off the smooth scroll and the sheet animation. Reduced transparency gives the bars a solid background. In print, the sidebar, tab bar and scrim are hidden and the toolbar does not stick.
- **To remove:** delete the marked block and the old navigation comes back unchanged.

## Info refresh shipped in the same version

- **AI team roster:** added Elon, Bennett, Sienna, Hollis, Atlas, Remy and the Agency squads (sources: `wiki/ai-team/desk-seats.md`, `agency-teams.md`).
- **"New tools behind the AI team" card:** restamped 2026-11-25. Added Engineering Core (Atlas), the Agency squads and the local model tier (Mac pending).
- **Lofty wording:** Vanessa's preamble and the snapshot fallback now say a read-only bridge exists (stage totals, no lead ids) and that the Lofty cloud sign-in is pending. They no longer say "not connected / no key".
- **Specialists:** Vanessa's preamble now names Carmen, Denise and Howard. Her tool already listed them.
- **Footer:** new build stamp.
