# Natively interview copilot (Mac)

[Natively](https://github.com/Natively-AI-assistant/natively-cluely-ai-assistant) is a desktop app that listens to a call, transcribes it and suggests answers in an overlay. It has to capture your Mac's audio, so it runs as an app on your Mac, not inside the RoleCompass web page. RoleCompass supplies what it should know about you: **Interview lab → Natively copilot pack** builds a context file from your verified facts, STAR stories, prepared answers, pitch and the target posting, with rules that stop it inventing numbers or touching anything sensitive.

License: personal, non-commercial use only (Natively Personal Use Source License). Free tier includes a 30-minute trial; loading a résumé or reference files may need a paid Natively plan or your own model API key.

## Install

```bash
brew install --cask Natively-AI-assistant/tap/natively
```

No Homebrew? Download the macOS build from the [latest release](https://github.com/Natively-AI-assistant/natively-cluely-ai-assistant/releases/latest). macOS 12 or newer. On first launch, grant Microphone and Screen & System Audio Recording in System Settings → Privacy & Security.

## Load your context

1. RoleCompass → **Interview lab** → **Natively copilot pack** → pick the role → **Download pack (.md)**.
2. In Natively, open the mode you'll use ("Looking for Work" for interviews), then add the file under **Reference Files / Custom Context**. Paste the job posting into **Role Insight** if you want its coverage check.
3. Rebuild the pack after you add facts or stories in RoleCompass; Natively only knows what the file says.

## Practice

Run a mock with someone, or play an interview question video, and let Natively suggest answers. Compare its suggestion with what you said, then record the better version in RoleCompass → Mock video studio. That's where the scoring and progress tracking live.

## Live interviews: read this first

- **Consent is the law here.** California Penal Code 632 makes it a crime to record or eavesdrop on a confidential conversation without everyone's consent, and Natively transcribes the interviewer's side. Ask at the start ("Do you mind if I use an AI note-taker?"). If they say no, close Natively.
- **Employer rules.** Many employers and federal panels prohibit outside help during interviews. Being found using a hidden assistant typically ends the process. For cleared roles, honesty problems can follow you into the adjudication record.
- **What it's good for, honestly:** keeping your numbers straight (budgets, team sizes, dates) and reminding you of the right story. Read answers in your own words; recited text sounds recited.

Natively advertises an "Undetectable" mode that hides it from screen shares. Nothing in RoleCompass enables or relies on it.
