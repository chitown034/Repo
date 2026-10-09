#!/usr/bin/env python3
"""Integrator splice: add the Orchestration & Loop Engineering panel to the Command Deck.

Usage: python3 splice-orchestration.py <deck.html> [--build "2026-09-22 08:55 PT"]

Every edit asserts exactly one anchor match and refuses to run twice.
"""
import sys, re, os

SCRATCH = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def once(hay, needle, what):
    n = hay.count(needle)
    if n != 1:
        raise SystemExit(f"ABORT: anchor for {what} matched {n} times, expected 1")
    return True

def main():
    path = sys.argv[1]
    build = "2026-09-22 08:55 PT"
    if "--build" in sys.argv:
        build = sys.argv[sys.argv.index("--build") + 1]
    html = open(path, encoding="utf-8").read()
    if 'id="panel-orchestration"' in html:
        raise SystemExit("ABORT: panel-orchestration is already present")

    panel = open(os.path.join(SCRATCH, "panel-orchestration.html"), encoding="utf-8").read()
    js = open(os.path.join(SCRATCH, "panel-orchestration.js"), encoding="utf-8").read()

    # 1. panel markup, immediately before the closing </main>
    anchor = "\n  </main>\n"
    once(html, anchor, "</main>")
    html = html.replace(anchor, "\n" + panel + "\n  </main>\n")

    # 2. render block, before the final alert pass so its failures are counted by the bell
    anchor = '  safeRun("renderNotifications (final pass)", renderNotifications);'
    once(html, anchor, "final alert pass")
    html = html.replace(anchor, js + "\n" + anchor)

    # 3. new page tab
    anchor = '    { id: "toolkit", label: "Toolkit & Remote Access" }\n  ];'
    once(html, anchor, "PAGE_DEFS tail")
    html = html.replace(anchor, '    { id: "toolkit", label: "Toolkit & Remote Access" },\n'
                                '    { id: "orchestration", label: "Orchestration & Loop" }\n  ];')

    # 4. freshness stamp registry entry
    anchor = '      "panel-housekeeping":     { kind: "you",    keys: ["subscriptions", "liabilities", "myCards", "memberships"] }'
    once(html, anchor, "panelStampRegistry tail")
    html = html.replace(anchor, anchor + ',\n      "panel-orchestration":    { kind: "you",    keys: ["auditFindings", "stressTestReport", "cpiOpportunityLog", "scaleOpportunityLog", "trustLevels", "weeklyBrief", "loopLog"] }')

    # 5. the file closed itself three times over
    tail = "</script>\n</body></html>\n</body></html>\n</body></html>"
    if html.rstrip().endswith("</body></html>\n</body></html>\n</body></html>".strip()):
        html = html.rstrip()
        while html.endswith("</body></html>"):
            html = html[: -len("</body></html>")].rstrip()
        html += "\n</body>\n</html>\n"

    # 6. build stamp
    m = re.search(r"Build 2026-\d\d-\d\d \d\d:\d\d PT", html)
    if m:
        html = html.replace(m.group(0), "Build " + build, 1)

    open(path, "w", encoding="utf-8").write(html)
    print(f"spliced panel-orchestration into {path}")
    print(f"  page tab added, stamp registry entry added, build stamp set to {build}")

if __name__ == "__main__":
    main()
