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
import { getRandomColor } from '@/lib/color-utils';

import MessageContentModal from '@/components/PropertiesPanel/partials/MessageContentModal';
import ImageAttachmentModal from '@/components/PropertiesPanel/partials/ImageAttachmentModal';
import VideoAttachmentModal from '@/components/PropertiesPanel/partials/VideoAttachmentModal';
import DocumentAttachmentModal from '@/components/PropertiesPanel/partials/DocumentAttachmentModal';
import AudioAttachmentModal from '@/components/PropertiesPanel/partials/AudioAttachmentModal';
import WebhookModal from '@/components/PropertiesPanel/partials/WebhookModal';
import ConditionModal from '@/components/PropertiesPanel/partials/ConditionModal';
import GoogleSheetsModal from '@/components/PropertiesPanel/partials/GoogleSheetsModal';

type ModalState = {
  type: 'message' | 'image' | 'video' | 'document' | 'audio' | 'webhook' | 'condition' | 'googleSheets';
  nodeId: string;
  data?: any;
} | null;


function StudioPageContent() {
  const { nodes, edges, addNode, setNodes, onNodesChange, onEdgesChange, onConnect, updateNodeData } = useFlowStore();
  const { meta, setTitle, setChannels, setPublished, setWaContext } = useFlowMetaStore();

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [modalState, setModalState] = useState<ModalState>(null);

  const { isTestConsoleOpen, toggleTestConsole } = useUIStore();
  const { canUndo, canRedo } = useHistoryStore();

  const engine = useMemo(() => new FlowEngine({ channel: meta.channels[0], clock: 'real' }), [meta.channels]);
  const { project } = useReactFlow();
  
  const selectedNode = useMemo(() => nodes.find(n => n.id === selectedNodeId) || null, [nodes, selectedNodeId]);


  engine.setFlow(nodes, edges);

  const handleNodeDoubleClick = useCallback((node: Node) => {
    const type = node.data?.type;
    const label = node.data?.label;

    if (type === 'messaging' || label === 'Ask a Question' || label === 'Buttons' || label === 'List') {
        setModalState({ type: 'message', nodeId: node.id, data: { content: node.data.content, media: node.data.media } });
    } else if (label === 'Webhook') {
        setModalState({ type: 'webhook', nodeId: node.id, data: node.data });
    } else if (label === 'Set a Condition') {
        setModalState({ type: 'condition', nodeId: node.id, data: { groups: node.data.groups } });
    } else if (label === 'Google Sheets') {
        setModalState({ type: 'googleSheets', nodeId: node.id, data: node.data });
    }
  }, []);

  const openAttachmentModal = useCallback((nodeId: string, type: 'image' | 'video' | 'audio' | 'document') => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    setModalState({ type, nodeId, data: { media: node.data.media } });
  }, [nodes]);
  
  const openPropertiesForNode = useCallback((node: Node | null) => {
    setSelectedNodeId(node?.id || null);
  }, []);

  const handleSaveNode = (nodeId: string, data: Record<string, any>) => {
    updateNodeData(nodeId, data);
  };
  
  const onSaveModal = (data: any) => {
    if (!modalState) return;
    updateNodeData(modalState.nodeId, data);
    setModalState(null);
  };
  
  const onSaveMedia = (media: any) => {
    if (!modalState) return;
    updateNodeData(modalState.nodeId, { media });
    setModalState(null);
  }
  
  const onDeleteMedia = () => {
    if (!modalState) return;
    updateNodeData(modalState.nodeId, { media: undefined });
    setModalState(null);
  }

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
        color: getRandomColor(),
        description: item.description,
        type: item.type,
      },
    };
    addNode(newNode);
  };

  return (
    <div className="h-screen w-screen grid grid-rows-[56px_1fr] md:grid-cols-[280px_1fr] bg-background text-foreground relative overflow-hidden">
      <PublishBanner />
      <div className="col-span-full row-start-1 z-20">
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
          onOpenProperties={openPropertiesForNode}
          onOpenAttachmentModal={openAttachmentModal}
          viewportKey="flow-editor-viewport"
        />
      </main>
      
      {selectedNodeId && (
        <PropertiesPanel
            node={selectedNode}
            onClose={() => setSelectedNodeId(null)}
            onSave={handleSaveNode}
            waContext={meta.waMessageContext}
            channels={meta.channels}
        />
      )}
      
      {/* Modals for node functions */}
      <MessageContentModal
        isOpen={modalState?.type === 'message'}
        onClose={() => setModalState(null)}
        onSave={(content) => onSaveModal({ content })}
        content={modalState?.data?.content}
      />
      <ImageAttachmentModal
        isOpen={modalState?.type === 'image'}
        onClose={() => setModalState(null)}
        onSave={onSaveMedia}
        onDelete={onDeleteMedia}
        media={modalState?.data?.media}
      />
      <VideoAttachmentModal
        isOpen={modalState?.type === 'video'}
        onClose={() => setModalState(null)}
        onSave={onSaveMedia}
        onDelete={onDeleteMedia}
        media={modalState?.data?.media}
      />
      <AudioAttachmentModal
        isOpen={modalState?.type === 'audio'}
        onClose={() => setModalState(null)}
        onSave={onSaveMedia}
        onDelete={onDeleteMedia}
        media={modalState?.data?.media}
      />
      <DocumentAttachmentModal
        isOpen={modalState?.type === 'document'}
        onClose={() => setModalState(null)}
        onSave={onSaveMedia}
        onDelete={onDeleteMedia}
        media={modalState?.data?.media}
      />
      <WebhookModal
          isOpen={modalState?.type === 'webhook'}
          onClose={() => setModalState(null)}
          onSave={onSaveModal}
          initialData={modalState?.data}
      />
      <ConditionModal
        isOpen={modalState?.type === 'condition'}
        onClose={() => setModalState(null)}
        onSave={onSaveModal}
        initialData={modalState?.data}
      />
      <GoogleSheetsModal
          isOpen={modalState?.type === 'googleSheets'}
          onClose={() => setModalState(null)}
          onSave={onSaveModal}
          initialData={modalState?.data}
      />


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
