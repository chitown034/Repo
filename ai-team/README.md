# AI Team skills (updated for the Venture Command Center)

Updated versions of Steven's AI Team persona skills. Each keeps its original name, voice, rules and
Command Deck data access, and adds a **Venture Command Center** section:

- how to read the dashboard's private data (`data/users/me` / `state` on
  https://claude.ai/artifact/5ejZqskuueBj7ZCBaGzoCi)
- which fields that persona reads for its lane
- venture-specific guidance (VetCert ownership, SBA SOP 50 10 8, 2025 tax-law levers, ad rules, etc.)
- a safe, version-pinned way to add tasks to the Action Center, only when Steven asks
- extra hand-offs between teammates

| Agent | Skill | Reads in the Venture Command Center |
|---|---|---|
| Marcus (CFO) | cfo-marcus | fin, funding, deals + SBA calculator, loans, incentives, valuations, net worth |
| Victor (CRO) | cro-victor | funnel, loans, clients, customers, deals, bids, contacts, scorecard |
| Sofia (CMO) | cmo-sofia | content calendar, funnel, profile |
| Alexandra (Compliance) | compliance-alexandra | certifications, deadlines, risks, loans, incentives |
| Derek (CTO) | cto-derek | tasks by source, automation rules and log, SOPs |
| Nadia (CAIO) | caio-nadia | automation rules, tasks, SOPs |
| Elena (CISO) | ciso-elena | risk register, security checklist |
| James (Wealth) | james-wealth | net worth, valuations, finance, foundation grants, estate/tax/benefit checklists |
| Vanessa (Broker) | vanessa-broker | loans, properties, clients, house-hack calculator, incentives |
| Cole (Mentor) | cole-mentor | time allocation, decision log, scorecard, overdue tasks |
| Apex (Trading) | apex-trader | net worth and finance only (capital separation) |

## Install

Open each `.skill` file in the Claude app and choose **Save skill**, or upload it under claude.ai
Settings → Capabilities → Skills. These personas are currently installed from plugins, so the saved
version appears as your own skill with the same name; turn off the old plugin copy if both show up.

The dashboard also runs the same personas directly in its **AI Team** tab.
