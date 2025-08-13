import { create } from 'zustand';
import type { Node, Edge, NodeChange, EdgeChange, Connection } from 'reactflow';
import { applyNodeChanges, applyEdgeChanges, addEdge } from 'reactflow';
import { Rocket } from 'lucide-react';

export type Channel =
  | 'whatsapp'
  | 'sms'
  | 'email'
  | 'push'
  | 'voice'
  | 'instagram'
  | 'messenger'
  | 'webchat'
  | 'slack'
  | 'teams'
  | 'telegram';
export type MessageContext = 'template' | 'in-session';

export interface FlowMeta {
  id: string;
  title: string;
  channels: Channel[];
  published: boolean;
  waMessageContext: MessageContext;
}

interface FlowState {
  meta: FlowMeta;
  nodes: Node[];
  edges: Edge[];
  setTitle: (title: string) => void;
  setChannels: (channels: Channel[]) => void;
  setPublished: (published: boolean) => void;
  setWaContext: (ctx: MessageContext) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (node: Node) => void;
}

const initialNodes: Node[] = [
  { id: 'start', type: 'base', position: { x: 120, y: 140 }, data: { label: 'Get Started', icon: 'Rocket' } },
];

export const useFlowStore = create<FlowState>((set, get) => ({
  meta: {
    id: 'draft-1',
    title: 'Untitled Flow',
    channels: ['whatsapp'],
    published: false,
    waMessageContext: 'template',
  },
  nodes: initialNodes,
  edges: [],
  setTitle: (title) => set((s) => ({ meta: { ...s.meta, title: title.trim() || 'Untitled Flow' } })),
  setChannels: (channels) => set((s) => ({ meta: { ...s.meta, channels } })),
  setPublished: (published) => set((s) => ({ meta: { ...s.meta, published } })),
  setWaContext: (waMessageContext) => set((s) => ({ meta: { ...s.meta, waMessageContext } })),
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection) => {
    const { edges } = get();
    // Prevent connecting if a source handle already has an outgoing connection.
    const sourceHandleHasConnection = edges.some(
      (edge) => edge.source === connection.source && edge.sourceHandle === connection.sourceHandle
    );

    if (sourceHandleHasConnection) {
      console.warn(`Connection from source ${connection.source} (handle: ${connection.sourceHandle}) already exists.`);
      return; // Abort connection
    }

    set({
      edges: addEdge({ ...connection, animated: true, type: 'smoothstep' }, edges),
    });
  },
  addNode: (node) => {
    set({
      nodes: get().nodes.concat(node),
    });
  },
}));
