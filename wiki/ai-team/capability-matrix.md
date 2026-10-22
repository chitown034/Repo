# Capability matrix — what each seat can reach (2026-10-11)

Every seat reaches these through Vanessa's dispatch (`bin/brain route`), never by editing a live agent prompt (those change only through the weekly-self-update gate). A tick means the seat may use it for its own lane; every use stops at the HALT list.

| Capability | What it is | Marcus | Sofia | Derek | Alexandra | Nadia | Victor | Elena | Elon | Harrison | Apex | Kevin |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Browser hands (agent-browser, Playwright MCP) | Read, search and fill websites; stop before submit/send/pay | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | review | ✓ | ✓ | ✓ | – |
| Skill finder (`find-skills`) | Find a skill for the task; Elon and Elena gate any add | ✓ | ✓ | ✓ | – | ✓ | ✓ | gate | gate | – | – | – |
| Weekly scout | New repos, skills, MCP servers, upgrades | – | – | ✓ | – | grades | – | gate | gate | – | – | – |
| Tax Assessor Agent | Public county records → Property Tax Sheet | ✓ | – | – | – | – | ✓ | – | – | ✓ | – | – |
| Loan Pricing Prep Agent | Scenario worksheet, never a quote | ✓ | – | – | review | – | ✓ | – | – | ✓ | – | – |
| Reverse-engineering gate (REA) | Owned or licensed software only | – | – | ✓ | gate | proposes | – | gate | ✓ | – | – | – |
| Trading Research Desk | Paper-only strategy research loop | ✓ | – | – | – | – | – | – | – | – | ✓ | – |
| Events scout | Weekly events and networking by city | – | – | – | – | – | ✓ | – | – | – | – | ✓ |
| Computer Hub (Claude Remote Control, Orca, AnyDesk) | Reach every computer | – | – | ✓ | – | – | – | gate | ✓ | – | – | – |
| Dispatch planner (`bin/brain route`) | Lead, joins, waves, gates, HALTs | all seats, through Vanessa |||||||||||

"gate" = the seat reviews before anything is added or used; "review" = the seat checks the output; "–" = not in that seat's lane (ask Vanessa, who routes it). Steven's yes is required for any send, spend, signature, account change or live order.
