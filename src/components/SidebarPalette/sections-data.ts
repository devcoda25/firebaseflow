// Canonical list of sections & items.
// - Icons are emoji for simplicity (swap for SVGs anytime).
// - `type` equals section key for easy analytics.
// - Optional `channels` can restrict visibility by channel (if you pass filterChannels).

export type NodeCategory =
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
      { key: 'getStarted',  label: 'Get Started',   icon: '🚀', type: 'triggers',   keywords: ['start', 'hello', 'welcome'] },
      { key: 'inboundCall', label: 'Inbound Call',  icon: '📞', type: 'triggers',   channels: ['voice'] },
      { key: 'incomingSMS', label: 'Incoming SMS',  icon: '📩', type: 'triggers',   channels: ['sms'] },
      { key: 'newEmail',    label: 'Incoming Email',icon: '📧', type: 'triggers',   channels: ['email'] },
      { key: 'pushOpen',    label: 'Push Open',     icon: '🔔', type: 'triggers',   channels: ['push'] }
    ]
  },
  {
    key: 'messaging',
    title: 'Messaging',
    items: [
      { key: 'voiceMessage',  label: 'Voice Message', icon: '🎤', type: 'messaging', channels: ['voice'] },
      { key: 'sms',           label: 'SMS',           icon: '💬', type: 'messaging', channels: ['sms'] },
      { key: 'email',         label: 'Email',         icon: '✉️', type: 'messaging', channels: ['email'] },
      { key: 'push',          label: 'Push',          icon: '📲', type: 'messaging', channels: ['push'] },
      { key: 'chatTemplate',  label: 'Chat Template', icon: '💭', type: 'messaging' },
      { key: 'carousel',      label: 'Carousel',      icon: '🖼️', type: 'messaging', keywords: ['gallery', 'cards'] }
    ]
  },
  {
    key: 'inputs',
    title: 'Inputs',
    items: [
      { key: 'askQuestion', label: 'Ask Question', icon: '❓', type: 'inputs', keywords: ['form', 'collect', 'capture'] }
    ]
  },
  {
    key: 'logic',
    title: 'Logic',
    items: [
      { key: 'condition', label: 'Condition', icon: '🔀', type: 'logic', keywords: ['if', 'branch'] },
      { key: 'loop',      label: 'Loop',      icon: '🔁', type: 'logic', keywords: ['repeat', 'iterate'] }
    ]
  },
  {
    key: 'timing',
    title: 'Timing',
    items: [
      { key: 'delay', label: 'Delay', icon: '⏳', type: 'timing', keywords: ['wait', 'schedule'] }
    ]
  },
  {
    key: 'integrations',
    title: 'Integrations',
    items: [
      { key: 'webhook',      label: 'Webhook / API Call', icon: '🌐', type: 'integrations', keywords: ['http', 'rest'] },
      { key: 'callSubflow',  label: 'Call Subflow',       icon: '🔗', type: 'integrations' },
      { key: 'crmConnector', label: 'CRM Connector',      icon: '📇', type: 'integrations', keywords: ['sales', 'leads'] },
      { key: 'dbConnector',  label: 'DB Connector',       icon: '🗄️', type: 'integrations', keywords: ['database', 'sql'] },
      { key: 'slackAction',  label: 'Slack Action',       icon: '💬', type: 'integrations', channels: ['slack'] },
      { key: 'teamsAction',  label: 'Teams Action',       icon: '📲', type: 'integrations', channels: ['teams'] },
      { key: 'telegramAction', label: 'Telegram Action',  icon: '📨', type: 'integrations', channels: ['telegram'] }
    ]
  },
  {
    key: 'outreach',
    title: 'Outreach',
    items: [
      { key: 'broadcast', label: 'Broadcast / Campaign', icon: '📣', type: 'outreach', keywords: ['sequence', 'blast'] }
    ]
  },
  {
    key: 'handoff',
    title: 'Handoff',
    items: [
      { key: 'teamInbox',   label: 'Team Inbox',   icon: '📥', type: 'handoff' },
      { key: 'assignAgent', label: 'Assign Agent', icon: '👤', type: 'handoff' },
      { key: 'slaRoute',    label: 'SLA Routing',  icon: '⏱️', type: 'handoff', keywords: ['priority', 'queue'] }
    ]
  },
  {
    key: 'analytics',
    title: 'Analytics',
    items: [
      { key: 'analyticsHook', label: 'Analytics Hook', icon: '📊', type: 'analytics', keywords: ['event', 'track'] },
      { key: 'abTest',        label: 'A/B Testing',    icon: '🧪', type: 'analytics', keywords: ['experiment'] }
    ]
  },
  {
    key: 'automation',
    title: 'AI & Automation',
    items: [
      { key: 'aiAssist',   label: 'AI Assist',   icon: '🤖', type: 'automation', keywords: ['llm', 'copilot'] },
      { key: 'triggerFlow',label: 'Trigger Flow',icon: '⚡',  type: 'automation' }
    ]
  },
  {
    key: 'updates',
    title: 'Updates',
    items: [
      { key: 'updateStatus', label: 'Update Status', icon: '🔄', type: 'updates' }
    ]
  },
  {
    key: 'end',
    title: 'End Session',
    items: [
      { key: 'endSession', label: 'End Session', icon: '🔚', type: 'end' }
    ]
  }
]
