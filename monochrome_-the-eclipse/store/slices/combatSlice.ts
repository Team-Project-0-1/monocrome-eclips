
import { StateCreator } from 'zustand';
import { produce } from 'immer';
import { GameStore } from '../gameStore';
import { EnemyCharacter, Coin, DetectedPattern, CombatPrediction, EnemyIntent, CombatLogMessage, PatternType, CoinFace, CoinFace as CF, GameState } from '../../types';
import { monsterData } from '../../dataMonsters';
import { stageData } from '../../dataStages';
import { generateCoins, detectPatterns } from '../../utils/gameLogic';
import { determineEnemyIntent, calculateCombatPrediction, applyInnatePassives, applyPassives, resolvePlayerActions, resolveEnemyActions, processEndOfTurn, setupNextTurn } from '../../utils/combatLogic';
import { STAGE_TURNS } from '../../constants';
import { eventData } from '../../dataEvents';

export interface CombatSlice {
  enemy: EnemyCharacter | null;
  playerCoins: Coin[];
  detectedPatterns: DetectedPattern[];
  selectedPatterns: DetectedPattern[];
  usedCoinIndices: number[];
  combatPrediction: CombatPrediction | null;
  enemyIntent: EnemyIntent | null;
  combatLog: CombatLogMessage[];
  combatTurn: number;
  flipCoin: (index: number) => void;
  flipAllCoins: () => void;
  togglePattern: (type: PatternType, face: CF | undefined) => void;
  executeTurn: () => void;
  addLog: (message: string, type: CombatLogMessage['type']) => void;
}

export const createCombatSlice: StateCreator<GameStore, [], [], CombatSlice> = (set, get, api) => ({
  enemy: null,
  playerCoins: [],
  detectedPatterns: [],
  selectedPatterns: [],
  usedCoinIndices: [],
  combatPrediction: null,
  enemyIntent: null,
  combatLog: [],
  combatTurn: 1,
  addLog: (message, type) => {
      set(produce(state => {
          state.combatLog.push({ id: Date.now() + Math.random(), turn: state.combatTurn, message, type });
      }));
  },
  flipCoin: (index) => {
    set(produce((draft: GameStore) => {
        if (draft.playerCoins[index]) {
            draft.playerCoins[index].face = draft.playerCoins[index].face === CF.HEADS ? CF.TAILS : CF.HEADS;
        }
        draft.selectedPatterns = [];
        draft.usedCoinIndices = [];

        // Inlined _updatePatternsAndPrediction
        const { player, enemy, playerCoins, selectedPatterns } = draft;
        if (player && enemy) {
            draft.detectedPatterns = detectPatterns(playerCoins);
            draft.enemyIntent = determineEnemyIntent(enemy);
            draft.combatPrediction = calculateCombatPrediction(player, enemy, selectedPatterns, draft.enemyIntent, playerCoins);
        }
    }));
  },
  flipAllCoins: () => {
    set(produce((draft: GameStore) => {
        if(draft.player) {
          const headsChance = (draft.player.temporaryEffects?.headsChanceUp?.value || 0) + 0.5;
          draft.playerCoins = generateCoins(5, headsChance);
          if(draft.player.temporaryEffects?.firstCoinHeads) {
            draft.playerCoins[0].face = CF.HEADS;
          }
        } else {
          draft.playerCoins = generateCoins();
        }
        draft.selectedPatterns = [];
        draft.usedCoinIndices = [];

        // Inlined _updatePatternsAndPrediction
        const { player, enemy, playerCoins, selectedPatterns } = draft;
        if (player && enemy) {
            draft.detectedPatterns = detectPatterns(playerCoins);
            draft.enemyIntent = determineEnemyIntent(enemy);
            draft.combatPrediction = calculateCombatPrediction(player, enemy, selectedPatterns, draft.enemyIntent, playerCoins);
        }
    }));
  },
  togglePattern: (type, face) => {
    set(produce((draft: GameStore) => {
      const { detectedPatterns, selectedPatterns, usedCoinIndices, player, enemy, playerCoins } = draft;
      const isCurrentlySelected = selectedPatterns.some(p => p.type === type && p.face === face);

      if (isCurrentlySelected) {
        draft.selectedPatterns = selectedPatterns.filter(p => !(p.type === type && p.face === face));
      } else {
        const availableInstance = detectedPatterns.find(p =>
          p.type === type && p.face === face && !p.indices.some(i => usedCoinIndices.includes(i))
        );
        if (availableInstance) {
          draft.selectedPatterns.push(availableInstance);
        }
      }
      
      draft.usedCoinIndices = Array.from(new Set(draft.selectedPatterns.flatMap(p => p.indices)));
      
      // Inlined _updatePatternsAndPrediction
      if (player && enemy) {
          draft.enemyIntent = determineEnemyIntent(enemy);
          draft.combatPrediction = calculateCombatPrediction(player, enemy, draft.selectedPatterns, draft.enemyIntent, playerCoins);
      }
    }));
  },
  executeTurn: () => {
    const { selectedPatterns, player, enemy } = get();
    if (selectedPatterns.length === 0 || !player || !enemy) return;

    set(produce((draft: GameStore) => {
      // 1. Increment turn and setup logging
      draft.combatTurn += 1;
      const log = (message: string, type: CombatLogMessage['type']) => {
        draft.combatLog.push({ id: Date.now() + Math.random(), turn: draft.combatTurn, message, type });
      };
      log(`--- ${draft.combatTurn}턴 ---`, 'system');

      // 2. Resolve Turn Actions
      applyPassives(draft, 'PLAYER_TURN_START', log);
      resolvePlayerActions(draft, log);

      if (draft.enemy && draft.enemy.currentHp > 0) {
        resolveEnemyActions(draft, log);
      }
      
      if (draft.player && draft.player.currentHp > 0 && draft.enemy && draft.enemy.currentHp > 0) {
        processEndOfTurn(draft, log);
      }

      // 3. Check for Win/Loss/Continue
      const playerIsDead = !draft.player || draft.player.currentHp <= 0;
      const enemyIsDead = !draft.enemy || draft.enemy.currentHp <= 0;

      if (enemyIsDead) {
        log(`${draft.enemy!.name}을(를) 처치했습니다!`, 'system');
        
        // Apply Rewards
        const rewards = { echoes: 10, sense: 1, memory: 1 };
        draft.resources.echoRemnants += rewards.echoes;
        draft.resources.senseFragments += rewards.sense;
        draft.resources.memoryPieces += rewards.memory;
        draft.metaProgress.totalEchoCollected += rewards.echoes;
        
        const isBoss = draft.enemy!.key === stageData[draft.currentStage as keyof typeof stageData].boss;
        if (isBoss) {
            if (draft.currentStage >= Object.keys(stageData).length) {
                draft.gameState = GameState.VICTORY;
            } else {
                draft.gameState = GameState.STAGE_CLEAR;
            }
        } else {
            // This logic is a simplified version of proceedToNextTurn, inlined
            draft.currentTurn += 1;
            draft.gameState = GameState.EXPLORATION;
            if (draft.player) draft.player.temporaryDefense = 0;
            
            // Reset transient combat/event states
            draft.currentEvent = null;
            draft.eventPhase = 'choice';
            draft.enemy = null;
            draft.combatLog = [];
            draft.playerCoins = [];
            draft.selectedPatterns = [];
        }

      } else if (playerIsDead) {
        log(`플레이어가 쓰러졌습니다...`, 'system');
        
        // Update meta on run end
        draft.metaProgress.totalRuns += 1;
        if (draft.currentStage > draft.metaProgress.highestStage) {
            draft.metaProgress.highestStage = draft.currentStage;
        }
        
        draft.gameState = GameState.GAME_OVER;
      } else {
        // --- Combat Continues: Setup next turn ---
        
        // Logic from setupNextTurn
        draft.player!.temporaryDefense = 0;
        draft.enemy!.temporaryDefense = 0;
        draft.enemy!.detectedPatterns = detectPatterns(draft.enemy!.coins);
        draft.enemyIntent = determineEnemyIntent(draft.enemy!);
        
        // Logic from flipAllCoins
        const headsChance = (draft.player!.temporaryEffects?.headsChanceUp?.value || 0) + 0.5;
        draft.playerCoins = generateCoins(5, headsChance);
        if (draft.player!.temporaryEffects?.firstCoinHeads) {
            draft.playerCoins[0].face = CF.HEADS;
        }
        draft.selectedPatterns = [];
        draft.usedCoinIndices = [];
        
        // Logic from _updatePatternsAndPrediction
        draft.detectedPatterns = detectPatterns(draft.playerCoins);
        // enemyIntent already updated above
        draft.combatPrediction = calculateCombatPrediction(draft.player!, draft.enemy!, draft.selectedPatterns, draft.enemyIntent, draft.playerCoins);
      }
    }));
  },
});
