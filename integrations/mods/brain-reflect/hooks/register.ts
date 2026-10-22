import type { Register } from 'claude-code'

// Contact details, account-like numbers and money never go into a saved rule.
const PRIVATE = /([\w.+-]+@[\w-]+\.[\w.]+|\(?\d{3}\)?[ .-]\d{3}[ .-]\d{4}|\d{6,}|\$\s?\d)/

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'remember', description: 'Save a standing rule into the second brain (bin/brain remember)' })
    return next(e)
  })

  on('command.run', { command: 'remember' }, async ($, e) => {
    const fact = e.args.trim()
    if (!fact) return { text: 'Usage: /remember <the rule, in one sentence>' }
    if (PRIVATE.test(fact)) return { text: 'Not saved: it holds an email, phone number, long number or dollar amount. Say the rule without them.' }
    const ran = await $.process.run(['bin/brain', 'remember', fact, '--source', 'brain-reflect'])
    if (ran.exitCode === 127 || /No such file/.test(ran.stderr)) return { text: 'Not saved: open Claude Code in your Repo folder (where bin/brain lives) and try again.' }
    return { text: ran.exitCode === 0 ? ran.stdout.trim() : `Not saved: ${ran.stderr.trim() || 'bin/brain remember failed'}` }
  })
}
