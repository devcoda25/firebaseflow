// Canonical list of sections & items.
// - `type` equals section key for easy analytics.
// - Optional `channels` can restrict visibility by channel (if you pass filterChannels).
import type { LucideIcon } from 'lucide-react';

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
  icon: string | LucideIcon
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
      { key: 'sendMessage',  label: 'Send a message',   icon: 'Send', type: 'main_actions', color: '#ef4444', description: 'With no response required from visitor' },
      { key: 'askQuestion', label: 'Ask a question',  icon: 'HelpCircle', type: 'main_actions',   color: '#f97316', description: 'Ask question and store user input in variable' },
      { key: 'setCondition',    label: 'Set a condition',icon: 'GitFork', type: 'main_actions',   color: '#3b82f6', description: 'Send message(s) based on logical condition(s)' },
    ]
  },
  {
    key: 'operations',
    title: 'Operations',
    items: [
        { key: 'subscribe', label: 'Subscribe', icon: 'BellPlus', type: 'operations' },
        { key: 'unsubscribe', label: 'Unsubscribe', icon: 'BellOff', type: 'operations' },
        { key: 'updateAttribute', label: 'Update Attribute', icon: 'Pencil', type: 'operations' },
        { key: 'setTags', label: 'Set tags', icon: 'Tags', type: 'operations' },
        { key: 'assignTeam', label: 'Assign Team', icon: 'Users', type: 'operations' },
        { key: 'assignUser', label: 'Assign User', icon: 'User', type: 'operations' },
        { key: 'triggerChatbot', label: 'Trigger Chatbot', icon: 'Bot', type: 'operations' },
        { key: 'updateChatStatus', label: 'Update Chat Status', icon: 'RefreshCcw', type: 'operations' },
    ]
  }
]
