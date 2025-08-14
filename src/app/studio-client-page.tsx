'use client';

import { useState, useCallback, useMemo } from 'react';
import type { Node } from 'reactflow';
import { ReactFlowProvider, useReactFlow } from 'reactflow';
import { nanoid } from 'nanoid';

import HeaderBar from '@/components/HeaderBar';
import SidebarPalette, { PaletteItemPayload } from '@/components/SidebarPalette';
import CanvasWithLayoutWorker from '@/components/CanvasWithLayoutWorker/CanvasWithLayoutWorker';
import PropertiesPanel from '@/components/PropertiesPanel';
import { useFlowStore, useFlowMetaStore, undo, redo } from '@/store/flow';
import TestConsole from '@/components/TestConsole';
import { useUIStore } from '@/store/ui';
import PublishBanner from '@/components/Presence/PublishBanner';
import { FlowEngine } from '@/engine/FlowEngine';
import { useHistoryStore } from '@/store/history';
import { Dialog } from '@/components/ui/dialog';

function StudioPageContent() {
  const { nodes, edges, addNode, setNodes, onNodesChange, onEdgesChange, onConnect } = useFlowStore();
  const { meta, setTitle, setChannels, setPublished, setWaContext } = useFlowMetaStore();

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const { isTestConsoleOpen, toggleTestConsole } = useUIStore();
  const { canUndo, canRedo } = useHistoryStore();

  const engine = useMemo(() => new FlowEngine({ channel: meta.channels[0], clock: 'real' }), [meta.channels]);
  const { project } = useReactFlow();

  engine.setFlow(nodes, edges);

  const handleNodeDoubleClick = useCallback((_event: React.MouseEvent, node: Node) => {
    // Don't open properties for message nodes as they have inline controls
    if (node.data?.type === 'messaging') {
      setSelectedNode(null);
      return;
    }
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
    const { x, y } = project({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const newNode: Node = {
      id: nanoid(),
      type: 'base',
      position: { x: x - 200, y: y - 100 }, // Center it
      data: { 
        label: item.label, 
        icon: item.icon,
        color: item.color,
        description: item.description,
        type: item.type,
      },
    };
    addNode(newNode);
  };

  return (
    <div className="h-screen w-screen grid grid-rows-[56px_1fr] md:grid-cols-[280px_1fr] bg-background text-foreground relative overflow-hidden">
      <PublishBanner />
      <div className="col-span-full row-start-1 z-10">
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
            onSaveClick={() => console.log('Save clicked!', { meta, nodes, edges })}
        />
      </div>
      <aside className="hidden md:block col-start-1 row-start-2 overflow-y-auto border-r border-border z-10 bg-background">
        <div className="p-4 sidebar-scroll">
            <SidebarPalette onDragStart={handleDragStart} onItemClick={handleClickAdd} filterChannels={meta.channels} />
        </div>
      </aside>
      <main className="md:col-start-2 row-start-2 col-start-1 relative overflow-hidden bg-background">
        <CanvasWithLayoutWorker
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          setNodes={setNodes}
          onNodeDoubleClick={handleNodeDoubleClick}
          viewportKey="flow-editor-viewport"
        />
      </main>
      <Dialog open={!!selectedNode} onOpenChange={(isOpen) => !isOpen && setSelectedNode(null)}>
        <PropertiesPanel
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onSave={handleSaveNode}
          waContext={meta.waMessageMessageContext}
          channels={meta.channels}
        />
      </Dialog>
      <TestConsole isOpen={isTestConsoleOpen} onClose={toggleTestConsole} engine={engine} flowId={meta.id} />
    </div>
  );
}


export default function StudioClientPage() {
    return (
        <ReactFlowProvider>
            <StudioPageContent />
        </ReactFlowProvider>
    )
}
