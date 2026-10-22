import type { Register } from 'claude-code'

// Steven's GitHub repo is public. PPFC Trainual data lives only in the published VANESSA page.
const REPO = '/home/user/Repo'
const LEAK = 'const PPFC_(KB|LENDERS|FILETEXT|YT)\\s*=|app\\.trainual\\.com/3f387472|"comp":"[^"]*","nmls"|"sid":[0-9]{6,},"name"'
const GIT = /\bgit\b[^;&|]*\b(commit|push)\b/

export const register: Register = on => {
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    if (!GIT.test(e.command)) return next(e)
    // Tracked changes vs HEAD, untracked files, and commits not yet pushed.
    const tracked = await $.process.run(['git', '-C', REPO, 'diff', 'HEAD'])
    const unpushed = await $.process.run(['git', '-C', REPO, 'log', '-p', '@{u}..HEAD'])
    const untracked = await $.process.run(['git', '-C', REPO, 'ls-files', '--others', '--exclude-standard', '-z'])
    const files = untracked.stdout.split('\0').filter(Boolean)
    const hits: string[] = []
    const re = new RegExp(LEAK)
    if (re.test(tracked.stdout)) hits.push('uncommitted changes')
    if (unpushed.exitCode === 0 && re.test(unpushed.stdout)) hits.push('commits not yet pushed')
    if (files.length) {
      const grep = await $.process.run(['grep', '-lE', LEAK, '--', ...files], { cwd: REPO })
      if (grep.stdout.trim()) hits.push('new files: ' + grep.stdout.trim().split('\n').slice(0, 5).join(', '))
    }
    if (!hits.length) return next(e)
    $.ui.toast('public-repo-guard blocked a git commit/push')
    return {
      deny: `public-repo-guard: PPFC Trainual data (PPFC_KB / PPFC_LENDERS / AE comp terms / Trainual links) was found in ${hits.join('; ')} of ${REPO}, which is a PUBLIC GitHub repo. Remove it from the repo copy (it belongs only in the published VANESSA page — e.g. restore dist/_wrap.html with git checkout), then commit again.`,
    }
  }).catch(($, e, next) => (next.called ? next(e) : next(e)))
}
