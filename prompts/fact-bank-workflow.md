# Fact-bank resume workflow

These four prompts are copied word for word from the screenshots. RoleCompass runs
adapted versions of them in **Evidence vault → Fact-bank workflow** (prompts 1, 2
and 4) and the **AI skills** tab (prompt 3). In the dashboard, your vault is the
fact bank and the job record is the job post. The copies below are for any chat.

Run them in order, in one conversation.

## 1. Build the fact bank

```
Interview me like you're writing a short biography of my work. Your job is to build a fact bank. Ask 1 question at a time. Cover each job and side project. For each, find the problem, what I did myself, who shared the work, and what changed. Look for real numbers and ask where I could check them. If I can't explain a result or what caused it, mark it unverified and move on after 2 follow-up questions. Once you've covered every role, give me only 2 brief lists: facts I reported with ways to check them, and my claims that still need proof. Start with 1 question.
```

## 2. Tailor to a job post

```
Use my fact bank and the job post below. Give me 3 things:

1. Rank the 5 most important job needs, label each required or preferred, and show my proof or "no proof yet."

2. Write a short, plain-text resume for this role. Bullet 1 must prove the highest-ranked need I can actually support. If I have no proof for need 1, use the next required need with proof. Put my best relevant number or result in bullet 2, unless it is already in bullet 1. Give more space to recent relevant work; use max 2 bullets for an older, less relevant job. Combine repeated duties. Each bullet should show my action and its result, preferably with numbers. Keep my titles, dates, and level of ownership. Use simple headings, no tables, and no "I" or "my" in bullets.

3. Be brutally honest and judge whether I am a good fit.

Here is the full job post: [PASTE JOB POST]
```

## 3. Find your AI skills

```
Review all our chats the past 60 days.

Identify my AI skills that I can put in my resume.
```

## 4. Critical review and final resume

```
Review the resume you just wrote against the job post and my fact bank.

Would you invite me to interview? Give up to 3 strong reasons and 3 doubts, pointing to exact lines or gaps.

Check the top of the page: does bullet 1 prove the highest-ranked required need with evidence, or the next required need I can prove? Does bullet 2 show my best relevant number or result, unless bullet 1 already does? Does an older job take too much space? Then fix only problems that my "facts bank" supports.

Return a FINAL RESUME in plain text that I can paste into a document. Lead with my newest relevant job. Keep an older, less relevant job to at most 2 bullets by combining related work. Start each bullet with an action verb. Use no "I" or "my". Remove numbers with no basis.

Last, ask me 3 tough interview questions relevant to the job.
```
