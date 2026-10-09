import type { Register } from 'claude-code'

// Reads the one-word mode file that integrations/omniroute-failover/claude-auto.sh writes.
const LABEL: Record<string, string> = {
  subscription: 'Route: Claude subscription',
  'free-fallback': 'Route: OmniRoute free (Claude limit hit)',
  'paid-backup': 'Route: OpenRouter paid backup ($25 cap)',
  'local-only': 'Route: local model only (client data)',
}

export const register: Register = on => {
  let last = ''

  on('session.start', async ($, e, next) => {
    const started = await next(e)
    const home = (await $.process.run(['printenv', 'HOME'])).stdout.trim()
    const cfg = (await $.process.run(['printenv', 'OMNIROUTE_CFG'])).stdout.trim() || `${home}/.config/omniroute`
    const check = async () => {
      let mode = 'subscription'
      try {
        mode = (await $.fs.read(`${cfg}/state/mode`)).trim() || 'subscription'
      } catch {
        mode = 'subscription' // no failover installed yet: the session is on the subscription
      }
      const text = LABEL[mode] ?? `Route: ${mode}`
      $.ui.status(text)
      if (last && mode !== last) $.ui.toast(`Switched: ${text}`)
      last = mode
    }
    await check()
    $.clock.every(30_000, check)
    return started
  })
}
