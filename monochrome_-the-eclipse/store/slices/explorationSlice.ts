import { StateCreator } from 'zustand';
import { produce } from 'immer';
import { GameStore } from '../gameStore';
import { StageNode, NodeType, EventDefinition, GameState, EnemyCharacter, CombatLogMessage, CharacterClass, CoinFace } from '../../types';
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
  path: { turn: number; nodeIndex: number; nodeId: string; }[];
  startStage: (stageNumber: number) => void;
  selectNode: (node: StageNode, nodeIndex: number) => void;
  proceedToNextTurn: () => void;
  handleRestChoice: (choice: 'heal' | 'memory_altar') => void;
}

export const createExplorationSlice: StateCreator<GameStore, [], [], ExplorationSlice> = (set, get, api) => ({
  currentStage: 1,
  currentTurn: 1,
  stageNodes: [],
  path: [],
  startStage: (stageNumber) => {
    set(produce((draft: GameStore) => {
        draft.currentStage = stageNumber;
        draft.currentTurn = 1;
        draft.stageNodes = generateStageNodes(stageNumber);
        draft.path = [];
        draft.gameState = GameState.EXPLORATION;
        
        // Reset resources/patterns for the new stage.
        draft.resources = { echoRemnants: 0, senseFragments: 0, memoryPieces: 0 };
        draft.unlockedPatterns = [];

        // Reset player combat state for the new stage
        if (draft.player) {
            draft.player.statusEffects = {};
            draft.player.temporaryEffects = {};
            draft.player.temporaryDefense = 0;
            draft.player.activeSkillCooldown = 0;
            draft.playerCoins = [];
        }
    }));
  },
  selectNode: (node, nodeIndex) => {
    set(produce((draft: GameStore) => {
        draft.path.push({ turn: draft.currentTurn, nodeIndex, nodeId: node.id });

        switch (node.type) {
            case NodeType.COMBAT:
            case NodeType.MINIBOSS:
            case NodeType.BOSS: {
                const stageInfo = stageData[draft.currentStage as keyof typeof stageData];
                let monsterKey = stageInfo.combatPool[Math.floor(Math.random() * stageInfo.combatPool.length)];
                if (node.type === NodeType.MINIBOSS) monsterKey = stageInfo.miniboss;
                if (node.type === NodeType.BOSS) monsterKey = stageInfo.boss;

                const player = draft.player;
                if (!player) return;

                player.activeSkillCooldown = 0;

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
                    tier: monsterTemplate.tier,
                    sprite: monsterTemplate.sprite,
                };
                
                draft.enemy = enemy;
                
                draft.combatLog = [];
                draft.combatTurn = 1;
                draft.selectedPatterns = [];
                draft.usedCoinIndices = [];
                draft.activeSkillState = { phase: 'idle', selection: [] };
                
                const log = (message: string, type: CombatLogMessage['type']) => {
                  draft.combatLog.push({ id: Date.now() + Math.random(), turn: draft.combatTurn, message, type });
                };

                log(`--- 전투 시작 ---`, 'system');
                log(`${enemy.name} 등장!`, 'system');
                
                // REFACTOR: Generate a fresh set of coins for EVERY combat encounter.
                draft.playerCoins = generateCoins();
                
                // Apply innate passives at the start of every combat.
                applyInnatePassives(draft, log);
                
                // Specifically apply Rogue's passive to the newly generated coins.
                if (player.class === CharacterClass.ROGUE) {
                    if (draft.playerCoins.length > 0) {
                        draft.playerCoins[0].face = CoinFace.HEADS;
                    }
                }
                
                draft.gameState = GameState.COMBAT;

                // With the definitive coin state set, calculate patterns and predictions.
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