import React from 'react'
import { Handle, Position } from 'reactflow'
import styles from '../canvas-layout.module.css'
import NodeAvatars from '@/components/Presence/NodeAvatars';
import { MoreHorizontal } from 'lucide-react';

export type BaseNodeData = {
  label: string
  icon?: string
  description?: string
  color?: string;
}

export default function BaseNode({ id, data, selected }: { id: string; data: BaseNodeData; selected: boolean }) {
  const customStyle = {
    '--node-color': data.color || 'hsl(var(--primary))'
  } as React.CSSProperties;
  
  return (
    <div className={styles.baseNode} style={customStyle} aria-selected={selected}>
       <NodeAvatars nodeId={id} />
      <div className={styles.nodeHeader}>
        <div className={styles.headerLeft}>
            <span className={styles.nodeIconWrapper}>
                <span className={styles.nodeIcon} aria-hidden="true">{data.icon ?? '🧩'}</span>
            </span>
            <span className={styles.nodeTitle} title={data.label}>{data.label}</span>
        </div>
        <button className={styles.nodeMore}><MoreHorizontal size={16}/></button>
      </div>
      <div className={styles.nodeBody}>
        <p>{data.description || 'Node description goes here.'}</p>
      </div>

      <Handle type="target" position={Position.Left} className={styles.handle} />
      <Handle type="source" position={Position.Right} className={styles.handle} />
    </div>
  )
}
