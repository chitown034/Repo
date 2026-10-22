import type { Register } from 'claude-code'

// Read-only pulse of the Repo folder at session start: where this Mac stands against GitHub, local edits, how old
// the brain loop report is, and whether connect-all ran today. Never pulls, commits, resets or writes anything;
// the only network call is a quiet `git fetch` with a short timeout, skipped silently when offline.
const BRANCH = 'claude/stoic-cori-pvn3f8'
const HOUR = 3_600_000

export type Pulse = {
  behind?: number
  ahead?: number
  edits?: number
  loopAgeMs?: number
  connectedToday?: boolean
}

export function age(ms: number): string {
  if (ms < HOUR) return `${Math.max(1, Math.round(ms / 60_000))}m`
  if (ms < 48 * HOUR) return `${Math.round(ms / HOUR)}h`
  return `${Math.round(ms / (24 * HOUR))}d`
}

export function line(p: Pulse): string {
  const parts: string[] = []
  if (p.behind === undefined || p.ahead === undefined) parts.push('GitHub not checked')
  else if (p.behind && p.ahead) parts.push(`${p.behind} behind, ${p.ahead} ahead (diverged)`)
  else if (p.behind) parts.push(`${p.behind} behind`)
  else if (p.ahead) parts.push(`${p.ahead} ahead`)
  else parts.push('up to date')
  if (p.edits !== undefined) parts.push(p.edits ? `${p.edits} local edit${p.edits === 1 ? '' : 's'}` : 'no local edits')
  if (p.loopAgeMs !== undefined) parts.push(`brain loop ${age(p.loopAgeMs)}`)
  if (p.connectedToday !== undefined) parts.push(p.connectedToday ? 'connect-all today' : 'connect-all not run today')
  return `⚙ repo: ${parts.join(' · ')} · /sync /cycle /today`
}

export function toast(p: Pulse): string | undefined {
  if (p.behind && p.ahead) return `This Mac and GitHub have both changed (${p.behind} behind, ${p.ahead} ahead) — type /sync`
  if (p.behind) return `GitHub has ${p.behind} new change${p.behind === 1 ? '' : 's'} — type /sync`
  return undefined
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const started = await next(e)
    // Runs after the session has started and is not awaited, so a slow fetch never holds the session up.
    void (async () => {
      const git = (args: string[], timeoutMs = 5000) =>
        $.process.run(['git', ...args], { cwd: e.cwd, timeoutMs }).catch(() => ({ exitCode: 1, stdout: '', stderr: '' }))

      const top = await git(['rev-parse', '--show-toplevel'])
      if (top.exitCode !== 0) return
      const root = top.stdout.trim()
      // The Repo folder only: the second brain's own router and CLI are both there.
      const isRepo = (await $.fs.exists(`${root}/bin/brain`).catch(() => false)) && (await $.fs.exists(`${root}/CLAUDE.md`).catch(() => false))
      if (!isRepo) return

      const p: Pulse = {}
      const fetched = await git(['fetch', '--quiet', 'origin', BRANCH], 8000)
      const counts = await git(['rev-list', '--left-right', '--count', `HEAD...origin/${BRANCH}`])
      if (fetched.exitCode === 0 && counts.exitCode === 0) {
        const [ahead, behind] = counts.stdout.trim().split(/\s+/).map(Number)
        if (Number.isFinite(ahead) && Number.isFinite(behind)) Object.assign(p, { ahead, behind })
      }
      const status = await git(['status', '--porcelain'])
      if (status.exitCode === 0) p.edits = status.stdout.split('\n').filter(l => l.trim()).length

      const now = await $.clock.now()
      const loop = await $.fs.stat(`${root}/docs/reports/BRAIN-LOOP.md`).catch(() => undefined)
      if (loop) p.loopAgeMs = Math.max(0, now - loop.mtimeMs)

      const home = (await $.process.run(['printenv', 'HOME']).catch(() => ({ stdout: '' }))).stdout.trim()
      const logs = home ? await $.fs.list(`${home}/Library/Logs/vanessa-setup`).catch(() => undefined) : undefined
      if (logs) {
        const newest = Math.max(0, ...logs.filter(f => /^connect-.*\.log$/.test(f.name)).map(f => f.mtimeMs))
        p.connectedToday = newest > 0 && new Date(newest).toDateString() === new Date(now).toDateString()
      }

      $.ui.status(line(p))
      const say = toast(p)
      if (say) $.ui.toast(say)
    })().catch(() => undefined)
    return started
  })
}
