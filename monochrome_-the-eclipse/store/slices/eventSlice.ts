import { StateCreator } from 'zustand';
import { produce } from 'immer';
import { GameStore } from '../gameStore';
import { EventDefinition, EventChoice, GameState, EnemyCharacter, CombatLogMessage } from '../../types';
import { monsterData } from '../../dataMonsters';
import { generateCoins, detectPatterns, flipCoin } from '../../utils/gameLogic';
import { determineEnemyIntent, calculateCombatPrediction, applyInnatePassives } from '../../utils/combatLogic';


export interface EventSlice {
  currentEvent: EventDefinition | null;
  eventPhase: 'choice' | 'coinFlip' | 'result';
  eventResultData: { type: string; payload: any } | null;
  eventDisplayItems: { label: string; value: string | number; }[];
  handleEventChoice: (choice: EventChoice) => void;
}

export const createEventSlice: StateCreator<GameStore, [], [], EventSlice> = (set, get, api) => ({
  currentEvent: null,
  eventPhase: 'choice',
  eventResultData: null,
  eventDisplayItems: [],
  handleEventChoice: (choice) => {
    set(produce((state: GameStore) => {
      const { player } = state;
      if (!player) return;

      let eventOutcome: any = null;
      let combatToStart: string | null = null;
      
      const determineOutcome = (result: any) => {
          if (!result) return;
          if (result.combat) {
              combatToStart = result.combat;
          }
          eventOutcome = result;
      };

      if (choice.guaranteed && choice.result) {
          determineOutcome(choice.result);
      } else if (choice.baseSuccessRate !== undefined) {
          let successRate = choice.baseSuccessRate / 100;
          if (choice.senseBonus && player.class in choice.senseBonus) {
              successRate += (choice.senseBonus[player.class] || 0) / 100;
          }
          const success = Math.random() < successRate;
          determineOutcome(success ? choice.success : choice.failure);
      } else {
          eventOutcome = { message: "아무 일도 일어나지 않았습니다." };
      }
      
      // If combat is triggered, we bypass the normal event result screen and go straight to combat.
      if (combatToStart) {
          // This is the logic from startCombat, adapted to work within this 'produce' block
          const monsterTemplate = monsterData[combatToStart];
          const enemyCoins = generateCoins();
          const enemy: EnemyCharacter = {
              key: combatToStart,
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
          
          state.enemy = enemy;
          state.playerCoins = generateCoins();
          state.combatLog = []; // Reset combat log for the new fight
          state.combatTurn = 1;
          state.selectedPatterns = [];
          state.usedCoinIndices = [];
          
          const log = (message: string, type: CombatLogMessage['type']) => {
            state.combatLog.push({ id: Date.now() + Math.random(), turn: state.combatTurn, message, type });
          };

          log(`--- 전투 시작 ---`, 'system');
          if (eventOutcome.message) {
            log(`[이벤트] ${eventOutcome.message}`, 'system');
          }
          log(`${enemy.name} 등장!`, 'system');
          
          applyInnatePassives(state, log); // Pass the draft state
          
          state.gameState = GameState.COMBAT;

          state.detectedPatterns = detectPatterns(state.playerCoins);
          state.enemyIntent = determineEnemyIntent(enemy);
          state.combatPrediction = calculateCombatPrediction(player, enemy, state.selectedPatterns, state.enemyIntent, state.playerCoins);
          
          // Clear event state as we transition away
          state.currentEvent = null;
          state.eventPhase = 'choice';
          state.eventResultData = null;
          state.eventDisplayItems = [];

      } else if (eventOutcome) {
          // No combat, so show the regular result screen
          const knownResultLabels: { [key: string]: string } = {
              damage: '받은 피해',
              echoRemnants: '획득한 에코',
              senseFragments: '획득한 감각 조각',
              memoryPieces: '획득한 기억 조각',
              curse: '저주 부여',
              reserveCoinsGained: '획득한 예비 동전',
          };
          const displayItems: { label: string; value: string | number; }[] = [];
          
          if (eventOutcome.reserveCoinsGained) {
              for (let i = 0; i < eventOutcome.reserveCoinsGained; i++) {
                  if (state.reserveCoins.length < 3) {
                      state.reserveCoins.push({ face: null, locked: false, id: Date.now() + Math.random() });
                  }
              }
          }

          for (const key in eventOutcome) {
              if (knownResultLabels[key]) {
                  const value = eventOutcome[key];
                  const type = typeof value;
                  if ((type === 'string' && value !== '') || (type === 'number' && value !== 0)) {
                      displayItems.push({ label: knownResultLabels[key], value });
                  }
              }
          }
          
          state.eventPhase = 'result';
          state.eventResultData = { type: 'outcome', payload: { baseMessage: eventOutcome.message || "결과가 발생했습니다." } };
          state.eventDisplayItems = displayItems;

          if (eventOutcome.damage) player.currentHp = Math.max(0, player.currentHp - eventOutcome.damage);
          if (eventOutcome.echoRemnants) state.resources.echoRemnants += eventOutcome.echoRemnants;
          if (eventOutcome.senseFragments) state.resources.senseFragments += eventOutcome.senseFragments;
          if (eventOutcome.memoryPieces) state.resources.memoryPieces += eventOutcome.memoryPieces;
      }
    }));
  },
});