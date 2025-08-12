'use client';

import { useState, useCallback, useMemo } from 'react';
import type { Node } from 'reactflow';
import { ReactFlowProvider } from 'reactflow';

import HeaderBar from '@/components/HeaderBar';
import SidebarPalette, { PaletteItemPayload } from '@/components/SidebarPalette';
import CanvasWithLayoutWorker from '@/components/CanvasWithLayoutWorker';
import styles from './studio.module.css';
import PropertiesPanel from '@/components/PropertiesPanel';
import { useFlowStore } from '@/store/flow';
import TestConsole from '@/components/TestConsole';
import { useUIStore } from '@/store/ui';
import PublishBanner from '@/components/Presence/PublishBanner';
import { FlowEngine } from '@/engine/FlowEngine';
import { useUndoRedo } from '@/hooks/useUndoRedo';

export default function StudioClientPage() {
  const {
    nodes,
    edges,
    meta,
    setNodes,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setTitle,
    setChannels,
    setPublished,
    setWaContext,
  } = useFlowStore();

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const { isTestConsoleOpen, toggleTestConsole } = useUIStore();
  const { canUndo, canRedo, undo, redo } = useUndoRedo();

  const engine = useMemo(() => new FlowEngine({ channel: meta.channels[0], clock: 'real' }), [meta.channels]);

  engine.setFlow(nodes, edges);

  const handleNodeSelect = useCallback((node: Node | null) => {
    setSelectedNode(node);
  }, []);

  const handleSaveNode = (nodeId: string, data: Record<string, any>) => {
    setNodes(
      nodes.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n))
    );
  };

  const handleDragStart = (_e: React.DragEvent, item: PaletteItemPayload) => {
    // This is handled by ReactFlow's onDrop, but you could add logic here
  };

  const handleClickAdd = (item: PaletteItemPayload) => {
    // This is an optional feature to add a node to the center of the canvas
    console.info('add by click:', item);
  };

  return (
    <ReactFlowProvider>
      <div className={styles.shell}>
        <PublishBanner />
        <HeaderBar
          title={meta.title}
          onSave={setTitle}
          channels={meta.channels}
          onChannelsChange={setChannels}
          waContext={meta.waMessageContext}
          onWaContextChange={setWaContext}
          isPublished={meta.published}
          onPublishToggle={setPublished}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          onTest={toggleTestConsole}
        />
        <aside className={styles.sidebar}>
          <SidebarPalette onDragStart={handleDragStart} onItemClick={handleClickAdd} filterChannels={meta.channels} />
        </aside>
        <main className={styles.main}>
          <CanvasWithLayoutWorker
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            setNodes={setNodes}
            onNodeSelect={handleNodeSelect}
            viewportKey="flow-editor-viewport"
          />
        </main>
        <PropertiesPanel
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onSave={handleSaveNode}
          waContext={meta.waMessageContext}
          channels={meta.channels}
        />
        <TestConsole isOpen={isTestConsoleOpen} onClose={toggleTestConsole} engine={engine} flowId={meta.id} />
      </div>
    </ReactFlowProvider>
  );
}
