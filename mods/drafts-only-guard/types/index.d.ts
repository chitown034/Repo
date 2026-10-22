export type DraftsOnlyCount = number

declare module 'claude-code' {
  interface PluginState {
    'drafts-only-guard': { allowance: DraftsOnlyCount; blocked: DraftsOnlyCount }
  }
}
