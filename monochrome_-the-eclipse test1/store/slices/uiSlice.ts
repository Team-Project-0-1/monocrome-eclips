
import { StateCreator } from 'zustand';
import { GameStore } from '../gameStore';
import { SkillReplacementState } from '../../types';

export interface UiSlice {
  isInventoryOpen: boolean;
  skillReplacementState: SkillReplacementState | null;
  setInventoryOpen: (isOpen: boolean) => void;
  setSkillReplacementState: (state: SkillReplacementState | null) => void;
}

// FIX: Updated slice creator to accept `set`, `get`, and `api` arguments for zustand compatibility.
export const createUiSlice: StateCreator<GameStore, [], [], UiSlice> = (set, get, api) => ({
  isInventoryOpen: false,
  skillReplacementState: null,
  setInventoryOpen: (isOpen) => set({ isInventoryOpen: isOpen }),
  setSkillReplacementState: (state) => set({ skillReplacementState: state }),
});
