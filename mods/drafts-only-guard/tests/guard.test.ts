import { expect, test } from 'claude-code/testing'

test('a send is denied, a draft passes, /allow-send lets one through', async ($, on) => {
  on('command.register', () => ({ value: { command: 'allow-send' } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('tool.call', () => ({ result: {} }))
  on('command.run', () => ({ text: '' }))
  on('ui.status', () => ({ value: undefined }))

  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

  const sent = await $.tool.call({ tool: 'mcp__Gmail__send_message', to: ['a@b.co'], body: 'hi' } as never)
  expect(String((sent as { text?: string }).text ?? (sent as { deny?: string }).deny)).toContain('drafts-only')

  const draft = await $.tool.call({ tool: 'mcp__Gmail__create_draft', body: 'hi' } as never)
  expect((draft as { deny?: string }).deny).toBeUndefined()

  await $.command.run({ command: 'allow-send', args: '' } as never)
  const allowed = await $.tool.call({ tool: 'mcp__Slack__slack_send_message', channel_id: 'C1', message: 'x' } as never)
  expect((allowed as { deny?: string }).deny).toBeUndefined()

  const again = await $.tool.call({ tool: 'mcp__Slack__slack_send_message', channel_id: 'C1', message: 'x' } as never)
  expect(String((again as { deny?: string }).deny)).toContain('drafts-only')
})
