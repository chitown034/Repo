#!/usr/bin/env python3
"""Wave-2 splice for the Command Deck (2026-10-11).

Usage: python3 splice-wave2.py <deck.html> [--build "2026-10-11 14:00 PT"]

Adds: Computer Hub panel (toolkit page), Trading Research Desk panel (markets page), Weekly events card (inside the
Travel panel, fed from integrations/events/sources.json), new AI-team org-chart nodes and a toolbox row, and the
additive motion layer. Every edit asserts exactly one anchor match; the script refuses to run twice.
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
MARK = 'id="panel-computerhub"'


def rd(name):
    return open(os.path.join(HERE, name), encoding="utf-8").read()


def once(hay, needle, what):
    n = hay.count(needle)
    if n != 1:
        raise SystemExit(f"ABORT: anchor for {what} matched {n} times, expected 1")


def swap(hay, needle, new, what):
    once(hay, needle, what)
    return hay.replace(needle, new, 1)


def jsq(s):  # a JS double-quoted string literal body from plain text
    return json.dumps(s, ensure_ascii=True)[1:-1]


def main():
    path = sys.argv[1]
    build = "2026-10-11 14:00 PT"
    if "--build" in sys.argv:
        build = sys.argv[sys.argv.index("--build") + 1]
    html = open(path, encoding="utf-8").read()
    if MARK in html:
        raise SystemExit("ABORT: wave 2 is already spliced into this file")

    # 1. CSS, before the Travel filter bar block
    css = "\n".join(rd(f) for f in ("polish.css", "panel-computerhub.css", "panel-tradingdesk.css", "travel-events.css"))
    html = swap(html, "  /* ---- Travel filter bar ---- */", css + "\n\n  /* ---- Travel filter bar ---- */", "css anchor")

    # 2. panels, before </main>
    panels = rd("panel-computerhub.html") + "\n" + rd("panel-tradingdesk.html")
    html = swap(html, "\n  </main>\n", "\n" + panels + "\n  </main>\n", "</main>")

    # 3. weekly events card inside the Travel panel
    sources = json.load(open(os.path.join(REPO, "integrations/events/sources.json"), encoding="utf-8"))
    sources = sources.get("sources", sources)
    keep = [{k: s.get(k) for k in ("id", "name", "city", "category", "url", "kind", "verify") if k in s} for s in sources]
    ev_html = rd("travel-events.html")
    html = swap(html, '    <div class="card" style="margin-bottom:16px;">\n      <p class="card-title">Coverage note</p>',
                ev_html + '    <div class="card" style="margin-bottom:16px;">\n      <p class="card-title">Coverage note</p>', "travel anchor")

    # 4. JS, before the final alert pass
    ev_js = rd("travel-events.js").replace("/*EV_SOURCES_JSON*/[]", json.dumps(keep, ensure_ascii=True, separators=(",", ":")))
    js = "\n".join([rd("panel-computerhub.js"), rd("panel-tradingdesk.js"), ev_js]) + "\n" + \
         '  safeRun("renderComputerHub", renderComputerHub);\n  safeRun("renderTradingDesk", renderTradingDesk);\n  safeRun("renderTravelEvents", renderTravelEvents);\n' + \
         rd("polish.js")
    anchor = '  safeRun("renderNotifications (final pass)", renderNotifications);'
    html = swap(html, anchor, js + "\n" + anchor, "final alert pass")

    # 5. org chart nodes (each one a report/bench under the seat that owns it)
    def node(kind, name, role, owns, agent):
        return ('{ kind: "%s", name: "%s", role: "%s", owns: "%s", agent: "%s" }' % (kind, jsq(name), jsq(role), jsq(owns), jsq(agent)))
    vanessa_new = ",\n        ".join([
        node("report", "Dispatch planner", "bin/brain route \u2014 the org chart made executable",
             "Turns any request into the team\u2019s plan: the lead seat, who joins by rule (client-facing \u2192 Alexandra, credentials \u2192 Elena, money \u2192 Marcus), parallel waves of at most eight, the gates (compliance, ECC, Vanessa last) and every HALT. Plain code, no model call; rules live in wiki/ai-team/cross-functional.md and are self-tested weekly.", "bin/brain route"),
        node("report", "Computer Hub", "2 Macs \u00b7 Alienware \u00b7 tablet \u00b7 phone",
             "One place to reach every computer: Claude Remote Control sessions, Orca for all the AI agents on each machine, AnyDesk for the whole screen. Pairing links and passwords never leave the device that owns them. Panel 40 on Toolkit & Remote Access.", "rc-agent.sh \u00b7 orca-remote.sh \u00b7 alienware-setup.ps1 \u00b7 AnyDesk"),
    ]) + ",\n        "
    html = swap(html, '        { kind: "report", name: "Juliet", role: "Escalation',
                "        " + vanessa_new + '{ kind: "report", name: "Juliet", role: "Escalation', "org: Juliet anchor")
    victor_new = ",\n      ".join([
        node("report", "Tax Assessor Agent", "San Diego & Riverside County public records",
             "Reads only public county assessor and tax-collector pages with the read-only browser tools and writes a one-page Property Tax Sheet: APN, assessed values, exemptions to verify, Prop 13 and supplemental-tax explanation, an estimate formula with its inputs, and where every number came from. Not tax advice; Steven and the CPA decide.", "tax-assessor-agent"),
        node("report", "Loan Pricing Prep Agent", "Scenario worksheet \u2014 never a quote",
             "Builds the loan scenario from facts Steven supplies, computes P&I, PITI, LTV and DTI with visible formulas, compares structures side by side, and lists the rate and fee inputs Steven must pull from his own pricing engine. Never quotes, locks, decides eligibility or sends.", "loan-pricing-agent"),
    ]) + ",\n      "
    html = swap(html, '      { kind: "report", name: "Harrison", role:',
                "      " + victor_new + '{ kind: "report", name: "Harrison", role:', "org: Harrison anchor")
    elon_new = ",\n        ".join([
        node("report", "Browser hands & skill finder", "agent-browser \u00b7 Playwright MCP \u00b7 find-skills",
             "Lets any seat read, search and fill websites for Steven and find a skill for the task at hand. Stops before any submit, send, post, book, pay or sign; never types a password; CRM and transaction sites stay read-only. Used every week by the loop to dogfood both dashboards.", "agent-browser \u00b7 playwright \u00b7 find-skills"),
        node("report", "Reverse-engineering gate", "REA (morluto/rea) \u2014 gated capability",
             "Analysing software Steven owns or may analyse, file formats and exports for interoperability, and security review of his own tools. Never bypasses logins, paywalls or terms of service of third-party platforms. Elena and Alexandra join every use; findings are proposals.", "reverse-engineering skill"),
        node("report", "Weekly scout", "Disruption Scout feed",
             "Every week scans GitHub, the MCP registry, npm and Hacker News for new repos, skills, connectors, upgrades and free tools, scored for fit and tagged with an owner seat. Nadia grades, Elon gates, Steven approves; nothing installs itself.", "integrations/scout/scout.py"),
    ]) + ",\n        "
    html = swap(html, '        { kind: "report", name: "Integration Engineer", role:',
                "        " + elon_new + '{ kind: "report", name: "Integration Engineer", role:', "org: Integration Engineer anchor")
    td = node("bench", "Trading Research Desk", "5 agents + risk + regime \u00b7 paper mode only",
              "Idea \u2192 Builder \u2192 Backtester \u2192 Gate \u2192 Paper Trader \u2192 Memory, looping. Out-of-sample testing, fees and slippage, walk-forward, Monte Carlo drawdown, and a memory that never deletes a failure. Research only; no broker is ever connected. Panel 41 on Markets & Trading.", "integrations/trading-desk")
    html = swap(html, 'ruflo-neural-trader:* · ruflo-market-data" } ] },',
                'ruflo-neural-trader:* · ruflo-market-data" },\n        ' + td + ' ] },', "org: trading bench anchor")

    # 6. toolbox row
    row = ("New capabilities (2026-10-11)",
           "<b>Reaches:</b> Computer Hub (Claude Remote Control + Orca + AnyDesk on every computer) \u00b7 keep-going failover to OmniRoute when Claude runs out \u00b7 browser hands (agent-browser, Playwright MCP) and the skill finder. "
           "<b>Thinks:</b> the dispatch planner (bin/brain route) \u00b7 the weekly internet scout \u00b7 the self-improving trading research desk (paper only) \u00b7 the events scout. "
           "<b>Loan tasks:</b> Tax Assessor Agent (San Diego &amp; Riverside) and Loan Pricing Prep Agent \u2014 prep only, never a quote. "
           "<b>Held for Steven:</b> ARIVE, Apify, vidIQ, OpenRouter-based Jev (accounts and spend), Skool MCP (not recommended). Details: wiki/ai-team/tool-integration-status.md.")
    anchor = '\n  ];\n\n  /* ================= ORG CHART'
    html = swap(html, anchor, ',\n    ' + json.dumps(list(row), ensure_ascii=True) + anchor, "toolbox tail")

    # 6b. freshness registries (reviewed-at map and kind/keys map) so the new panels do not read UNREGISTERED
    html = swap(html, '    "panel-orchestration":    { at: "2026-09-22", scope: "review" },',
                '    "panel-orchestration":    { at: "2026-09-22", scope: "review" },\n    "panel-computerhub":      { at: "2026-10-11", scope: "review" },\n    "panel-tradingdesk":      { at: "2026-10-11", scope: "review" },', "review registry")
    html = swap(html, '"weeklyBrief", "loopLog"] }',
                '"weeklyBrief", "loopLog"] },\n      "panel-computerhub":      { kind: "you",    keys: ["computerHub"] },\n      "panel-tradingdesk":      { kind: "you",    keys: ["tradingDeskReport"] }', "kind registry")

    # 7. build stamp
    m = re.search(r"Build 2026-\d\d-\d\d \d\d:\d\d PT", html)
    if m:
        html = html.replace(m.group(0), "Build " + build, 1)
    open(path, "w", encoding="utf-8").write(html)
    print(f"spliced wave 2 into {path}: 2 panels, travel events card ({len(keep)} sources), 9 org nodes, toolbox row, motion layer")


if __name__ == "__main__":
    main()
