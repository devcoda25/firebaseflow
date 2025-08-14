import React, { useState } from 'react'
import { Handle, Position } from 'reactflow'
import styles from '../canvas-layout.module.css'
import NodeAvatars from '@/components/Presence/NodeAvatars';
import { MoreHorizontal, Trash2, Copy, PlayCircle, XCircle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImageAttachmentModal from '@/components/PropertiesPanel/partials/ImageAttachmentModal';
import VideoAttachmentModal from '@/components/PropertiesPanel/partials/VideoAttachmentModal';
import DocumentAttachmentModal from '@/components/PropertiesPanel/partials/DocumentAttachmentModal';
import AudioAttachmentModal from '@/components/PropertiesPanel/partials/AudioAttachmentModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useFlowStore } from '@/store/flow';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';


export type BaseNodeData = {
  label: string
  icon?: string
  description?: string
  color?: string;
  type?: string;
  content?: string;
  media?: { type: 'image' | 'video' | 'document' | 'audio', url: string, name?: string };
  branches?: { id: string; label: string; condition: string }[];
}

export default function BaseNode({ id, data, selected }: { id: string; data: BaseNodeData; selected: boolean }) {
  const [message, setMessage] = useState(data.content || 'Got it! I just need some information from you to look up your order.');
  const [modal, setModal] = useState<'image' | 'video' | 'document' | 'audio' | null>(null);
  const { deleteNode, duplicateNode, setStartNode, startNodeId } = useFlowStore();
  
  const customStyle = {
    '--node-color': data.color || 'hsl(var(--primary))'
  } as React.CSSProperties;

  const Icon = data.icon ? (LucideIcons as any)[data.icon] ?? LucideIcons.HelpCircle : LucideIcons.MessageSquare;
  
  const isMessageNode = data.type === 'messaging';
  const isConditionNode = data.type === 'logic';
  const isStartNode = startNodeId === id;


  const onSaveMedia = (media: BaseNodeData['media']) => {
    // In a real app you'd call a store action here
    console.log('Saving media for node', id, media);
    data.media = media;
    setModal(null);
  }

  const onDeleteMedia = () => {
    console.log('Deleting media for node', id);
    data.media = undefined;
    setModal(null);
  }

  const branchCount = data.branches?.length || 0;

  return (
    <div className={styles.baseNode} style={customStyle} aria-selected={selected}>
       <NodeAvatars nodeId={id} />
      <div className={styles.nodeHeader}>
        <div className={styles.headerLeft}>
            <span className={styles.nodeIconWrapper}>
                <Icon className={styles.nodeIcon} aria-hidden="true" />
            </span>
            <span className={styles.nodeTitle} title={data.label}>{data.label}</span>
            {isStartNode && <Badge variant="secondary" className="ml-2">Start</Badge>}
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className={styles.nodeMore}><MoreHorizontal size={18}/></button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {isStartNode ? (
                    <DropdownMenuItem onClick={() => setStartNode(null)}>
                        <XCircle className="mr-2 h-4 w-4" />
                        <span>Reset start node</span>
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem onClick={() => setStartNode(id)}>
                        <PlayCircle className="mr-2 h-4 w-4" />
                        <span>Set as start node</span>
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => duplicateNode(id)}>
                    <Copy className="mr-2 h-4 w-4" />
                    <span>Copy</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => deleteNode(id)} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ScrollArea className="max-h-60">
        <div className={styles.nodeBody}>
          {isMessageNode ? (
            <div className={styles.messageNodeBody}>
              <div className={styles.messageContent}>
                <textarea 
                  className={styles.messageTextarea} 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
                <button className={styles.deleteButton}><Trash2 size={16} /></button>
              </div>
              <div className={styles.messageButtons}>
                <Button variant="outline" size="sm">Message</Button>
                <Button variant="outline" size="sm" onClick={() => setModal('image')}>Image</Button>
                <Button variant="outline" size="sm" onClick={() => setModal('video')}>Video</Button>
                <Button variant="outline" size="sm" onClick={() => setModal('audio')}>Audio</Button>
                <Button variant="outline" size="sm" onClick={() => setModal('document')}>Document</Button>
              </div>
            </div>
          ) : isConditionNode ? (
            <div className={styles.conditionBody}>
              {branchCount > 0 ? (
                data.branches?.map(branch => (
                  <div key={branch.id} className={styles.branchRow}>
                    <Badge variant="secondary" className="truncate" title={branch.label}>{branch.label}</Badge>
                    <code className={styles.branchCondition} title={branch.condition}>{branch.condition}</code>
                  </div>
                ))
              ) : (
                 <p>{data.description || 'Define branches in the properties panel.'}</p>
              )}
            </div>
          ) : (
            <p>{data.description || 'Node description goes here.'}</p>
          )}
        </div>
      </ScrollArea>

      <ImageAttachmentModal 
        isOpen={modal === 'image'}
        onClose={() => setModal(null)}
        onSave={onSaveMedia}
        onDelete={onDeleteMedia}
        media={data.media?.type === 'image' ? data.media : undefined}
      />
      <VideoAttachmentModal 
        isOpen={modal === 'video'}
        onClose={() => setModal(null)}
        onSave={onSaveMedia}
        onDelete={onDeleteMedia}
        media={data.media?.type === 'video' ? data.media : undefined}
      />
      <AudioAttachmentModal
        isOpen={modal === 'audio'}
        onClose={() => setModal(null)}
        onSave={onSaveMedia}
        onDelete={onDeleteMedia}
        media={data.media?.type === 'audio' ? data.media : undefined}
      />
      <DocumentAttachmentModal
        isOpen={modal === 'document'}
        onClose={() => setModal(null)}
        onSave={onSaveMedia}
        onDelete={onDeleteMedia}
        media={data.media?.type === 'document' ? data.media : undefined}
      />

      <Handle type="target" position={Position.Left} className={styles.handle} />
      
      {isConditionNode ? (
        <>
            {branchCount > 0 ? (
                data.branches?.map((branch, i) => {
                    const pos = (i + 1) / (branchCount + 1);
                    return (
                        <React.Fragment key={branch.id}>
                            <Handle 
                                type="source" 
                                position={Position.Right} 
                                id={branch.id}
                                className={styles.handle} 
                                style={{ top: `${pos * 100}%` }}
                            />
                            <div className={styles.handleLabel} style={{ top: `${pos * 100}%` }}>
                                {branch.label}
                            </div>
                        </React.Fragment>
                    )
                })
            ) : (
                <>
                    <Handle type="source" position={Position.Right} id="true" className={styles.handle} style={{ top: '33.3%' }} />
                    <div className={styles.handleLabel} style={{ top: '33.3%' }}>True</div>
                    <Handle type="source" position={Position.Right} id="false" className={styles.handle} style={{ top: '66.6%' }} />
                    <div className={styles.handleLabel} style={{ top: '66.6%' }}>False</div>
                </>
            )}
        </>
      ) : (
        <Handle type="source" position={Position.Right} className={styles.handle} />
      )}
    </div>
  )
}
