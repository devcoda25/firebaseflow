
'use client';

import React, { useMemo } from 'react';
import styles from './sidebar-palette.module.css';
import { SECTION_DATA, SectionDefinition, ItemDefinition, PaletteItemPayload, Channel } from './sections-data';
import * as LucideIcons from 'lucide-react';

/** Tiny class combiner (no external dep). */
function cn(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export type SidebarPaletteProps = {
  onDragStart: (e: React.DragEvent, item: PaletteItemPayload) => void;
  onItemClick?: (item: PaletteItemPayload) => void;
  filterChannels?: Channel[];
  className?: string;
};

export default function SidebarPalette({
  onDragStart,
  onItemClick,
  filterChannels,
  className,
}: SidebarPaletteProps) {
  
  const allItems = useMemo<ItemDefinition[]>(() => {
    let items: ItemDefinition[] = SECTION_DATA.flatMap(sec => sec.items);
    if (!filterChannels || filterChannels.length === 0) return items;
    
    const allowed = new Set(filterChannels);
    return items.filter((it) => !it.channels || it.channels.some((c) => allowed.has(c)));
  }, [filterChannels]);


  function toPayload(it: ItemDefinition): PaletteItemPayload {
    return { key: it.key, label: it.label, icon: it.icon as string, type: it.type, color: it.color, description: it.description };
  }


  function handleDragStart(e: React.DragEvent, item: ItemDefinition) {
    const payload = toPayload(item);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/x-flow-node', JSON.stringify(payload));
    e.dataTransfer.setData('text/plain', item.label);

    const ghost = document.createElement('div');
    ghost.className = styles.dragGhost;
    ghost.innerHTML = `<span role="img" aria-hidden="true">${item.icon}</span> <div><p>${item.label}</p><small>${item.description || ''}</small></div>`;
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, -10, -10);
    setTimeout(() => document.body.removeChild(ghost), 0);
    
    onDragStart(e, payload);
  }

  function handleItemClick(item: ItemDefinition) {
    const payload = toPayload(item);
    onItemClick?.(payload);
  }
  
  return (
    <aside className={cn(styles.root, className)} aria-label="Node palette">
        <div className={styles.grid}>
            {allItems.map(item => {
                 const Icon = typeof item.icon === 'string' ? (LucideIcons as any)[item.icon] : item.icon;
                 return (
                 <button
                    key={item.key}
                    type="button"
                    className={styles.item}
                    style={{'--item-color': item.color} as React.CSSProperties}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onClick={() => handleItemClick(item)}
                    aria-label={`Add ${item.label}`}
                    title={item.label}
                  >
                    {Icon ? <Icon className={styles.icon} /> : <span className={styles.icon}>?</span>}
                    <span className={styles.label}>{item.label}</span>
                  </button>
                 )
            })}
        </div>
    </aside>
  );
}
