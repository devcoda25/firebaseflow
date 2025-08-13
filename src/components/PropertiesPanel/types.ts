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
    main_actions: ['general', 'message', 'logic', 'ai'],
    operations: ['general', 'api', 'analytics'],
    triggers: ['general', 'schedule'],
    messaging: ['general', 'message', 'ai'],
    inputs: ['general', 'message', 'logic'],
    logic: ['general', 'logic'],
    timing: ['general', 'schedule'],
    integrations: ['general', 'api'],
    outreach: ['general', 'campaign', 'message'],
    handoff: ['general', 'handoff'],
    analytics: ['general', 'analytics'],
    automation: ['general', 'api', 'logic'],
    updates: ['general', 'api'],
    end: ['general'],
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
