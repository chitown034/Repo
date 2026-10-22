import { expect, mock, test } from 'claude-code/testing'

const HALT = 'HALT rules: never send to a client, quote a rate, decide eligibility, sign, spend money, or enter credentials; drafts only; first names only.'
const NOW = Date.UTC(2026, 9, 22, 15, 0, 0)

// Nothing sits beneath the plugin: these hooks stand for the engine and record what the mod sent.
function engine(on: any) {
  const sent: string[] = []
  const registered: string[] = []
  const clock = mock.clock(on, { now: NOW })
  on('command.register', (_: any, e: any) => { registered.push(e.name); return { value: { command: e.name } } })
  on('session.start', (_: any, e: any) => ({ cwd: e.cwd }))
  on('prompt.submit', (_: any, e: any) => { sent.push(e.text); return { text: e.text } })
  return { sent, registered, clock }
}

test('registers every button, none a name Claude Code ships', async ($, on) => {
  const { registered } = engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  expect(registered.sort()).toEqual(['connect', 'cycle', 'help-buttons', 'inbox', 'meetings', 'queue', 'sync', 'tc', 'today'])
})

test('each one-word button sends its full prompt with the HALT line', async ($, on) => {
  const { sent, clock } = engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  const expectInPrompt: Record<string, string> = {
    cycle: 'cos-daily-cycle',
    inbox: 'create_draft',
    meetings: 'Fieldy and Zoom',
    sync: 'scripts/repo-sync.sh',
    connect: 'connect-all.sh --preview',
    tc: 'tcDeals',
    today: 'cosBrief',
  }
  for (const [name, needle] of Object.entries(expectInPrompt)) {
    const r = await $.command.run({ command: name } as any)
    await clock.advance(1)
    expect(r.text).toBe(`/${name}: sent the full prompt.`)
    const text = sent[sent.length - 1] ?? ''
    expect(text.includes(needle)).toBe(true)
    expect(text.endsWith(HALT)).toBe(true)
  }
  expect(sent.length).toBe(7)
})

test('/queue writes an append-only, pinned vanessaQueue item', async ($, on) => {
  const { sent, clock } = engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await $.command.run({ command: 'queue', args: '  call the appraiser about Maria  ' } as any)
  await clock.advance(1)
  const text = sent[0] ?? ''
  expect(text.includes('3jbdGMNFkGLEpJiZ3cTmZW')).toBe(true)
  expect(text.includes('if_version')).toBe(true)
  expect(text.includes(`"id":"vq_${NOW}"`)).toBe(true)
  expect(text.includes('"task":"call the appraiser about Maria"')).toBe(true)
  expect(text.includes('"priority":"p2","status":"pending","from":"claude-code"')).toBe(true)
})

test('/queue with no task only shows the usage', async ($, on) => {
  const { sent, clock } = engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  const r = await $.command.run({ command: 'queue' } as any)
  await clock.advance(1)
  expect(r.text).toBe('Usage: /queue <the task, in one sentence>')
  expect(sent.length).toBe(0)
})

test('/help-buttons lists them and sends nothing', async ($, on) => {
  const { sent } = engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  const r = await $.command.run({ command: 'help-buttons' } as any)
  for (const name of ['/cycle', '/inbox', '/meetings', '/sync', '/connect', '/tc', '/queue <task>', '/today']) {
    expect(r.text?.includes(name)).toBe(true)
  }
  expect(sent.length).toBe(0)
})
