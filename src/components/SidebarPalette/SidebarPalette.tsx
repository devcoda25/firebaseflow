
'use client';

import React, { useMemo } from 'react';
import { SECTION_DATA, ItemDefinition, PaletteItemPayload, Channel } from './sections-data';
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

    const Icon = typeof item.icon === 'string' ? (LucideIcons as any)[item.icon] ?? LucideIcons.HelpCircle : item.icon;
    const ghost = document.createElement('div');
    ghost.className = "fixed top-0 left-0 pointer-events-none p-3 rounded-lg shadow-xl flex items-center gap-3 z-[9999] bg-card text-card-foreground border border-border";
    ghost.style.minWidth = '220px';
    
    // Create and append icon container
    const iconContainer = document.createElement('div');
    iconContainer.className = 'w-10 h-10 rounded-full grid place-items-center flex-shrink-0';
    iconContainer.style.backgroundColor = 'hsl(262 83% 58% / 0.1)'; // purple-100
    
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(262 83% 58%)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-purple-600">${(Icon as any).displayName === 'HelpCircle' ? '<circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><path d="M12 17h.01"></path>' : item.icon}</svg>`;
    iconContainer.innerHTML = svgString;
    ghost.appendChild(iconContainer);

    // Create and append text container
    const textContainer = document.createElement('div');
    const label = document.createElement('p');
    label.className = "text-base font-medium";
    label.textContent = item.label;
    textContainer.appendChild(label);

    if (item.description) {
      const description = document.createElement('small');
      description.className = "text-sm opacity-80 font-normal";
      description.textContent = item.description;
      textContainer.appendChild(description);
    }
    ghost.appendChild(textContainer);


    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, -20, 20); // offset slightly
    setTimeout(() => document.body.removeChild(ghost), 0);
    
    onDragStart(e, payload);
  }

  function handleItemClick(item: ItemDefinition) {
    const payload = toPayload(item);
    onItemClick?.(payload);
  }
  
  return (
    <nav className={cn("h-full flex flex-col gap-6 overflow-y-auto", className)} aria-label="Node palette">
        {SECTION_DATA.map(section => (
            <div key={section.key}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-2">{section.title}</h3>
                <div className="grid grid-cols-2 gap-3">
                    {section.items.map(item => {
                        const Icon = typeof item.icon === 'string' ? (LucideIcons as any)[item.icon] ?? LucideIcons.HelpCircle : item.icon;
                        const isVisible = !filterChannels || filterChannels.length === 0 || !item.channels || item.channels.some(c => filterChannels.includes(c));
                        
                        if (!isVisible) return null;

                        return (
                        <button
                            key={item.key}
                            type="button"
                            className="flex flex-col items-center justify-center text-center gap-2 p-3 rounded-lg bg-card text-card-foreground border border-border cursor-grab user-select-none transition-all duration-200 hover:shadow-md hover:border-black/10 active:cursor-grabbing active:scale-[0.98] shadow-sm"
                            style={{'--item-color': item.color} as React.CSSProperties}
                            draggable
                            onDragStart={(e) => handleDragStart(e, item)}
                            onClick={() => handleItemClick(item)}
                            aria-label={`Add ${item.label}`}
                            title={`${item.label}${item.description ? ` - ${item.description}`:''}`}
                        >
                            <div className="w-10 h-10 rounded-full grid place-items-center bg-purple-100 flex-shrink-0">
                                <Icon className="w-5 h-5 text-purple-600" />
                            </div>
                            <span className="text-sm font-medium leading-snug">{item.label}</span>
                        </button>
                        )
                    })}
                </div>
            </div>
        ))}
    </nav>
  );
}
