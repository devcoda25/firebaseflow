// Canonical list of sections & items.
// - Icons are emoji for simplicity (swap for SVGs anytime).
// - `type` equals section key for easy analytics.
// - Optional `channels` can restrict visibility by channel (if you pass filterChannels).

export type NodeCategory =
  | 'main_actions'
  | 'operations'
  | 'triggers'
  | 'messaging'
  | 'inputs'
  | 'logic'
  | 'timing'
  | 'integrations'
  | 'outreach'
  | 'handoff'
  | 'analytics'
  | 'automation'
  | 'updates'
  | 'end'

export type Channel =
  | 'whatsapp' | 'sms' | 'email' | 'push' | 'voice' | 'instagram'
  | 'messenger' | 'webchat' | 'slack' | 'teams' | 'telegram'

export type PaletteItemPayload = {
  key: string
  label: string
  icon: string
  type: NodeCategory
  color?: string
  description?: string
}

export type ItemDefinition = PaletteItemPayload & {
  channels?: Channel[]
  keywords?: string[] // improves search discoverability
}

export type SectionDefinition = {
  key: NodeCategory
  title: string
  items: ItemDefinition[]
}

export const SECTION_DATA: SectionDefinition[] = [
  {
    key: 'main_actions',
    title: 'Main Actions',
    items: [
      { key: 'sendMessage',  label: 'Send a message',   icon: '💬', type: 'main_actions', color: '#ef4444', description: 'With no response required from visitor' },
      { key: 'askQuestion', label: 'Ask a question',  icon: '❓', type: 'main_actions',   color: '#f97316', description: 'Ask question and store user input in variable' },
      { key: 'setCondition',    label: 'Set a condition',icon: '🔀', type: 'main_actions',   color: '#3b82f6', description: 'Send message(s) based on logical condition(s)' },
    ]
  },
  {
    key: 'operations',
    title: 'Operations',
    items: [
        { key: 'subscribe', label: 'Subscribe', icon: '🔔', type: 'operations' },
        { key: 'unsubscribe', label: 'Unsubscribe', icon: '🔕', type: 'operations' },
        { key: 'updateAttribute', label: 'Update Attribute', icon: '✏️', type: 'operations' },
        { key: 'setTags', label: 'Set tags', icon: '🏷️', type: 'operations' },
        { key: 'assignTeam', label: 'Assign Team', icon: '👥', type: 'operations' },
        { key: 'assignUser', label: 'Assign User', icon: '👤', type: 'operations' },
        { key: 'triggerChatbot', label: 'Trigger Chatbot', icon: '⚡', type: 'operations' },
        { key: 'updateChatStatus', label: 'Update Chat Status', icon: '🔄', type: 'operations' },
    ]
  }
]
