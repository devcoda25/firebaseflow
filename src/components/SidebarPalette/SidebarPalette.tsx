
'use client';

import React, { useMemo } from 'react';
import { SECTION_DATA, SectionDefinition, ItemDefinition, PaletteItemPayload, Channel } from './sections-data';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';


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
    ghost.className = "fixed top-0 left-0 pointer-events-none p-3 rounded-lg shadow-xl flex items-center gap-3 z-[9999]";
    ghost.style.background = item.color || 'hsl(var(--card))';
    ghost.style.color = 'white';
    ghost.style.fontWeight = '600';
    ghost.innerHTML = `<span role="img" aria-hidden="true" class="text-2xl">${item.icon}</span> <div><p class="text-base">${item.label}</p><small class="text-sm opacity-80 font-normal">${item.description || ''}</small></div>`;
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
    <aside className={cn("h-full flex flex-col bg-sidebar text-sidebar-foreground p-4 gap-6 overflow-y-auto", className)} aria-label="Node palette">
        <div className="grid grid-cols-2 gap-3">
            {allItems.map(item => {
                 const Icon = typeof item.icon === 'string' ? (LucideIcons as any)[item.icon] : item.icon;
                 return (
                 <button
                    key={item.key}
                    type="button"
                    className="flex flex-col items-center text-center gap-2 p-4 rounded-lg bg-sidebar-accent text-sidebar-foreground cursor-grab user-select-none transition-all duration-200 ease-in-out border border-sidebar-border hover:bg-primary/10 hover:border-primary hover:text-primary-foreground hover:-translate-y-0.5 active:cursor-grabbing active:scale-[0.98] active:translate-y-0 active:bg-primary/20"
                    style={{'--item-color': item.color} as React.CSSProperties}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onClick={() => handleItemClick(item)}
                    aria-label={`Add ${item.label}`}
                    title={item.label}
                  >
                    {Icon ? <Icon className="text-3xl opacity-90 leading-none" style={{color: 'var(--item-color)'}} /> : <span className="text-3xl opacity-90 leading-none">?</span>}
                    <span className="text-xs font-medium leading-snug">{item.label}</span>
                  </button>
                 )
            })}
        </div>
    </aside>
  );
}
