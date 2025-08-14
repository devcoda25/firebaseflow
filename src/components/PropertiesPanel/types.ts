import type { Node } from 'reactflow';
import type { Channel } from '@/components/HeaderBar';
import type { NodeCategory } from '../SidebarPalette';

export type TabKey =
  | 'general'
  | 'message'
  | 'api'
  | 'logic'
  | 'schedule'
  | 'campaign'
  | 'ai'
  | 'handoff'
  | 'analytics'
  | 'subflow';

export const TAB_KEYS: TabKey[] = [
  'general','message','api','logic', 'ai', 'schedule','campaign','handoff','analytics','subflow'
];

export const TABS_FOR_NODE_TYPE: Record<NodeCategory, TabKey[]> = {
    main_actions: ['message'],
    operations: ['api'],
    triggers: [],
    messaging: ['message'],
    inputs: ['message'],
    logic: ['logic'],
    timing: ['schedule'],
    integrations: ['api'],
    outreach: ['campaign'],
    handoff: ['handoff'],
    analytics: ['analytics'],
    automation: ['api'],
    updates: ['api'],
    end: [],
};

export type MessageContext = 'template' | 'in-session';

export type PropertiesPanelProps = {
  /** Selected node (null hides panel). */
  node: Node | null;
  /** Called on any form change (debounced). Merge into your node data. */
  onSave: (nodeId: string, values: Record<string, any>) => void;
  onClose: () => void;
  /** WhatsApp message context affects validation; defaults to 'template'. */
  waContext?: MessageContext;
  /** Active channels (for conditional UI in Message tab). */
  channels?: Channel[];
};
