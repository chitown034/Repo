export type HqRun = { name: string; at: string }

declare module 'claude-code' {
  interface PluginState {
    'vanessa-hq': { runs: HqRun[] }
  }
}
