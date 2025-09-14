import React from "react";
import { useGameStore } from './store/gameStore';
import { GameState } from "./types";
import { AnimatePresence } from 'framer-motion';

import { MenuScreen } from './screens/MenuScreen';
import { CharacterSelectScreen } from './screens/CharacterSelectScreen';
import { ExplorationScreen } from './screens/ExplorationScreen';
import { CombatScreen } from './screens/CombatScreen';
import { ShopScreen } from './screens/ShopScreen';
import { RestScreen } from './screens/RestScreen';
import { EventScreen } from './screens/EventScreen';
import { GameOverScreen } from './screens/GameOverScreen';
import { VictoryScreen } from './screens/VictoryScreen';
import { StageClearScreen } from './screens/StageClearScreen';
import { MemoryAltarScreen } from './screens/MemoryAltarScreen';

import InventoryPanel from './components/InventoryPanel';
import SkillReplacementModal from './components/modals/SkillReplacementModal';
import KeywordTooltip from "./components/KeywordTooltip";

export const App: React.FC = () => {
  const gameState = useGameStore(state => state.gameState);
  const isInventoryOpen = useGameStore(state => state.isInventoryOpen);
  const setInventoryOpen = useGameStore(state => state.setInventoryOpen);
  const player = useGameStore(state => state.player);
  const unlockedPatterns = useGameStore(state => state.unlockedPatterns);
  const forgetSkill = useGameStore(state => state.forgetSkill);
  const tooltip = useGameStore(state => state.tooltip);
  const hideTooltip = useGameStore(state => state.hideTooltip);

  const renderGame = () => {
    switch (gameState) {
      case GameState.MENU:
        return <MenuScreen />;
      case GameState.CHARACTER_SELECT:
        return <CharacterSelectScreen />;
      case GameState.EXPLORATION:
        return <ExplorationScreen />;
      case GameState.COMBAT:
        return <CombatScreen />;
      case GameState.SHOP:
        return <ShopScreen />;
      case GameState.REST:
        return <RestScreen />;
      case GameState.EVENT:
        return <EventScreen />;
      case GameState.GAME_OVER:
        return <GameOverScreen />;
      case GameState.VICTORY:
        return <VictoryScreen />;
      case GameState.STAGE_CLEAR:
        return <StageClearScreen />;
      case GameState.MEMORY_ALTAR:
        return <MemoryAltarScreen />;
      default:
        return <div>Unknown game state</div>;
    }
  };

  return (
    <>
      <AnimatePresence>
        {tooltip && <KeywordTooltip />}
      </AnimatePresence>
      {tooltip && (
        <div 
          className="fixed inset-0 z-[49]"
          onClick={hideTooltip}
        />
      )}
      
      {renderGame()}
      
      {player && (
        <InventoryPanel
          isOpen={isInventoryOpen}
          onClose={() => setInventoryOpen(false)}
          player={player}
          unlockedPatterns={unlockedPatterns}
          onForgetSkill={forgetSkill}
        />
      )}
      <SkillReplacementModal />
    </>
  );
};