import React, {useCallback, useEffect, useRef} from 'react'
import { Handle, Position, Node, useReactFlow } from 'reactflow'
import styles from '../canvas-layout.module.css'
import NodeAvatars from '@/components/Presence/NodeAvatars';
import { MoreHorizontal, Trash2, Copy, PlayCircle, XCircle, Settings, Image, Video, AudioLines, FileText, MessageSquare as MessageSquareIcon, File as FileIcon, Film, Image as ImageIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/button';

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
import { nanoid } from 'nanoid';
import VariableChipAutocomplete from '@/components/VariableChipAutocomplete/VariableChipAutocomplete';
import { Textarea } from '@/components/ui/textarea';


export type ContentPart = 
  | { id: string; type: 'text'; content: string }
  | { id: string; type: 'image'; url?: string; name?: string }
  | { id: string; type: 'video'; url?: string; name?: string }
  | { id: string; type: 'audio'; url?: string; name?: string }
  | { id: string; type: 'document'; url?: string; name?: string };

export type BaseNodeData = {
  label: string
  icon?: string
  description?: string
  color?: string;
  type?: string;
  
  // Old properties - will be migrated
  content?: string;
  media?: { type: 'image' | 'video' | 'document' | 'audio', url: string, name?: string };
  
  // New property
  parts?: ContentPart[];

  branches?: { id: string; label: string; conditions: any[] }[];
  groups?: { type: 'and' | 'or', conditions: { variable: string, operator: string, value: string }[] }[];
  quickReplies?: { id: string; label: string }[];
  onOpenProperties?: (node: Node) => void;
  onNodeDoubleClick?: (node: Node, options?: { partId?: string; type?: string }) => void;
  onOpenAttachmentModal?: (nodeId: string, partId: string, type: 'image' | 'video' | 'audio' | 'document') => void;
}

// Function to migrate old data structure to the new one
function migrateData(data: BaseNodeData): ContentPart[] {
  if (data.parts) return data.parts;

  const parts: ContentPart[] = [];
  if (data.content) {
    parts.push({ id: nanoid(), type: 'text', content: data.content });
  }
  if (data.media) {
    parts.push({ id: nanoid(), type: data.media.type, url: data.media.url, name: data.media.name });
  }

  // If no content or media, start with an empty array
  if (parts.length === 0) {
    return [];
  }
  return parts;
}

const MEDIA_TYPES: ContentPart['type'][] = ['image', 'video', 'audio', 'document'];


export default function BaseNode({ id, data, selected }: { id: string; data: BaseNodeData; selected: boolean }) {
  const { deleteNode, duplicateNode, setStartNode, startNodeId, updateNodeData, nodes } = useFlowStore();
  const { getNode } = useReactFlow();

  const customStyle = {
    '--node-color': data.color || 'hsl(var(--primary))'
  } as React.CSSProperties;

  const Icon = data.icon ? (LucideIcons as any)[data.icon] ?? LucideIcons.HelpCircle : LucideIcons.MessageSquare;
  
  const isMessageNode = data.type === 'messaging' && data.label === 'Send a Message';
  const isAskQuestionNode = data.label === 'Ask a Question';
  const isConditionNode = data.type === 'logic' && data.label === 'Set a Condition';
  const isButtonsNode = data.label === 'Buttons' || data.label === 'List';
  const isStartNode = startNodeId === id;

  // Migrate old data to new parts structure if necessary
  const parts = isMessageNode ? migrateData(data) : [];

  const getConditionString = (condition: { variable?: string, operator?: string, value?: string }): string => {
    if (!condition) return '';
    return `${condition.variable || ''} ${condition.operator || ''} ${condition.value || ''}`;
  }

  const hasConditions = data.groups && data.groups.some(g => g.conditions && g.conditions.length > 0);

  const thisNode = nodes.find(n => n.id === id);

  const handleDoubleClick = (partId?: string) => {
    if (!thisNode) return;

    if (isMessageNode) {
        const part = parts.find(p => p.id === partId);
        if (part) {
            switch(part.type) {
                case 'text':
                    // Inline editing, no modal needed
                    return;
                case 'image':
                case 'video':
                case 'audio':
                case 'document':
                    data.onOpenAttachmentModal?.(id, partId, part.type);
                    break;
            }
        }
    } else {
        data.onNodeDoubleClick?.(thisNode);
    }
  };

  const addPart = (type: ContentPart['type']) => {
    const newPart: ContentPart = 
        type === 'text' 
        ? { id: nanoid(), type: 'text', content: '' }
        : { id: nanoid(), type, url: undefined, name: undefined};
    const newParts = [...parts, newPart];
    updateNodeData(id, { parts: newParts });

    // If it's a media part, open the modal immediately
    if (type !== 'text') {
      setTimeout(() => data.onOpenAttachmentModal?.(id, newPart.id, newPart.type as any), 50);
    }
  };
  
  const removePart = (partId: string) => {
    const newParts = parts.filter(p => p.id !== partId);
    updateNodeData(id, { parts: newParts });
  };

  const updatePartContent = (partId: string, content: string) => {
    const newParts = parts.map(p => p.id === partId ? { ...p, content } : p);
    updateNodeData(id, { parts: newParts });
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>, partId: string) => {
    updatePartContent(partId, e.target.value);
  }

  const textRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  useEffect(() => {
    // Auto-resize textareas
    Object.values(textRefs.current).forEach(textarea => {
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    });
  }, [parts]);
  
    const renderedParts: React.ReactNode[] = [];
    if (isMessageNode) {
        let i = 0;
        while (i < parts.length) {
            const currentPart = parts[i];

            if (MEDIA_TYPES.includes(currentPart.type)) {
                const mediaGroup: ContentPart[] = [];
                // Collect all consecutive media parts
                while (i < parts.length && MEDIA_TYPES.includes(parts[i].type)) {
                    mediaGroup.push(parts[i]);
                    i++;
                }

                renderedParts.push(
                    <div key={`media-group-${mediaGroup[0].id}`} className={styles.mediaGallery}>
                        {mediaGroup.map(part => (
                            <div key={part.id} className={styles.mediaGalleryItem}>
                                <button className={styles.deletePartButton} onClick={() => removePart(part.id)} title={`Delete ${part.type}`}><Trash2 size={14} /></button>
                                {part.type === 'image' && (
                                    part.url ? <img src={part.url} alt={part.name || 'Image'} onClick={() => handleDoubleClick(part.id)} /> : <button className={styles.attachmentBox} onClick={() => handleDoubleClick(part.id)}><ImageIcon size={24} /><span>Upload image</span></button>
                                )}
                                {part.type === 'video' && (
                                    part.url ? <video src={part.url} controls onClick={() => handleDoubleClick(part.id)} /> : <button className={styles.attachmentBox} onClick={() => handleDoubleClick(part.id)}><Film size={24} /><span>Upload video</span></button>
                                )}
                                {part.type === 'document' && (
                                    part.url ? <div className={styles.documentPreview} onClick={() => handleDoubleClick(part.id)}><FileIcon size={24} /><span className="truncate">{part.name || part.url}</span></div> : <button className={styles.attachmentBox} onClick={() => handleDoubleClick(part.id)}><FileIcon size={24} /><span>Upload document</span></button>
                                )}
                                {part.type === 'audio' && (
                                    part.url ? <audio src={part.url} controls onClick={() => handleDoubleClick(part.id)} /> : <button className={styles.attachmentBox} onClick={() => handleDoubleClick(part.id)}><AudioLines size={24} /><span>Upload audio</span></button>
                                )}
                            </div>
                        ))}
                    </div>
                );
            } else if (currentPart.type === 'text') {
                renderedParts.push(
                    <div key={currentPart.id} className={styles.messagePart}>
                        <button className={styles.deletePartButton} onClick={() => removePart(currentPart.id)} title={`Delete ${currentPart.type}`}><Trash2 size={14} /></button>
                         <div className={styles.messageContent}>
                            <textarea
                                ref={(el) => { if (el) textRefs.current[currentPart.id] = el; }}
                                className={styles.messageTextarea}
                                placeholder="Click to edit message..."
                                value={(currentPart as any).content}
                                onChange={(e) => handleTextChange(e, currentPart.id)}
                                rows={1}
                            />
                            <div className={styles.variableInserter}>
                                <VariableChipAutocomplete
                                    variables={['name', 'email', 'cart_item', 'order_id']}
                                    onInsert={(variable) => {
                                        const currentContent = (currentPart as any).content || '';
                                        updatePartContent(currentPart.id, currentContent + `{{${variable}}}`);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                );
                i++;
            } else {
                i++;
            }
        }
    }


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
                {thisNode && data.onOpenProperties && (
                  <DropdownMenuItem onClick={() => data.onOpenProperties?.(thisNode)}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Properties</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
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
      <div className={styles.nodeBody}>
        {isMessageNode ? (
          <div className={styles.messageNodeBody}>
              {parts.length === 0 && (
                <div className="text-center text-sm text-muted-foreground p-4">
                  Add content using the buttons below.
                </div>
              )}
              {renderedParts}
            <div className={styles.addPartButtons}>
                <Button variant="outline" size="sm" onClick={() => addPart('text')}><MessageSquareIcon size={16}/> Message</Button>
                <Button variant="outline" size="sm" onClick={() => addPart('image')}><Image size={16}/> Image</Button>
                <Button variant="outline" size="sm" onClick={() => addPart('video')}><Video size={16}/> Video</Button>
                <Button variant="outline" size="sm" onClick={() => addPart('audio')}><AudioLines size={16}/> Audio</Button>
                <Button variant="outline" size="sm" onClick={() => addPart('document')}><FileText size={16}/> Document</Button>
            </div>
          </div>
        ) : isAskQuestionNode ? (
          <div className={styles.buttonsNodeBody} onClick={() => handleDoubleClick()}>
            <p className={styles.buttonsQuestion}>{data.content || 'Ask a question here'}</p>
          </div>
        ) : isConditionNode ? (
          <div className={styles.conditionBody} onClick={() => handleDoubleClick()}>
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
               <p>{data.description || 'Double-click to set conditions.'}</p>
            )}
          </div>
        ) : isButtonsNode ? (
          <div className={styles.buttonsNodeBody} onClick={() => handleDoubleClick()}>
            <p className={styles.buttonsQuestion}>{data.content || 'Ask a question here'}</p>
            <ScrollArea className="max-h-48">
              <div className={styles.buttonsList}>
                {(data.quickReplies || []).map((branch: any) => (
                    <div key={branch.id} className={styles.buttonItem}>
                        <span>{branch.label}</span>
                         <Handle
                            type="source"
                            position={Position.Right}
                            id={branch.id}
                            className={styles.buttonHandle}
                         />
                    </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <p onClick={() => handleDoubleClick()}>{data.description || 'Double-click to configure.'}</p>
        )}
      </div>

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
                  style={{ top: `${(index + 1) * (100 / (data.branches!.length + 1))}%` }}
                />
                <div className={styles.handleLabel} style={{ top: `${(index + 1) * (100 / (data.branches!.length + 1))}%` }}>
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
      ) : isAskQuestionNode ? (
        <>
            <Handle type="source" position={Position.Right} id="reply" className={styles.handle} style={{ top: '50%' }} />
             <div className={styles.handleLabel} style={{ top: '50%' }}>Reply</div>
        </>
      ) : isButtonsNode ? (
        // Handles are now inside the button list
        null
      ) : isMessageNode ? (
        // Message node now has a single output
        <Handle type="source" position={Position.Right} className={styles.handle} />
      ) : (
        <Handle type="source" position={Position.Right} className={styles.handle} />
      )}
    </div>
  )
}
