export type ContextBarState = { isOn: boolean }

declare module 'claude-code' {
  interface PluginState {
    'context-bar': { isOn: boolean }
  }
}
