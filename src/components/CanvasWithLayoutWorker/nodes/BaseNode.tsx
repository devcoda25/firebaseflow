import React from 'react'
import { Handle, Position } from 'reactflow'
import styles from '../canvas-layout.module.css'
import NodeAvatars from '@/components/Presence/NodeAvatars';

export type BaseNodeData = {
  label: string
  icon?: string
  description?: string
}

export default function BaseNode({ id, data, selected }: { id: string; data: BaseNodeData; selected: boolean }) {
  return (
    <div className={styles.baseNode} aria-selected={selected}>
       <NodeAvatars nodeId={id} />
      <div className={styles.nodeHeader}>
        <span className={styles.nodeIcon} aria-hidden="true">{data.icon ?? '🧩'}</span>
        <span className={styles.nodeTitle} title={data.label}>{data.label}</span>
      </div>
      {data.description && <div className={styles.nodeBody}>{data.description}</div>}

      <Handle type="target" position={Position.Left} className={styles.handle} />
      <Handle type="source" position={Position.Right} className={styles.handle} />
    </div>
  )
}
