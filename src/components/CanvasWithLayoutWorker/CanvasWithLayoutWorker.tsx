
'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  Connection,
  Controls,
  MiniMap,
  useReactFlow,
  Node,
  Edge,
  ConnectionMode,
  NodeChange,
  EdgeChange,
  Panel,
  BackgroundVariant,
  Background,
  ConnectionLineType,
  MarkerType,
  OnConnectStartParams,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { nanoid } from 'nanoid';
import styles from './canvas-layout.module.css';
import BaseNode from './nodes/BaseNode';
import GroupBoxNode from './nodes/GroupBoxNode';
import SubflowNode from './nodes/SubflowNode';
import LiveCursors from '@/components/Presence/LiveCursors';
import { usePresence } from '@/presence/PresenceProvider';
import { useFlowStore } from '@/store/flow';
import type { PaletteItemPayload } from '../SidebarPalette';
import { getRandomColor } from '@/lib/color-utils';
import NodeSelector from './NodeSelector';
import { useClickAway } from 'react-use';

const GRID_SIZE = 20;

const defaultNodeTypes = {
  base: BaseNode,
  group: GroupBoxNode,
  subflow: SubflowNode,
};

export type CanvasWithLayoutWorkerProps = {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  onConnectStart: (_: React.MouseEvent, params: OnConnectStartParams) => void;
  onConnectEnd: (event: MouseEvent) => void;
  setNodes: (nodes: Node[]) => void;
  onNodeDoubleClick?: (node: Node) => void;
  onOpenProperties?: (node: Node | null) => void;
  onOpenAttachmentModal?: (nodeId: string, type: 'image' | 'video' | 'audio' | 'document') => void;
  viewportKey?: string;
};

type NodeSelectorState = {
    x: number;
    y: number;
    sourceNode: string;
    sourceHandle: string | null;
} | null;


function InnerCanvas({
  nodes,
  edges,
  setNodes,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onConnectStart,
  onConnectEnd,
  onNodeDoubleClick,
  onOpenProperties,
  onOpenAttachmentModal
}: CanvasWithLayoutWorkerProps) {
  const rfRef = useRef<import('reactflow').ReactFlowInstance | null>(null);
  const { project } = useReactFlow();
  const { awareness } = usePresence();
  const { addNode } = useFlowStore();

  const [nodeSelector, setNodeSelector] = useState<NodeSelectorState>(null);
  const selectorRef = useRef<HTMLDivElement>(null);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const reactFlowBounds = rfRef.current?.screenToFlowPosition({ x: event.clientX, y: event.clientY });
      if (!reactFlowBounds) return;

      const data = event.dataTransfer.getData('application/x-flow-node');

      if (typeof data === 'undefined' || !data) {
        return;
      }

      const item: PaletteItemPayload = JSON.parse(data);

      const newNode: Node = {
        id: nanoid(),
        type: 'base',
        position: {
          x: Math.round(reactFlowBounds.x / GRID_SIZE) * GRID_SIZE,
          y: Math.round(reactFlowBounds.y / GRID_SIZE) * GRID_SIZE,
        },
        data: { 
            label: item.label, 
            icon: item.icon,
            color: item.color || getRandomColor(),
            description: item.description,
            type: item.type,
            onOpenProperties: onOpenProperties,
        },
      };

      addNode(newNode);
    },
    [project, addNode, onOpenProperties]
  );

  const onSelectionChange = useCallback(
    ({ nodes: selNodes }: { nodes: Node[]; edges: Edge[] }) => {
      onOpenProperties?.(selNodes[0] || null);
      if (!awareness) return;
      const st = (awareness.getLocalState() as any) || {};
      const nodeId = selNodes?.[0]?.id;
      awareness.setLocalState({ ...st, selection: { nodeId, ts: Date.now() } });
    },
    [awareness, onOpenProperties]
  );
  
  const handleNodeDoubleClick = useCallback((_event: React.MouseEvent, node: Node) => {
    onNodeDoubleClick?.(node);
  }, [onNodeDoubleClick]);

  const handleConnectEnd = useCallback((event: MouseEvent) => {
    onConnectEnd(event); // Propagate to store
    
    if (!rfRef.current) return;
    const { connection } = useFlowStore.getState();
    const sourceNode = connection.connectingNodeId;

    if (!sourceNode || event.target?.closest('.react-flow__handle')) {
        return;
    }
    
    const { top, left } = rfRef.current.container.getBoundingClientRect();
    setNodeSelector({
        x: event.clientX - left,
        y: event.clientY - top,
        sourceNode: sourceNode,
        sourceHandle: connection.connectingHandleId
    })

  }, [rfRef, onConnectEnd]);

  useClickAway(selectorRef, () => {
    setNodeSelector(null);
  });

  const handleSelectNode = (item: PaletteItemPayload) => {
    if (!nodeSelector) return;
    const { x: paneX, y: paneY, sourceNode, sourceHandle } = nodeSelector;
    const { x, y } = project({ x: paneX, y: paneY });
    
    const newNodeId = nanoid();
    const newNode: Node = {
        id: newNodeId,
        type: 'base',
        position: { x, y },
        data: {
            label: item.label,
            icon: item.icon,
            color: item.color || getRandomColor(),
            description: item.description,
            type: item.type,
        },
    };
    addNode(newNode);

    onConnect({
        source: sourceNode,
        sourceHandle: sourceHandle,
        target: newNodeId,
        targetHandle: null,
    });
    setNodeSelector(null);
  };


  const nodesWithProps = useMemo(() => nodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      onOpenProperties: onOpenProperties,
      onNodeDoubleClick: onNodeDoubleClick,
      onOpenAttachmentModal: onOpenAttachmentModal,
    }
  })), [nodes, onOpenProperties, onNodeDoubleClick, onOpenAttachmentModal]);

  return (
    <div className={styles.root}>
      <div className={styles.canvas} onDrop={onDrop} onDragOver={onDragOver}>
        <ReactFlow
          ref={(instance) => (rfRef.current = instance)}
          nodes={nodesWithProps}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onConnectEnd={handleConnectEnd}
          onInit={(inst) => (rfRef.current = inst)}
          onSelectionChange={onSelectionChange}
          onNodeDoubleClick={handleNodeDoubleClick}
          nodeTypes={defaultNodeTypes}
          connectionLineType={ConnectionLineType.Bezier}
          connectionMode={ConnectionMode.Loose}
          snapToGrid
          snapGrid={[GRID_SIZE, GRID_SIZE]}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Controls className={styles.controls} />
          <MiniMap pannable zoomable />
          <Background style={{'--bg-color': 'hsl(215 30% 98%)', '--line-color': 'hsla(215 20% 88%, 0.5)'} as React.CSSProperties}/>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
            <LiveCursors />
          </div>
        </ReactFlow>
        {nodeSelector && (
            <div
                ref={selectorRef}
                style={{ position: 'absolute', left: nodeSelector.x + 10, top: nodeSelector.y, zIndex: 1000 }}
            >
                <NodeSelector onSelect={handleSelectNode} />
            </div>
        )}
      </div>
    </div>
  );
}

export default function CanvasWithLayoutWorker(props: CanvasWithLayoutWorkerProps) {
  return (
    <ReactFlowProvider>
      <InnerCanvas {...props} />
    </ReactFlowProvider>
  );
}
