import type { Register } from 'claude-code'

// Zero-token: everything here comes from `bin/brain toolkit` and `bin/brain owner`, which only read the tree.
async function repoRoot($: any): Promise<string> {
  const r = await $.process.run(['git', 'rev-parse', '--show-toplevel'])
  return r.exitCode === 0 ? r.stdout.trim() : ''
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'connections', description: 'What is not connected, and the fix for each (bin/brain toolkit)' })
    await $.command.register({ name: 'owner', description: 'Who keeps a Command Deck panel alive and what stays yours (bin/brain owner <panel>)' })
    const started = await next(e)
    const root = await repoRoot($)
    if (!root) return started
    const check = async () => {
      const ran = await $.process.run([`${root}/bin/brain`, 'toolkit', '--json'])
      if (ran.exitCode !== 0) return
      try {
        const c = JSON.parse(ran.stdout).counts
        $.ui.status(c.connector_attention ? `Connections: ${c.connector_attention} need you · ${c.connector_ok} ok` : `Connections: all ${c.connector_ok} ok`)
      } catch { /* leave the status line alone */ }
    }
    await check()
    $.clock.every(10 * 60_000, check)
    return started
  })

  on('command.run', { command: 'connections' }, async $ => {
    const root = await repoRoot($)
    if (!root) return { text: 'Open Claude Code in your Repo folder (where bin/brain lives) and try again.' }
    const ran = await $.process.run([`${root}/bin/brain`, 'toolkit'])
    return { text: ran.exitCode === 0 ? ran.stdout.trim() : `bin/brain toolkit failed: ${ran.stderr.trim()}` }
  })

  on('command.run', { command: 'owner' }, async ($, e) => {
    const q = e.args.trim()
    if (!q) return { text: 'Usage: /owner <panel or system>, e.g. /owner marketing' }
    const root = await repoRoot($)
    if (!root) return { text: 'Open Claude Code in your Repo folder (where bin/brain lives) and try again.' }
    const ran = await $.process.run([`${root}/bin/brain`, 'owner', q])
    return { text: (ran.stdout || ran.stderr).trim() }
  })
}
