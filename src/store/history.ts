import { create } from 'zustand'

interface HistoryState {
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void
  setCanUndo: (b: boolean) => void
  setCanRedo: (b: boolean) => void
}

export const useHistoryStore = create<HistoryState>((set) => ({
  canUndo: false,
  canRedo: false,
  undo: () => {},
  redo: () => {},
  setCanUndo: (b) => set({ canUndo: b }),
  setCanRedo: (b) => set({ canRedo: b }),
}))
