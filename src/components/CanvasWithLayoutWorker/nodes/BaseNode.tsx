import React, { useState } from 'react'
import { Handle, Position } from 'reactflow'
import styles from '../canvas-layout.module.css'
import NodeAvatars from '@/components/Presence/NodeAvatars';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/button';

export type BaseNodeData = {
  label: string
  icon?: string
  description?: string
  color?: string;
  type?: string;
  content?: string;
}

export default function BaseNode({ id, data, selected }: { id: string; data: BaseNodeData; selected: boolean }) {
  const [message, setMessage] = useState(data.content || 'Got it! I just need some information from you to look up your order.');
  
  const customStyle = {
    '--node-color': data.color || 'hsl(var(--primary))'
  } as React.CSSProperties;

  const Icon = data.icon ? (LucideIcons as any)[data.icon] ?? LucideIcons.HelpCircle : LucideIcons.MessageSquare;
  
  const isMessageNode = data.type === 'messaging';

  return (
    <div className={styles.baseNode} style={customStyle} aria-selected={selected}>
       <NodeAvatars nodeId={id} />
      <div className={styles.nodeHeader}>
        <div className={styles.headerLeft}>
            <span className={styles.nodeIconWrapper}>
                <Icon className={styles.nodeIcon} aria-hidden="true" />
            </span>
            <span className={styles.nodeTitle} title={data.label}>{data.label}</span>
        </div>
        <button className={styles.nodeMore}><MoreHorizontal size={18}/></button>
      </div>
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
              <Button variant="outline" size="sm">Image</Button>
              <Button variant="outline" size="sm">Video</Button>
              <Button variant="outline" size="sm">Audio</Button>
              <Button variant="outline" size="sm">Document</Button>
            </div>
          </div>
        ) : (
          <p>{data.description || 'Node description goes here.'}</p>
        )}
      </div>

      <Handle type="target" position={Position.Left} className={styles.handle} />
      <Handle type="source" position={Position.Right} className={styles.handle} />
    </div>
  )
}
