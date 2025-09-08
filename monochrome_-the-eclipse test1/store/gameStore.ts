import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { produce } from 'immer';
import { GameState } from '../types';

import { MetaSlice, createMetaSlice, initialMetaProgress } from './slices/metaSlice';
import { PlayerSlice, createPlayerSlice } from './slices/playerSlice';
import { ExplorationSlice, createExplorationSlice } from './slices/explorationSlice';
import { CombatSlice, createCombatSlice } from './slices/combatSlice';
import { EventSlice, createEventSlice } from './slices/eventSlice';
import { UiSlice, createUiSlice } from './slices/uiSlice';

// --- TYPE DEFINITIONS ---
export type GameStore = MetaSlice & PlayerSlice & ExplorationSlice & CombatSlice & EventSlice & UiSlice & {
  gameState: GameState;
  setGameState: (gameState: GameState) => void;
  startGame: () => void;
  resetGame: (fullReset?: boolean) => void;
};

// --- INITIAL STATE FOR MAIN STORE ---
const initialMainState = {
  gameState: GameState.MENU,
};


// --- ZUSTAND STORE ---
export const useGameStore = create<GameStore>()(
  devtools(
    persist(
      (set, get, api) => ({
        ...initialMainState,
        ...createMetaSlice(set, get, api),
        ...createPlayerSlice(set, get, api),
        ...createExplorationSlice(set, get, api),
        ...createCombatSlice(set, get, api),
        ...createEventSlice(set, get, api),
        ...createUiSlice(set, get, api),

        // --- GLOBAL ACTIONS ---
        setGameState: (gameState) => set({ gameState }),
        startGame: () => set({ gameState: GameState.CHARACTER_SELECT }),
        
        resetGame: (fullReset = false) => {
            set(produce((draft: GameStore) => {
                const currentMetaProgress = draft.metaProgress;

                // playerSlice reset
                draft.player = null;
                draft.resources = { echoRemnants: 0, senseFragments: 0, memoryPieces: 0 };
                draft.unlockedPatterns = [];
                
                // explorationSlice reset
                draft.currentStage = 1;
                draft.currentTurn = 1;
                draft.stageNodes = [];
                draft.visitedNodes = [];

                // combatSlice reset
                draft.enemy = null;
                draft.playerCoins = [];
                draft.detectedPatterns = [];
                draft.selectedPatterns = [];
                // FIX: usedCoinIndices should be an array, not a Set.
                draft.usedCoinIndices = [];
                draft.combatPrediction = null;
                draft.enemyIntent = null;
                draft.combatLog = [];
                draft.combatTurn = 1;

                // eventSlice reset
                draft.currentEvent = null;
                draft.eventPhase = 'choice';
                draft.eventResultData = null;
                draft.eventDisplayItems = [];

                // uiSlice reset
                draft.isInventoryOpen = false;
                draft.skillReplacementState = null;

                // main store reset
                draft.gameState = GameState.MENU;

                // metaSlice (conditional reset)
                draft.metaProgress = fullReset ? initialMetaProgress : currentMetaProgress;
            }));
        },
      }),
      {
        name: 'monochrome-eclipse-save',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ metaProgress: state.metaProgress }),
      }
    )
  )
);