import { expect, mock, test } from 'claude-code/testing'

const NOW = Date.UTC(2026, 9, 22, 18, 0, 0)
const HOUR = 3_600_000

type World = {
  isRepo?: boolean
  fetchOk?: boolean
  counts?: string // `git rev-list --left-right --count` output: "<ahead>\t<behind>"
  porcelain?: string
  loopAgeMs?: number
  connectLogAgeMs?: number // undefined = no connect log at all
}

// Nothing sits beneath the plugin: these hooks stand for the engine (git, the file system, the screen).
function engine(on: any, w: World) {
  const ran: string[][] = []
  const status: (string | undefined)[] = []
  const toasts: string[] = []
  const clock = mock.clock(on, { now: NOW })
  on('session.start', (_: any, e: any) => ({ cwd: e.cwd }))
  on('process.run', (_: any, e: any) => {
    const argv = [...e.argv] as string[]
    ran.push(argv)
    const ok = (stdout: string) => ({ value: { exitCode: 0, stdout, stderr: '' } })
    const fail = { value: { exitCode: 1, stdout: '', stderr: 'nope' } }
    if (argv[0] === 'printenv') return ok('/Users/steven\n')
    if (argv[1] === 'rev-parse') return ok('/Users/steven/Repo\n')
    if (argv[1] === 'fetch') return w.fetchOk === false ? { value: { exitCode: 128, stdout: '', stderr: 'Could not resolve host' } } : ok('')
    if (argv[1] === 'rev-list') return ok(w.counts ?? '0\t0\n')
    if (argv[1] === 'status') return ok(w.porcelain ?? '')
    return fail
  })
  on('fs.exists', () => ({ value: w.isRepo !== false }))
  on('fs.stat', (_: any, e: any) =>
    e.path.endsWith('docs/reports/BRAIN-LOOP.md') && w.loopAgeMs !== undefined
      ? { value: { kind: 'file', size: 10, mtimeMs: NOW - w.loopAgeMs, isLink: false } }
      : { deny: 'ENOENT' })
  on('fs.list', (_: any, e: any) =>
    e.path.endsWith('Library/Logs/vanessa-setup') && w.connectLogAgeMs !== undefined
      ? { value: [{ name: 'connect-20261022.log', kind: 'file', size: 10, mtimeMs: NOW - w.connectLogAgeMs, isLink: false }, { name: 'other.log', kind: 'file', size: 1, mtimeMs: NOW, isLink: false }] }
      : { deny: 'ENOENT' })
  on('ui.status', (_: any, e: any) => { status.push(e.text); return { value: undefined } })
  on('ui.toast', (_: any, e: any) => { toasts.push(e.text); return { value: undefined } })
  return { ran, status, toasts, clock }
}

async function start($: any, clock: any) {
  await $.session.start({ cwd: '/Users/steven/Repo', surface: 'terminal', isInteractive: true })
  await clock.advance(1)
}

test('behind GitHub: status line and a /sync toast', async ($, on) => {
  const w = engine(on, { counts: '0\t3\n', porcelain: ' M a.md\n?? b.md\n', loopAgeMs: 6 * HOUR, connectLogAgeMs: HOUR })
  await start($, w.clock)
  expect(w.status).toEqual(['⚙ repo: 3 behind · 2 local edits · brain loop 6h · connect-all today · /sync /cycle /today'])
  expect(w.toasts).toEqual(['GitHub has 3 new changes — type /sync'])
})

test('diverged: says so and toasts', async ($, on) => {
  const w = engine(on, { counts: '2\t1\n', loopAgeMs: 30 * 60_000 })
  await start($, w.clock)
  expect(w.status[0]).toBe('⚙ repo: 1 behind, 2 ahead (diverged) · no local edits · brain loop 30m · /sync /cycle /today')
  expect(w.toasts[0]).toBe('This Mac and GitHub have both changed (1 behind, 2 ahead) — type /sync')
})

test('up to date: no toast; an old connect log reads as not run today', async ($, on) => {
  const w = engine(on, { connectLogAgeMs: 30 * HOUR })
  await start($, w.clock)
  expect(w.status[0]).toBe('⚙ repo: up to date · no local edits · connect-all not run today · /sync /cycle /today')
  expect(w.toasts).toEqual([])
})

test('offline: the fetch fails, GitHub is not checked, no toast', async ($, on) => {
  const w = engine(on, { fetchOk: false, counts: '0\t9\n' })
  await start($, w.clock)
  expect(w.status[0]).toBe('⚙ repo: GitHub not checked · no local edits · /sync /cycle /today')
  expect(w.toasts).toEqual([])
})

test('outside the Repo folder it shows nothing', async ($, on) => {
  const w = engine(on, { isRepo: false, counts: '0\t3\n' })
  await start($, w.clock)
  expect(w.status).toEqual([])
  expect(w.toasts).toEqual([])
})

test('read-only: only fetch, rev-parse, rev-list, status and printenv ever run', async ($, on) => {
  const w = engine(on, { counts: '1\t4\n', porcelain: ' M x\n' })
  await start($, w.clock)
  const verbs = w.ran.map(a => (a[0] === 'git' ? a[1] : a[0]))
  for (const v of verbs) expect(['rev-parse', 'fetch', 'rev-list', 'status', 'printenv'].includes(v ?? '')).toBe(true)
  expect(w.ran.find(a => a[1] === 'fetch')).toEqual(['git', 'fetch', '--quiet', 'origin', 'claude/stoic-cori-pvn3f8'])
})
