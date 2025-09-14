import { StateCreator } from 'zustand';
import { GameStore } from '../gameStore';
import { SkillReplacementState, CombatEffect, TooltipState, TooltipContent } from '../../types';

export type EffectPayload = Omit<CombatEffect, 'id'>;

export interface UiSlice {
  isInventoryOpen: boolean;
  skillReplacementState: SkillReplacementState | null;
  combatEffects: CombatEffect[];
  playerHit: number;
  enemyHit: number;
  tooltip: TooltipState | null;
  setInventoryOpen: (isOpen: boolean) => void;
  setSkillReplacementState: (state: SkillReplacementState | null) => void;
  removeCombatEffect: (id: number) => void;
  showTooltip: (content: TooltipContent, rect: DOMRect) => void;
  hideTooltip: () => void;
}

export const createUiSlice: StateCreator<GameStore, [], [], UiSlice> = (set, get, api) => ({
  isInventoryOpen: false,
  skillReplacementState: null,
  combatEffects: [],
  playerHit: 0,
  enemyHit: 0,
  tooltip: null,
  setInventoryOpen: (isOpen) => set({ isInventoryOpen: isOpen }),
  setSkillReplacementState: (state) => set({ skillReplacementState: state }),
  removeCombatEffect: (id) => set(state => ({
    combatEffects: state.combatEffects.filter(e => e.id !== id)
  })),
  showTooltip: (content, rect) => {
    const tooltipHeight = 120;
    const tooltipWidth = 320;
    const buffer = 10;
    const position: TooltipState['position'] = {};

    if (rect.bottom + tooltipHeight + buffer > window.innerHeight) {
      position.bottom = window.innerHeight - rect.top + buffer;
    } else {
      position.top = rect.bottom + buffer;
    }

    if (rect.left + tooltipWidth > window.innerWidth) {
      position.right = buffer;
    } else {
      position.left = rect.left;
    }
    
    set({ tooltip: { content, position } });
  },
  hideTooltip: () => set({ tooltip: null }),
});