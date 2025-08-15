'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  Background,
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
  setNodes: (nodes: Node[]) => void;
  onNodeDoubleClick?: (node: Node) => void;
  onOpenProperties?: (node: Node | null) => void;
  onOpenAttachmentModal?: (nodeId: string, type: 'image' | 'video' | 'audio' | 'document') => void;
  viewportKey?: string;
};

function InnerCanvas({
  nodes,
  edges,
  setNodes,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeDoubleClick,
  onOpenProperties,
  onOpenAttachmentModal
}: CanvasWithLayoutWorkerProps) {
  const rfRef = useRef<import('reactflow').ReactFlowInstance | null>(null);
  const { project } = useReactFlow();
  const { awareness } = usePresence();
  const { addNode } = useFlowStore();


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
            color: getRandomColor(),
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
      // onOpenProperties?.(selNodes[0] || null); // This line is removed
      if (!awareness) return;
      const st = (awareness.getLocalState() as any) || {};
      const nodeId = selNodes?.[0]?.id;
      awareness.setLocalState({ ...st, selection: { nodeId, ts: Date.now() } });
    },
    [awareness] // onOpenProperties removed from dependencies
  );
  
  const handleNodeDoubleClick = useCallback((_event: React.MouseEvent, node: Node) => {
    onNodeDoubleClick?.(node);
  }, [onNodeDoubleClick]);

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
          nodes={nodesWithProps}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={(inst) => (rfRef.current = inst)}
          onSelectionChange={onSelectionChange}
          onNodeDoubleClick={handleNodeDoubleClick}
          nodeTypes={defaultNodeTypes}
          connectionMode={ConnectionMode.Loose}
          snapToGrid
          snapGrid={[GRID_SIZE, GRID_SIZE]}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Lines} gap={GRID_SIZE} style={{backgroundColor: 'hsl(var(--background))', stroke: 'hsla(var(--border), 0.5)', strokeWidth: 0.5}} />
          <Controls className={styles.controls} />
          <MiniMap pannable zoomable />
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
            <LiveCursors />
          </div>
        </ReactFlow>
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
