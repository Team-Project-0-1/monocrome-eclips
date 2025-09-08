
import { StateCreator } from 'zustand';
import { produce } from 'immer';
import { GameStore } from '../gameStore';
import { StageNode, NodeType, EventDefinition, GameState, EnemyCharacter, CombatLogMessage } from '../../types';
import { generateStageNodes, detectPatterns, generateCoins } from '../../utils/gameLogic';
import { stageData } from '../../dataStages';
import { eventData } from '../../dataEvents';
import { STAGE_TURNS } from '../../constants';
import { monsterData } from '../../dataMonsters';
import { determineEnemyIntent, calculateCombatPrediction, applyInnatePassives } from '../../utils/combatLogic';


export interface ExplorationSlice {
  currentStage: number;
  currentTurn: number;
  stageNodes: StageNode[][];
  visitedNodes: string[];
  startStage: (stageNumber: number) => void;
  selectNode: (node: StageNode) => void;
  proceedToNextTurn: () => void;
  handleRestChoice: (choice: 'heal' | 'memory_altar') => void;
}

export const createExplorationSlice: StateCreator<GameStore, [], [], ExplorationSlice> = (set, get, api) => ({
  currentStage: 1,
  currentTurn: 1,
  stageNodes: [],
  visitedNodes: [],
  startStage: (stageNumber) => {
    set({
      currentStage: stageNumber,
      currentTurn: 1,
      stageNodes: generateStageNodes(stageNumber),
      visitedNodes: [],
      gameState: GameState.EXPLORATION,
      // Reset resources/patterns for the new stage.
      resources: { echoRemnants: 0, senseFragments: 0, memoryPieces: 0 },
      unlockedPatterns: [],
    });
  },
  selectNode: (node) => {
    set(produce((draft: GameStore) => {
        draft.visitedNodes.push(node.id);

        switch (node.type) {
            case NodeType.COMBAT:
            case NodeType.MINIBOSS:
            case NodeType.BOSS: {
                const stageInfo = stageData[draft.currentStage as keyof typeof stageData];
                let monsterKey = stageInfo.combatPool[Math.floor(Math.random() * stageInfo.combatPool.length)];
                if (node.type === NodeType.MINIBOSS) monsterKey = stageInfo.miniboss;
                if (node.type === NodeType.BOSS) monsterKey = stageInfo.boss;

                // --- Inlined startCombat logic ---
                const player = draft.player;
                if (!player) return;

                const monsterTemplate = monsterData[monsterKey];
                const enemyCoins = generateCoins();

                const enemy: EnemyCharacter = {
                    key: monsterKey,
                    name: monsterTemplate.name,
                    currentHp: monsterTemplate.hp,
                    maxHp: monsterTemplate.hp,
                    baseAtk: monsterTemplate.baseAtk,
                    baseDef: monsterTemplate.baseDef,
                    temporaryDefense: 0,
                    statusEffects: {},
                    coins: enemyCoins,
                    detectedPatterns: detectPatterns(enemyCoins),
                    temporaryEffects: {},
                };
                
                draft.enemy = enemy;
                draft.playerCoins = generateCoins();
                draft.combatLog = [];
                draft.combatTurn = 1;
                draft.selectedPatterns = [];
                // FIX: usedCoinIndices should be an array, not a Set.
                draft.usedCoinIndices = [];
                
                const log = (message: string, type: CombatLogMessage['type']) => {
                  draft.combatLog.push({ id: Date.now() + Math.random(), turn: draft.combatTurn, message, type });
                };

                log(`--- 전투 시작 ---`, 'system');
                log(`${enemy.name} 등장!`, 'system');
                
                applyInnatePassives(draft, log);
                
                draft.gameState = GameState.COMBAT;

                draft.detectedPatterns = detectPatterns(draft.playerCoins);
                draft.enemyIntent = determineEnemyIntent(enemy);
                draft.combatPrediction = calculateCombatPrediction(player, enemy, draft.selectedPatterns, draft.enemyIntent, draft.playerCoins);
                break;
            }
            case NodeType.SHOP:
                draft.gameState = GameState.SHOP;
                break;
            case NodeType.REST:
                draft.gameState = GameState.REST;
                break;
            case NodeType.EVENT: {
                const eventPool = Object.values(eventData).filter((e) => !e.isFollowUp);
                const event = eventPool[Math.floor(Math.random() * eventPool.length)];

                // --- Inlined _startEvent logic ---
                draft.currentEvent = event;
                draft.eventPhase = 'choice';
                draft.gameState = GameState.EVENT;
                draft.eventDisplayItems = [];
                break;
            }
        }
    }));
  },
  proceedToNextTurn: () => {
    set(produce((draft: GameStore) => {
        if (!draft.player) return;

        const nextTurn = draft.currentTurn + 1;

        if (nextTurn > STAGE_TURNS) {
            if (draft.currentStage >= Object.keys(stageData).length) {
                draft.gameState = GameState.VICTORY;
            } else {
                draft.gameState = GameState.STAGE_CLEAR;
            }
        } else {
            draft.currentTurn = nextTurn;
            draft.gameState = GameState.EXPLORATION;

            // Perform transient state reset directly within this atomic update
            draft.player.temporaryDefense = 0;
            
            draft.currentEvent = null;
            draft.eventPhase = 'choice';
            draft.eventResultData = null;
            draft.eventDisplayItems = [];
        }
    }));
  },
  handleRestChoice: (choice) => {
    set(produce((draft: GameStore) => {
        if (!draft.player) return;

        if (choice === 'heal') {
            // Heal logic
            const healAmount = Math.floor(draft.player.maxHp * 0.4);
            draft.player.currentHp = Math.min(draft.player.maxHp, draft.player.currentHp + healAmount);

            // Turn progression logic (from proceedToNextTurn)
            const nextTurn = draft.currentTurn + 1;
            if (nextTurn > STAGE_TURNS) {
                if (draft.currentStage >= Object.keys(stageData).length) {
                    draft.gameState = GameState.VICTORY;
                } else {
                    draft.gameState = GameState.STAGE_CLEAR;
                }
            } else {
                draft.currentTurn = nextTurn;
                draft.gameState = GameState.EXPLORATION;
                // Reset transient state
                draft.player.temporaryDefense = 0;
                draft.currentEvent = null;
                draft.eventPhase = 'choice';
                draft.eventResultData = null;
                draft.eventDisplayItems = [];
            }
        } else if (choice === 'memory_altar') {
            draft.gameState = GameState.MEMORY_ALTAR;
        }
    }));
  },
});