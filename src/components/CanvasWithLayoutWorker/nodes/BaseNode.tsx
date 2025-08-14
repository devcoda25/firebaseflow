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
import MessageContentModal from '@/components/PropertiesPanel/partials/MessageContentModal';
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
  branches?: { id: string; label: string; conditions: any[] }[];
  groups?: { type: 'and' | 'or', conditions: { variable: string, operator: string, value: string }[] }[];
}

export default function BaseNode({ id, data, selected }: { id: string; data: BaseNodeData; selected: boolean }) {
  const { deleteNode, duplicateNode, setStartNode, startNodeId, updateNodeData } = useFlowStore();
  const [modal, setModal] = useState<'message' | 'image' | 'video' | 'document' | 'audio' | null>(null);
  
  const customStyle = {
    '--node-color': data.color || 'hsl(var(--primary))'
  } as React.CSSProperties;

  const Icon = data.icon ? (LucideIcons as any)[data.icon] ?? LucideIcons.HelpCircle : LucideIcons.MessageSquare;
  
  const isMessageNode = data.type === 'messaging';
  const isInputNode = data.type === 'inputs';
  const isConditionNode = data.type === 'logic';
  const isStartNode = startNodeId === id;


  const onSaveMedia = (media: BaseNodeData['media']) => {
    updateNodeData(id, { media });
    setModal(null);
  }

  const onDeleteMedia = () => {
    updateNodeData(id, { media: undefined });
    setModal(null);
  }
  
  const onSaveMessageContent = (content: string) => {
    updateNodeData(id, { content });
    setModal(null);
  };

  const onDeleteMessageContent = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateNodeData(id, { content: undefined });
  }

  const getConditionString = (condition: { variable?: string, operator?: string, value?: string }): string => {
    if (!condition) return '';
    return `${condition.variable || ''} ${condition.operator || ''} ${condition.value || ''}`;
  }

  const hasConditions = data.groups && data.groups.some(g => g.conditions && g.conditions.length > 0);

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
          {isMessageNode || isInputNode ? (
            <div className={styles.messageNodeBody}>
              <div className={styles.messageContent}>
                {data.content && <button className={styles.deleteButton} onClick={onDeleteMessageContent} title="Delete message content"><Trash2 size={14} /></button>}
                <p className="whitespace-pre-wrap break-words text-sm">
                  {data.content || 'Got it! I just need some information from you to look up your order.'}
                </p>
                {data.media && (
                   <div className="mt-2 text-xs text-muted-foreground font-semibold">
                       Attachment: {data.media.type.toUpperCase()}
                   </div>
                )}
              </div>
              <div className={styles.messageButtons}>
                <Button variant="outline" size="sm" onClick={() => setModal('message')}>Message</Button>
                <Button variant="outline" size="sm" onClick={() => setModal('image')}>Image</Button>
                <Button variant="outline" size="sm" onClick={() => setModal('video')}>Video</Button>
                <Button variant="outline" size="sm" onClick={() => setModal('audio')}>Audio</Button>
                <Button variant="outline" size="sm" onClick={() => setModal('document')}>Document</Button>
              </div>
            </div>
          ) : isConditionNode ? (
            <div className={styles.conditionBody}>
              {hasConditions ? (
                data.groups?.map((group, groupIndex) => (
                  <React.Fragment key={groupIndex}>
                    {groupIndex > 0 && <div className={styles.orDivider}>OR</div>}
                    <div className={styles.conditionGroup}>
                      {group.conditions.map((cond, condIndex) => (
                        <div key={condIndex} className={styles.branchRow}>
                          <code className={styles.branchCondition} title={getConditionString(cond)}>
                            {getConditionString(cond)}
                          </code>
                        </div>
                      ))}
                    </div>
                  </React.Fragment>
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

      <MessageContentModal
        isOpen={modal === 'message'}
        onClose={() => setModal(null)}
        onSave={onSaveMessageContent}
        content={data.content}
      />
      <ImageAttachmentModal 
        isOpen={modal === 'image'}
        onClose={() => setModal(null)}
        onSave={onSaveMedia}
        onDelete={onDeleteMedia}
        media={data.media}
      />
      <VideoAttachmentModal 
        isOpen={modal === 'video'}
        onClose={() => setModal(null)}
        onSave={onSaveMedia}
        onDelete={onDeleteMedia}
        media={data.media}
      />
      <AudioAttachmentModal
        isOpen={modal === 'audio'}
        onClose={() => setModal(null)}
        onSave={onSaveMedia}
        onDelete={onDeleteMedia}
        media={data.media}
      />
      <DocumentAttachmentModal
        isOpen={modal === 'document'}
        onClose={() => setModal(null)}
        onSave={onSaveMedia}
        onDelete={onDeleteMedia}
        media={data.media}
      />

      <Handle type="target" position={Position.Left} className={styles.handle} />
      
      {isConditionNode ? (
         <>
          {data.branches && data.branches.length > 0 ? (
            data.branches.map((branch, index) => (
              <React.Fragment key={branch.id}>
                <Handle
                  type="source"
                  position={Position.Right}
                  id={branch.id}
                  className={styles.handle}
                  style={{ top: `${(index + 1) * (100 / (data.branches.length + 1))}%` }}
                />
                <div className={styles.handleLabel} style={{ top: `${(index + 1) * (100 / (data.branches.length + 1))}%` }}>
                  {branch.label}
                </div>
              </React.Fragment>
            ))
          ) : (
            <>
              <Handle type="source" position={Position.Right} id="true" className={styles.handle} style={{ top: '33.3%' }} />
              <div className={styles.handleLabel} style={{ top: '33.3%' }}>True</div>
              <Handle type="source" position={Position.Right} id="false" className={styles.handle} style={{ top: '66.6%' }} />
              <div className={styles.handleLabel} style={{ top: '66.6%' }}>False</div>
            </>
          )}
        </>
      ) : isInputNode ? (
        <>
            <Handle type="source" position={Position.Right} id="reply" className={styles.handle} style={{ top: '50%' }} />
             <div className={styles.handleLabel} style={{ top: '50%' }}>Reply</div>
        </>
      ) : (
        <Handle type="source" position={Position.Right} className={styles.handle} />
      )}
    </div>
  )
}
