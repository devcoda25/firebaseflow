
import { create } from 'zustand';
import type { Node, Edge, NodeChange, EdgeChange, Connection } from 'reactflow';
import { applyNodeChanges, applyEdgeChanges, addEdge } from 'reactflow';
import { nanoid } from 'nanoid';
import { temporal } from 'zundo';
import { useHistoryStore } from './history';

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

// Separate the state structure that needs to be tracked by history
const flowSlice = (set: any, get: any) => ({
  nodes: [
    { id: 'start', type: 'base', position: { x: 120, y: 140 }, data: { label: 'Get Started', icon: 'Rocket' } },
  ] as Node[],
  edges: [] as Edge[],
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection: Connection) => {
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
  addNode: (node: Node) => {
    set({
      nodes: get().nodes.concat(node),
    });
  },
  deleteNode: (nodeId: string) => {
    set((state: any) => ({
      nodes: state.nodes.filter((n: any) => n.id !== nodeId),
      edges: state.edges.filter((e: any) => e.source !== nodeId && e.target !== nodeId),
    }));
  },
  duplicateNode: (nodeId: string) => {
    const { nodes } = get();
    const nodeToDuplicate = nodes.find((n: any) => n.id === nodeId);
    if (!nodeToDuplicate) return;

    const newNode = {
      ...nodeToDuplicate,
      id: nanoid(),
      position: {
        x: nodeToDuplicate.position.x + 30,
        y: nodeToDuplicate.position.y + 30,
      },
      selected: false,
    };

    set({ nodes: [...nodes, newNode] });
  },
  setNodes: (nodes: Node[]) => set({ nodes }),
  setEdges: (edges: Edge[]) => set({ edges }),
});


// Create the main store, with a temporal middleware for history
export const useFlowStore = create(
  temporal(flowSlice, {
    onSave: (pastStates, futureStates) => {
        useHistoryStore.getState().setCanUndo(pastStates.length > 0);
        useHistoryStore.getState().setCanRedo(futureStates.length > 0);
    }
  })
);

// --- Non-history state and actions ---
// These are kept in a separate store to avoid polluting the history.

interface FlowMetaState {
    meta: FlowMeta;
    setTitle: (title: string) => void;
    setChannels: (channels: Channel[]) => void;
    setPublished: (published: boolean) => void;
    setWaContext: (ctx: MessageContext) => void;
}

export const useFlowMetaStore = create<FlowMetaState>((set) => ({
    meta: {
        id: 'draft-1',
        title: 'Untitled Flow',
        channels: ['whatsapp'],
        published: false,
        waMessageContext: 'template',
    },
    setTitle: (title) => set((s) => ({ meta: { ...s.meta, title: title.trim() || 'Untitled Flow' } })),
    setChannels: (channels) => set((s) => ({ meta: { ...s.meta, channels } })),
    setPublished: (published) => set((s) => ({ meta: { ...s.meta, published } })),
    setWaContext: (waMessageContext) => set((s) => ({ meta: { ...s.meta, waMessageContext } })),
}));

// Expose undo/redo actions
export const undo = () => useFlowStore.temporal.undo();
export const redo = () => useFlowStore.temporal.redo();
