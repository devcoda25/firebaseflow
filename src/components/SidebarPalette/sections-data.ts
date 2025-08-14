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
      key: 'triggers',
      title: 'Triggers',
      items: [
          { key: 'keyword', label: 'Keyword',  icon: 'AtSign', type: 'triggers',   color: 'hsl(262 83% 58%)', description: 'Triggered by a specific keyword' },
          { key: 'default_action', label: 'Default Action',  icon: 'PlayCircle', type: 'triggers',   color: 'hsl(262 83% 58%)', description: 'Default flow for new conversations' },
      ]
    },
    {
      key: 'messaging',
      title: 'Messaging',
      items: [
          { key: 'message', label: 'Send a Message', icon: 'Send', type: 'messaging', color: 'hsl(16 84% 62%)', description: 'Send text, media, or interactive messages' },
          { key: 'askQuestion', label: 'Ask a Question', icon: 'HelpCircle', type: 'inputs', color: 'hsl(221 83% 53%)', description: 'Ask a question and wait for a user reply' },
          { key: 'sendTemplate', label: 'Send a Template', icon: 'Mailbox', type: 'messaging', color: 'hsl(16 84% 62%)', description: 'Send a pre-approved template message', channels: ['whatsapp'] },
      ]
    },
    {
      key: 'logic',
      title: 'Logic & Flow',
      items: [
          { key: 'condition', label: 'Set a Condition', icon: 'GitFork', type: 'logic', color: 'hsl(262 83% 58%)', description: 'Branch the flow based on conditions' },
          { key: 'delay', label: 'Add a Delay', icon: 'Timer', type: 'logic', color: 'hsl(262 83% 58%)', description: 'Pause the flow for a specific duration' },
          { key: 'updateAttribute', label: 'Update Attribute', icon: 'PenSquare', type: 'logic', color: 'hsl(262 83% 58%)', description: 'Update a contact or flow variable' },
          { key: 'goto', label: 'Go to another step', icon: 'MoveRight', type: 'logic', color: 'hsl(262 83% 58%)', description: 'Jump to another node in the flow' },
          { key: 'end', label: 'End of Flow', icon: 'FlagOff', type: 'end', color: 'hsl(262 83% 58%)', description: 'Explicitly terminate the flow' },
      ]
    },
    {
      key: 'integrations',
      title: 'Integrations',
      items: [
          { key: 'apiCallout', label: 'Webhook', icon: 'Webhook', type: 'integrations', color: 'hsl(346.8 77.2% 49.8%)', description: 'Make an HTTP request to an external service' },
          { key: 'googleSheets', label: 'Google Sheets', icon: 'Table', type: 'integrations', color: 'hsl(142.1 76.2% 36.3%)', description: 'Append a row to a Google Sheet' },
      ]
    }
  ]
  