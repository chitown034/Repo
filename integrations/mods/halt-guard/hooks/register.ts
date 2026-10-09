import type { Register } from 'claude-code'

// CLAUDE.md HALT list, the parts a tool call can show: sends, shares, client-facing writes,
// spending, and history rewrites. Matching is by tool name and, for Bash, by command text.
const RISKY_TOOL = /(send_message|send_email|_send$|text_send|imessage_send|email_send|email_reply|email_forward|^mcp__Gmail__(reply|forward)|share_file|create_event|update_event|slack_send|schedule_message|publish|payment|charge|transfer)/i
const RISKY_BASH = /(git\s+push\s+.*(--force|-f\b)|git\s+push\s+--mirror|curl\s+.*-X\s*(POST|PUT|DELETE)|\bnpm\s+publish\b|\bstripe\b|\bsendmail\b|osascript\s+.*(Messages|Mail))/i

function why(e: { tool: string; command?: string }): string | null {
  if (e.tool === 'Bash' && e.command && RISKY_BASH.test(e.command)) return `run: ${e.command.slice(0, 120)}`
  if (e.tool !== 'Bash' && RISKY_TOOL.test(e.tool)) return `use ${e.tool}`
  return null
}

export const register: Register = on => {
  on('tool.call', async ($, e, next) => {
    const reason = why(e as { tool: string; command?: string })
    if (!reason) return next(e)
    let answer: string
    try {
      answer = await $.ui.ask(`Claude wants to ${reason}. This is on the HALT list (a send, share, spend or force push). Proceed?`, ['Cancel', 'Proceed'])
    } catch {
      return next(e) // nobody at the keyboard (a scheduled run): the routine's own rules apply
    }
    return answer === 'Proceed' ? next(e) : { deny: `${$.plugin.name}: Steven chose Cancel for "${reason}".` }
  }).catch(($, e, next) => (next.called ? next(e) : { deny: `${$.plugin.name}: the guard failed, so the call was held.` }))
}
