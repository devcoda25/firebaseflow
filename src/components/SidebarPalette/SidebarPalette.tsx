'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from './sidebar-palette.module.css';
import { SECTION_DATA, SectionDefinition, ItemDefinition, PaletteItemPayload, Channel } from './sections-data';
import { readJSON, writeJSON } from './storage';
import { useShortcutFocus } from './useShortcutFocus';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

/** Tiny class combiner (no external dep). */
function cn(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export type SidebarPaletteProps = {
  onDragStart: (e: React.DragEvent, item: PaletteItemPayload) => void;
  onItemClick?: (item: PaletteItemPayload) => void;
  filterChannels?: Channel[];
  defaultCollapsed?: boolean;
  enableFavorites?: boolean;
  enableRecent?: boolean;
  persistentKeys?: {
    collapse?: string;
    favorites?: string;
    recent?: string;
  };
  className?: string;
};

const KEYS = {
  collapse: 'palette:collapse:v2',
  favorites: 'palette:favorites:v1',
  recent: 'palette:recent:v1',
};

const RECENT_LIMIT = 6;

export default function SidebarPalette({
  onDragStart,
  onItemClick,
  filterChannels,
  defaultCollapsed = false,
  enableFavorites = true,
  enableRecent = true,
  persistentKeys,
  className,
}: SidebarPaletteProps) {
  const keys = { ...KEYS, ...(persistentKeys || {}) };

  const [search, setSearch] = useState('');
  
  const searchRef = useRef<HTMLInputElement | null>(null);
  useShortcutFocus(searchRef, ['f', '/']); // F or / to focus search


  const normalizedQuery = search.trim().toLowerCase();

  const baseSections = useMemo<SectionDefinition[]>(() => {
    if (!filterChannels || filterChannels.length === 0) return SECTION_DATA;
    const allowed = new Set(filterChannels);
    return SECTION_DATA.map((sec) => ({
      ...sec,
      items: sec.items.filter((it) => !it.channels || it.channels.some((c) => allowed.has(c))),
    })).filter((sec) => sec.items.length > 0);
  }, [filterChannels]);

  const filteredSections = useMemo<SectionDefinition[]>(() => {
    if (!normalizedQuery) return baseSections;
    return baseSections
      .map((sec) => {
        const items = sec.items.filter((it) => {
          const hay = `${it.label} ${(it.keywords || []).join(' ')} ${it.description || ''}`.toLowerCase();
          return hay.includes(normalizedQuery);
        });
        return { ...sec, items };
      })
      .filter((sec) => sec.items.length > 0);
  }, [baseSections, normalizedQuery]);

  function toPayload(it: ItemDefinition): PaletteItemPayload {
    return { key: it.key, label: it.label, icon: it.icon, type: it.type, color: it.color, description: it.description };
  }

  function recordRecent(itemKey: string) {
    if (!enableRecent) return;
    // Implementation for recently used items can be added here
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

    recordRecent(item.key);
    onDragStart(e, payload);
  }

  function handleItemClick(item: ItemDefinition) {
    const payload = toPayload(item);
    recordRecent(item.key);
    onItemClick?.(payload);
  }
  
  const mainActions = filteredSections.find(s => s.key === 'main_actions')?.items || [];
  const operations = filteredSections.find(s => s.key === 'operations')?.items || [];

  return (
    <aside className={cn(styles.root, className)} aria-label="Node palette">
      <div className={styles.mainActions}>
        {mainActions.map(item => (
            <div
                key={item.key}
                className={cn(styles.item, styles.mainActionItem)}
                style={{'--item-color': item.color} as React.CSSProperties}
                draggable
                onDragStart={(e) => handleDragStart(e, item)}
                onClick={() => handleItemClick(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') handleItemClick(item);
                }}
                aria-label={`Drag ${item.label} onto canvas`}
                >
                <div className={styles.mainActionContent}>
                    <div className={styles.mainActionHeader}>
                        <span className={styles.label}>{item.label}</span>
                        <span className={styles.icon}>{item.icon}</span>
                    </div>
                    <p className={styles.description}>{item.description}</p>
                </div>
            </div>
        ))}
      </div>
      
      <div className={styles.operations}>
        <h3 className={styles.secTitle}>Operations</h3>
        <div className={styles.operationsGrid}>
            {operations.map(item => (
                 <div
                    key={item.key}
                    className={styles.operationItem}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onClick={() => handleItemClick(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') handleItemClick(item);
                    }}
                    aria-label={`Drag ${item.label} onto canvas`}
                    title={item.label}
                  >
                    <span className={styles.icon}>{item.icon}</span>
                    <span className={styles.label}>{item.label}</span>
                  </div>
            ))}
        </div>
      </div>
    </aside>
  );
}
