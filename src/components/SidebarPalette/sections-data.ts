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
        { key: 'schedule', label: 'Schedule',  icon: 'Clock', type: 'triggers',   color: 'hsl(262 83% 58%)', description: 'Triggered at a specific time or interval' },
        { key: 'webhook',    label: 'Webhook',icon: 'Webhook', type: 'triggers',   color: 'hsl(262 83% 58%)', description: 'Triggered by an external HTTP request' },
    ]
  },
  {
    key: 'messaging',
    title: 'Messaging',
    items: [
        { key: 'message', label: 'Message', icon: 'Send', type: 'messaging', color: 'hsl(16 84% 62%)', description: 'Send text, media, or interactive messages' },
        { key: 'sendTemplate', label: 'Send Template', icon: 'Mailbox', type: 'messaging', color: 'hsl(16 84% 62%)', description: 'Send a pre-approved template message', channels: ['whatsapp'] },
        { key: 'sendCarousel', label: 'Send Carousel', icon: 'Copy', type: 'messaging', color: 'hsl(16 84% 62%)', description: 'Send a horizontally scrollable carousel of items' },
    ]
  },
  {
    key: 'inputs',
    title: 'User Inputs',
    items: [
        { key: 'askQuestion', label: 'Ask a Question', icon: 'HelpCircle', type: 'inputs', color: 'hsl(262 83% 58%)', description: 'Ask a question and wait for a user reply' },
        { key: 'waitForInput', label: 'Wait for Input', icon: 'PauseCircle', type: 'inputs', color: 'hsl(262 83% 58%)', description: 'Wait for any user input before proceeding' },
        { key: 'quickReplies', label: 'Quick Replies', icon: 'MessageCircleReply', type: 'inputs', color: 'hsl(262 83% 58%)', description: 'Present buttons for quick user responses' },
        { key: 'listMenu', label: 'List Menu', icon: 'List', type: 'inputs', color: 'hsl(262 83% 58%)', description: 'Show a selectable list of options' },
    ]
  },
  {
    key: 'logic',
    title: 'Logic & Flow',
    items: [
        { key: 'condition', label: 'Condition', icon: 'GitFork', type: 'logic', color: 'hsl(262 83% 58%)', description: 'Branch the flow based on conditions' },
        { key: 'delay', label: 'Delay', icon: 'Timer', type: 'logic', color: 'hsl(262 83% 58%)', description: 'Pause the flow for a specific duration' },
        { key: 'subflow', label: 'Sub-flow', icon: 'GitBranchPlus', type: 'logic', color: 'hsl(262 83% 58%)', description: 'Execute another flow and then return' },
    ]
  },
  {
    key: 'integrations',
    title: 'Integrations',
    items: [
        { key: 'apiCallout', label: 'API Callout', icon: 'CloudUpload', type: 'integrations', color: 'hsl(262 83% 58%)', description: 'Make an HTTP request to an external service' },
        { key: 'handoff', label: 'Handoff to Agent', icon: 'UserCheck', type: 'integrations', color: 'hsl(262 83% 58%)', description: 'Transfer the conversation to a human agent' },
        { key: 'analytics', label: 'Log Event', icon: 'BarChart3', type: 'integrations', color: 'hsl(262 83% 58%)', description: 'Log a custom event to your analytics platform' },
    ]
  }
]
