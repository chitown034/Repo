import type { Register } from 'claude-code'

// One word in, the full prompt out: each command sends the workflow's whole, correct prompt as Steven's own
// words, so he never has to remember how to ask. Every prompt carries the HALT line. Sends nothing itself.
export const HALT =
  'HALT rules: never send to a client, quote a rate, decide eligibility, sign, spend money, or enter credentials; drafts only; first names only.'

const DECK = 'https://claude.ai/artifact/3jbdGMNFkGLEpJiZ3cTmZW'
const BRANCH = 'claude/stoic-cori-pvn3f8'

type Button = { description: string; argumentHint?: string; prompt: (args: string, ms: number) => string }

export type Name = 'cycle' | 'inbox' | 'meetings' | 'sync' | 'connect' | 'tc' | 'queue' | 'today'

export const BUTTONS: Record<Name, Button> = {
  cycle: {
    description: "Run Vanessa's Chief-of-Staff daily cycle now (cos-daily-cycle)",
    prompt: () =>
      "Run the cos-daily-cycle skill now: Vanessa's Chief-of-Staff cycle, attended. Read the backlog once, sort every item into Automation / AI team / ISA-EA / Steven, dispatch the squads, QA, and write cosBrief with at most 3 Needs-Steven items and the measured 80/20 split. Drafts only. End with the Needs-Steven list in plain words.",
  },
  inbox: {
    description: 'Triage Gmail from the last 24 hours: drafts only, fraud flags, Needs-Steven list',
    prompt: () =>
      'Triage my Gmail from the last 24 hours. Group what came in (clients and leads, lenders/escrow/title, team, admin, noise). For anything that needs a reply, write a reply as a Gmail draft with create_draft only; never send, reply, forward or label. Flag possible fraud: wire or payoff instructions, changed bank details, urgent money requests, look-alike sender addresses. End with a short Needs-Steven list (most important first) and the drafts you created.',
  },
  meetings: {
    description: 'Recap recent Fieldy/Zoom meetings: decisions, action items, follow-up as a Gmail draft',
    prompt: () =>
      'Recap my recent meetings from Fieldy and Zoom (last 48 hours unless I say otherwise). For each one: a short recap, the decisions made, and the action items with an owner and a due date where one was said. Then write one follow-up per meeting as a Gmail draft with create_draft only; never send. Calendar attendees are invitees, not proof of attendance. End with what needs me.',
  },
  sync: {
    description: 'Bring this Repo folder up to date with GitHub and report (never pushes)',
    prompt: () =>
      `Sync this Repo folder with GitHub. If scripts/repo-sync.sh exists, run \`bash scripts/repo-sync.sh\` and report its result in plain words. If it does not exist, run \`git fetch origin ${BRANCH} && git status -sb\` and tell me how far behind or ahead I am and which files have local edits. Never push, never commit, never delete or reset my work.`,
  },
  connect: {
    description: 'Preview connect-all.sh and explain what is still left to connect',
    prompt: () =>
      "Run `bash connect-all.sh --preview` (it changes nothing) and explain in plain words what is already connected and what is left. For each thing left, say whether you can do it or only I can (sign-ins, permissions, account changes), and give me the one Terminal line to paste if there is one. Do not run connect-all.sh without --preview.",
  },
  tc: {
    description: 'Transaction & Showing desk: timelines, due in 7 days, overdue, reminder drafts',
    prompt: () =>
      `Act as the Transaction & Showing desk. Read tcDeals and tcDesk from the Command Deck (ArtifactData, url ${DECK}, collection state). For each open deal build the timeline from the dates in tcDeals only (never assume default contract periods), then list what is due in the next 7 days and anything overdue, and the missing documents. Write reminder or confirmation messages as drafts only, for me to review. End with what needs me.`,
  },
  queue: {
    description: "Add a task to Vanessa's queue on the Command Deck",
    argumentHint: '<task>',
    prompt: (task, ms) => {
      const item = { id: `vq_${ms}`, ts: new Date(ms).toISOString(), task, priority: 'p2', status: 'pending', from: 'claude-code' }
      return `Add one task to Vanessa's queue on the Command Deck. Use ArtifactData on url ${DECK}, collection state, doc_id vanessaQueue: get it first and note its version, then append exactly this item to the end of its v array (the document is {v: [ ...items ]}) and write it back with set and if_version set to the version you read. Append only: never remove, reorder or rewrite existing items. If the document does not exist, create it as {v: [this item]}. If the pinned write fails because the document changed, read it again and retry once. Item: ${JSON.stringify(item)}. Do not do the task itself; confirm the item id when it is queued.`
    },
  },
  today: {
    description: "Read today's cosBrief from the Command Deck and summarise what needs you",
    prompt: () =>
      `Read cosBrief from the Command Deck (ArtifactData, url ${DECK}, collection state, doc_id cosBrief). Summarise today's Needs-you items in plain words, most important first, with the brief's own date and time (say how old it is). If the brief is not from today, say so and offer /cycle. Change nothing.`,
  },
}

const HELP = [
  'Push buttons: type one word, Claude gets the whole prompt.',
  ...Object.entries(BUTTONS).map(([name, b]) => `  /${name}${b.argumentHint ? ' ' + b.argumentHint : ''} — ${b.description}`),
  '  /help-buttons — this list',
  'Every button carries the HALT rules: drafts only, nothing sent, no rates, no eligibility, no signatures, no spending, no passwords, first names only.',
].join('\n')

export function expand(name: Name, args: string, ms: number): string {
  return `${BUTTONS[name].prompt(args, ms)}\n\n${HALT}`
}

// Sends the expanded prompt as Steven's own words. A command.run hook may not submit a prompt itself (the engine
// refuses: it would wait on the turn the hook is holding), so the submit runs from a zero-delay timer once the
// command has finished, and the prompt starts its own turn as soon as the session is idle.
async function press($: any, name: Name, typed: string | undefined) {
  const args = (typed ?? '').trim()
  if (name === 'queue' && !args) return { text: 'Usage: /queue <the task, in one sentence>' }
  const text = expand(name, args, await $.clock.now())
  $.clock.after(0, () => { $.prompt.submit({ text, asUser: true }).catch(() => $.ui.toast(`/${name}: could not send the prompt; try again`)) })
  return { text: `/${name}: sent the full prompt.` }
}

// /recap and /brief are names Claude Code ships (validate: "$.command.register refuses it"), so the meeting recap
// is /meetings and the cosBrief read-out is /today.
// Names are written out literally (not looped) so `claude plugin validate` reads each hook as answering its own
// command rather than as a gate on someone else's.
export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'cycle', description: BUTTONS.cycle.description })
    await $.command.register({ name: 'inbox', description: BUTTONS.inbox.description })
    await $.command.register({ name: 'meetings', description: BUTTONS.meetings.description })
    await $.command.register({ name: 'sync', description: BUTTONS.sync.description })
    await $.command.register({ name: 'connect', description: BUTTONS.connect.description })
    await $.command.register({ name: 'tc', description: BUTTONS.tc.description })
    await $.command.register({ name: 'queue', description: BUTTONS.queue.description, argumentHint: '<task>' })
    await $.command.register({ name: 'today', description: BUTTONS.today.description })
    await $.command.register({ name: 'help-buttons', description: 'List the one-word push buttons' })
    return next(e)
  })

  on('command.run', { command: 'cycle' }, ($, e) => press($, 'cycle', e.args))
  on('command.run', { command: 'inbox' }, ($, e) => press($, 'inbox', e.args))
  on('command.run', { command: 'meetings' }, ($, e) => press($, 'meetings', e.args))
  on('command.run', { command: 'sync' }, ($, e) => press($, 'sync', e.args))
  on('command.run', { command: 'connect' }, ($, e) => press($, 'connect', e.args))
  on('command.run', { command: 'tc' }, ($, e) => press($, 'tc', e.args))
  on('command.run', { command: 'queue' }, ($, e) => press($, 'queue', e.args))
  on('command.run', { command: 'today' }, ($, e) => press($, 'today', e.args))
  on('command.run', { command: 'help-buttons' }, async () => ({ text: HELP }))
}
