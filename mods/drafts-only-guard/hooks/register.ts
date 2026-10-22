import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

const allowance = atom({ plugin: 'drafts-only-guard', key: 'allowance' } as const, 0)
const blocked = atom({ plugin: 'drafts-only-guard', key: 'blocked' } as const, 0)

// Connector tools that reach other people or destroy mail. Drafts, reads and searches pass.
const OUTBOUND =
  /^mcp__.*__(send_message|send_email|forward|reply|reply_all|slack_send_message|slack_schedule_message|trash_message|trash_thread|mark_message_spam|mark_thread_spam|delete_draft|delete_event)$/

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const started = await next(e)
    await $.command.register({
      name: 'allow-send',
      description: 'Let the next outbound connector action through (drafts-only guard)',
    })
    return started
  })

  on('command.run', { command: 'allow-send' }, async ($, e) => {
    const n = Math.min(10, Math.max(1, Number(e.args.trim()) || 1))
    await update($, allowance, () => n)
    return { text: `drafts-only-guard: the next ${n} outbound action${n > 1 ? 's' : ''} will go through.` }
  })

  on('tool.call', async ($, e, next) => {
    const name = String(e.tool)
    if (!OUTBOUND.test(name)) return next(e)
    const left = await read($, allowance)
    if (left > 0) {
      await update($, allowance, n => n - 1)
      return next(e)
    }
    const count = (await read($, blocked)) + 1
    await update($, blocked, () => count)
    $.ui.status(`drafts-only: ${count} blocked`)
    return {
      deny: `drafts-only-guard: ${name} sends, posts or deletes. Steven's automations are drafts-only — create a draft instead (e.g. create_draft or slack_send_message_draft). If Steven explicitly asked to send, ask him to type /allow-send first.`,
    }
  }).catch(($, e, next) => (next.called ? next(e) : { deny: 'drafts-only-guard: its check failed, so the action was held.' }))
}
