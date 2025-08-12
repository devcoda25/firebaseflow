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
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() =>
    readJSON(keys.collapse, {} as Record<string, boolean>)
  );
  const [favorites, setFavorites] = useState<string[]>(() => readJSON(keys.favorites, [] as string[]));
  const [recent, setRecent] = useState<string[]>(() => readJSON(keys.recent, [] as string[]));

  const searchRef = useRef<HTMLInputElement | null>(null);
  useShortcutFocus(searchRef, ['f', '/']); // F or / to focus search

  useEffect(() => {
    if (typeof window !== 'undefined') {
      writeJSON(keys.collapse, collapsed);
    }
  }, [collapsed, keys.collapse]);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      writeJSON(keys.favorites, favorites);
    }
  }, [favorites, keys.favorites]);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      writeJSON(keys.recent, recent);
    }
  }, [recent, keys.recent]);

  useEffect(() => {
    if (Object.keys(collapsed).length === 0 && defaultCollapsed) {
      const next: Record<string, boolean> = {};
      for (const sec of SECTION_DATA) next[sec.key] = true;
      setCollapsed(next);
    }
  }, [defaultCollapsed, collapsed]);

  const normalizedQuery = search.trim().toLowerCase();

  const baseSections = useMemo<SectionDefinition[]>(() => {
    if (!filterChannels || filterChannels.length === 0) return SECTION_DATA;
    const allowed = new Set(filterChannels);
    return SECTION_DATA.map((sec) => ({
      ...sec,
      items: sec.items.filter((it) => !it.channels || it.channels.some((c) => allowed.has(c))),
    })).filter((sec) => sec.items.length > 0);
  }, [filterChannels]);

  const filtered = useMemo<SectionDefinition[]>(() => {
    if (!normalizedQuery) return baseSections;
    return baseSections
      .map((sec) => {
        const items = sec.items.filter((it) => {
          const hay = `${it.label} ${(it.keywords || []).join(' ')}`.toLowerCase();
          return hay.includes(normalizedQuery);
        });
        return { ...sec, items };
      })
      .filter((sec) => sec.items.length > 0);
  }, [baseSections, normalizedQuery]);

  function toPayload(it: ItemDefinition): PaletteItemPayload {
    return { key: it.key, label: it.label, icon: it.icon, type: it.type };
  }

  const favoriteSection: SectionDefinition | null = useMemo(() => {
    if (!enableFavorites) return null;
    const favItems: ItemDefinition[] = [];
    const favoriteSet = new Set(favorites);
    for (const sec of baseSections) {
      for (const it of sec.items) if (favoriteSet.has(it.key)) favItems.push(it);
    }
    if (favItems.length === 0) return null;
    return { key: 'favorites', title: 'Favorites', items: favItems.slice(0, 12) };
  }, [baseSections, favorites, enableFavorites]);

  const recentSection: SectionDefinition | null = useMemo(() => {
    if (!enableRecent || recent.length === 0) return null;
    const map = new Map<string, ItemDefinition>();
    for (const sec of SECTION_DATA) for (const it of sec.items) map.set(it.key, it);
    const recentItems = recent.map((k) => map.get(k)).filter(Boolean) as ItemDefinition[];
    if (recentItems.length === 0) return null;
    return { key: 'recent', title: 'Recently used', items: recentItems.slice(0, RECENT_LIMIT) };
  }, [recent, enableRecent]);

  const finalSections: SectionDefinition[] = useMemo(() => {
    const head: SectionDefinition[] = [];
    const queryFilter = (it: ItemDefinition) => `${it.label} ${(it.keywords || []).join(' ')}`.toLowerCase().includes(normalizedQuery);
    
    if (favoriteSection && (!normalizedQuery || favoriteSection.items.some(queryFilter))) {
      head.push({
        ...favoriteSection,
        items: favoriteSection.items.filter(queryFilter),
      });
    }
    if (recentSection && (!normalizedQuery || recentSection.items.some(queryFilter))) {
      head.push({
        ...recentSection,
        items: recentSection.items.filter(queryFilter),
      });
    }
    return head.concat(filtered);
  }, [favoriteSection, recentSection, filtered, normalizedQuery]);

  function toggleCollapse(sectionKey: string) {
    setCollapsed((c) => ({ ...c, [sectionKey]: !c[sectionKey] }));
  }

  function isCollapsed(sectionKey: string) {
    return !!collapsed[sectionKey];
  }

  function toggleFavorite(itemKey: string) {
    setFavorites((prev) => {
      const set = new Set(prev);
      set.has(itemKey) ? set.delete(itemKey) : set.add(itemKey);
      return Array.from(set);
    });
  }

  function recordRecent(itemKey: string) {
    if (!enableRecent) return;
    setRecent((r) => {
      const next = [itemKey, ...r.filter((k) => k !== itemKey)];
      return next.slice(0, RECENT_LIMIT);
    });
  }

  function handleDragStart(e: React.DragEvent, item: ItemDefinition) {
    const payload = toPayload(item);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/x-flow-node', JSON.stringify(payload));
    e.dataTransfer.setData('text/plain', item.label);

    const ghost = document.createElement('div');
    ghost.className = styles.dragGhost;
    ghost.innerHTML = `<span role="img" aria-hidden="true">${item.icon}</span> ${item.label}`;
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

  function highlight(label: string) {
    if (!normalizedQuery) return label;
    const idx = label.toLowerCase().indexOf(normalizedQuery);
    if (idx === -1) return label;
    return (
      <>
        {label.slice(0, idx)}
        <mark className={styles.mark}>{label.slice(idx, idx + normalizedQuery.length)}</mark>
        {label.slice(idx + normalizedQuery.length)}
      </>
    );
  }

  return (
    <aside className={cn(styles.root, className)} aria-label="Node palette">
      <div className={styles.searchRow}>
        <Input
          ref={searchRef}
          type="text"
          value={search}
          placeholder="Search nodes (F or /)"
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search palette nodes"
          onKeyDown={(e) => {
            if (e.key === 'Escape' && search) {
              e.preventDefault();
              setSearch('');
            }
          }}
        />
        <div className={styles.actions}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCollapsed(Object.fromEntries(SECTION_DATA.map((s) => [s.key, true])))}
            title="Collapse all"
          >
            Collapse
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCollapsed({})} title="Expand all">
            Expand
          </Button>
        </div>
      </div>
      <div className={styles.sections}>
        {finalSections.length === 0 && <div className={styles.empty}>No results for “{search}”.</div>}
        {finalSections.map((sec) => (
          <section key={`${sec.key}-${sec.title}`} className={styles.section}>
            <button
              className={styles.sectionHeader}
              aria-expanded={!isCollapsed(sec.key)}
              onClick={() => toggleCollapse(sec.key)}
            >
              <span className={styles.secTitle}>{sec.title}</span>
              <span className={styles.count}>{sec.items.length}</span>
            </button>
            {!isCollapsed(sec.key) && (
              <ul className={styles.list}>
                {sec.items.map((item) => {
                  const fav = favorites.includes(item.key);
                  return (
                    <li key={item.key} className={styles.li}>
                      <div
                        className={styles.item}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
                        onDoubleClick={() => handleItemClick(item)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') handleItemClick(item);
                        }}
                        aria-label={`Drag ${item.label} onto canvas`}
                      >
                        <span className={styles.icon} aria-hidden="true">
                          {item.icon}
                        </span>
                        <span className={styles.label}>{highlight(item.label)}</span>
                        {enableFavorites && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(styles.star, fav && styles.starActive)}
                            aria-pressed={fav}
                            aria-label={fav ? 'Unfavorite' : 'Favorite'}
                            title={fav ? 'Unfavorite' : 'Favorite'}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(item.key);
                            }}
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        ))}
      </div>
    </aside>
  );
}
