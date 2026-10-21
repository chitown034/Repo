import type { Register } from 'claude-code'

// Reads the "Start here" section of docs/STEVEN-STEPS.md — the same text the Action Desk shows — so the
// non-technical answer to "what do I paste?" is one slash command away. Writes nothing, runs nothing.
export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'paste', description: 'The one Terminal paste for this Mac, and the short list only you can do' })
    return next(e)
  })

  on('command.run', { command: 'paste' }, async $ => {
    const r = await $.process.run(['git', 'rev-parse', '--show-toplevel'])
    if (r.exitCode !== 0) return { text: 'Open Claude Code in your Repo folder and try again.' }
    let md = ''
    try { md = await $.fs.read(`${r.stdout.trim()}/docs/STEVEN-STEPS.md`) } catch { return { text: 'docs/STEVEN-STEPS.md is missing — run: git pull' } }
    const start = md.indexOf('## Start here')
    if (start < 0) return { text: 'No "Start here" section in docs/STEVEN-STEPS.md yet.' }
    const rest = md.slice(start + 3)
    const end = rest.indexOf('\n## ')
    const section = '## ' + (end < 0 ? rest : rest.slice(0, end))
    return { text: section.trim() + '\n\nTick the step off on the Action Desk: https://claude.ai/artifact/9S8G2ZhhqP1iUsPZrPsmRn' }
  })
}
