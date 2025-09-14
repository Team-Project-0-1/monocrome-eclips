import { StateCreator } from 'zustand';
import { produce } from 'immer';
import { GameStore } from '../gameStore';
import { EnemyCharacter, Coin, DetectedPattern, CombatPrediction, EnemyIntent, CombatLogMessage, PatternType, CoinFace, CoinFace as CF, GameState, ActiveSkillState, CharacterClass } from '../../types';
import { monsterData } from '../../dataMonsters';
import { stageData } from '../../dataStages';
import { generateCoins, detectPatterns, flipCoin } from '../../utils/gameLogic';
import { determineEnemyIntent, calculateCombatPrediction, applyInnatePassives, applyPassives, resolvePlayerActions, resolveEnemyActions, processEndOfTurn, setupNextTurn, processStartOfTurn } from '../../utils/combatLogic';
import { STAGE_TURNS } from '../../constants';
import { eventData } from '../../dataEvents';
import { EffectPayload } from './uiSlice';
import { characterActiveSkills } from '../../dataCharacters';

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
  swapState: {
    phase: 'idle' | 'revealed';
    reserveCoinIndex: number | null;
    revealedFace: CoinFace | null;
  };
  activeSkillState: ActiveSkillState;
  flipCoin: (index: number) => void;
  flipAllCoins: () => void;
  togglePattern: (type: PatternType, face: CF | undefined) => void;
  executeTurn: () => void;
  addLog: (message: string, type: CombatLogMessage['type']) => void;
  initiateSwap: (reserveCoinIndex: number) => void;
  cancelSwap: () => void;
  completeSwap: (activeCoinIndex: number) => void;
  useActiveSkill: () => void;
  handleActiveSkillCoinClick: (index: number) => void;
  cancelActiveSkill: () => void;
}

// --- INTERNAL HELPER FUNCTIONS FOR ATOMIC STATE UPDATES ---

const _updatePatternsAndPrediction = (draft: GameStore) => {
    const { player, enemy, playerCoins, selectedPatterns, enemyIntent } = draft;
    if (player && enemy && enemyIntent) {
        draft.detectedPatterns = detectPatterns(playerCoins);
        draft.combatPrediction = calculateCombatPrediction(player, enemy, selectedPatterns, enemyIntent, playerCoins);
    }
};

const _flipCoinAndUpdate = (draft: GameStore, index: number) => {
    if (draft.playerCoins[index] && !draft.playerCoins[index].locked) {
        draft.playerCoins[index].face = draft.playerCoins[index].face === CF.HEADS ? CF.TAILS : CF.HEADS;
    }
    draft.selectedPatterns = [];
    draft.usedCoinIndices = [];
    _updatePatternsAndPrediction(draft);
};

const _flipAllCoinsAndUpdate = (draft: GameStore) => {
    if (!draft.player) return;
    const headsChance = (draft.player.temporaryEffects?.headsChanceUp?.value || 0) + 0.5;

    draft.playerCoins.forEach((coin, index) => {
        if (!coin.locked) {
            draft.playerCoins[index].face = flipCoin(headsChance);
        }
    });

    if (draft.player.temporaryEffects?.firstCoinHeads && !draft.playerCoins[0].locked) {
        draft.playerCoins[0].face = CF.HEADS;
    }

    draft.selectedPatterns = [];
    draft.usedCoinIndices = [];
    _updatePatternsAndPrediction(draft);
};


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
  swapState: { phase: 'idle', reserveCoinIndex: null, revealedFace: null },
  activeSkillState: { phase: 'idle', selection: [] },
  addLog: (message, type) => {
      set(produce(state => {
          state.combatLog.push({ id: Date.now() + Math.random(), turn: state.combatTurn, message, type });
      }));
  },
  flipCoin: (index) => {
    set(produce((draft: GameStore) => {
        if (draft.playerCoins[index] && !draft.playerCoins[index].locked) {
            _flipCoinAndUpdate(draft, index);
        }
    }));
  },
  flipAllCoins: () => {
    set(produce((draft: GameStore) => {
        _flipAllCoinsAndUpdate(draft);
    }));
  },
  togglePattern: (type, face) => {
    set(produce((draft: GameStore) => {
      const { selectedPatterns, detectedPatterns, player, enemy, playerCoins, enemyIntent } = draft;
      
      const selectedInstances = selectedPatterns.filter(p => p.type === type && p.face === face);
      const numSelected = selectedInstances.length;
      
      const currentlyUsedIndices = Array.from(new Set(selectedPatterns.flatMap(p => p.indices)));
      const availableInstance = detectedPatterns.find(p =>
        p.type === type && 
        p.face === face && 
        !selectedPatterns.some(sp => sp.id === p.id) &&
        !p.indices.some(i => currentlyUsedIndices.includes(i))
      );

      if (numSelected < 2 && availableInstance) {
        draft.selectedPatterns.push(availableInstance);
      } else {
        draft.selectedPatterns = selectedPatterns.filter(p => !(p.type === type && p.face === face));
      }
      
      draft.usedCoinIndices = Array.from(new Set(draft.selectedPatterns.flatMap(p => p.indices)));
      if (player && enemy && enemyIntent) {
          draft.combatPrediction = calculateCombatPrediction(player, enemy, draft.selectedPatterns, enemyIntent, playerCoins);
      }
    }));
  },
  initiateSwap: (reserveCoinIndex) => {
    set(produce((draft: GameStore) => {
        const reserveCoin = draft.reserveCoins[reserveCoinIndex];
        if (!reserveCoin) return;
        
        const revealedFace = flipCoin(); // The coin is flipped here.
        
        draft.swapState = {
            phase: 'revealed',
            reserveCoinIndex,
            revealedFace
        };
    }));
  },
  cancelSwap: () => {
    set({ swapState: { phase: 'idle', reserveCoinIndex: null, revealedFace: null } });
  },
  completeSwap: (activeCoinIndex) => {
    set(produce((draft: GameStore) => {
        const { phase, reserveCoinIndex, revealedFace } = draft.swapState;
        if (phase !== 'revealed' || reserveCoinIndex === null || !revealedFace || !draft.reserveCoins[reserveCoinIndex] || !draft.playerCoins[activeCoinIndex]) {
            draft.swapState = { phase: 'idle', reserveCoinIndex: null, revealedFace: null };
            return;
        }

        // Create a new coin object for the swap
        const newCoinForPlayer: Coin = { 
            face: revealedFace, 
            locked: false, 
            id: draft.playerCoins[activeCoinIndex].id // re-use id to avoid React key issues
        };
        draft.playerCoins[activeCoinIndex] = newCoinForPlayer;
        
        draft.reserveCoins.splice(reserveCoinIndex, 1);

        draft.swapState = { phase: 'idle', reserveCoinIndex: null, revealedFace: null };
        draft.selectedPatterns = [];
        draft.usedCoinIndices = [];

        _updatePatternsAndPrediction(draft);
    }));
  },
  useActiveSkill: () => {
    set(produce((draft: GameStore) => {
        const { player } = draft;
        if (!player || player.activeSkillCooldown > 0) return;

        const skill = characterActiveSkills[player.class];
        
        draft.combatLog.push({ id: Date.now() + Math.random(), turn: draft.combatTurn, message: `[${skill.name}] 사용!`, type: 'player' });
        
        if (player.class === CharacterClass.WARRIOR) {
            _flipAllCoinsAndUpdate(draft);
            player.activeSkillCooldown = skill.cooldown;
        } else {
            switch (player.class) {
                case CharacterClass.ROGUE:
                    draft.activeSkillState = { phase: 'rogue_flip', selection: [] };
                    break;
                case CharacterClass.TANK:
                    draft.activeSkillState = { phase: 'tank_swap_1', selection: [] };
                    break;
                case CharacterClass.MAGE:
                    draft.activeSkillState = { phase: 'mage_lock', selection: [] };
                    break;
            }
        }
    }));
  },
  handleActiveSkillCoinClick: (index: number) => {
      set(produce((draft: GameStore) => {
          const { player, activeSkillState } = draft;
          if (!player) return;

          const skill = characterActiveSkills[player.class];

          switch (activeSkillState.phase) {
              case 'rogue_flip': {
                  if (draft.playerCoins[index] && !draft.playerCoins[index].locked) {
                      draft.playerCoins[index].face = draft.playerCoins[index].face === CF.HEADS ? CF.TAILS : CF.HEADS;
                  }
                  
                  draft.detectedPatterns = detectPatterns(draft.playerCoins);

                  const validSelectedPatterns = draft.selectedPatterns.filter(sp => 
                      draft.detectedPatterns.some(dp => dp.id === sp.id)
                  );

                  draft.selectedPatterns = validSelectedPatterns;
                  draft.usedCoinIndices = Array.from(new Set(draft.selectedPatterns.flatMap(p => p.indices)));

                  // FIX: Removed re-declaration of 'player' to avoid shadowing and "used before declaration" error.
                  const { enemy, enemyIntent, playerCoins } = draft;
                  if (player && enemy && enemyIntent) {
                      draft.combatPrediction = calculateCombatPrediction(player, enemy, draft.selectedPatterns, enemyIntent, playerCoins);
                  }

                  player.activeSkillCooldown = skill.cooldown;
                  draft.activeSkillState = { phase: 'idle', selection: [] };
                  break;
              }
              case 'tank_swap_1':
                  activeSkillState.selection.push(index);
                  activeSkillState.phase = 'tank_swap_2';
                  break;
              case 'tank_swap_2': {
                  if (activeSkillState.selection[0] !== index) {
                      const firstIndex = activeSkillState.selection[0];
                      const secondIndex = index;
                      const tempCoin = draft.playerCoins[firstIndex];
                      draft.playerCoins[firstIndex] = draft.playerCoins[secondIndex];
                      draft.playerCoins[secondIndex] = tempCoin;

                      player.activeSkillCooldown = skill.cooldown;
                      draft.activeSkillState = { phase: 'idle', selection: [] };
                      
                      draft.detectedPatterns = detectPatterns(draft.playerCoins);
                      const validSelectedPatterns = draft.selectedPatterns.filter(sp => 
                          draft.detectedPatterns.some(dp => dp.id === sp.id)
                      );
                      draft.selectedPatterns = validSelectedPatterns;
                      draft.usedCoinIndices = Array.from(new Set(draft.selectedPatterns.flatMap(p => p.indices)));
                      
                      // FIX: Removed re-declaration of 'player' to avoid shadowing and "used before declaration" error.
                      const { enemy, enemyIntent, playerCoins } = draft;
                      if (player && enemy && enemyIntent) {
                          draft.combatPrediction = calculateCombatPrediction(player, enemy, draft.selectedPatterns, enemyIntent, playerCoins);
                      }
                  }
                  break;
              }
              case 'mage_lock':
                  draft.playerCoins[index].locked = true;
                  player.activeSkillCooldown = skill.cooldown;
                  draft.activeSkillState = { phase: 'idle', selection: [] };
                  break;
          }
      }));
  },
  cancelActiveSkill: () => {
      set({ activeSkillState: { phase: 'idle', selection: [] } });
  },
  executeTurn: () => {
    const { selectedPatterns, player, enemy } = get();
    if (selectedPatterns.length === 0 || !player || !enemy) return;

    set(produce((draft: GameStore) => {
      // 1. Setup
      if(draft.player) {
          if (draft.player.activeSkillCooldown > 0) draft.player.activeSkillCooldown--;
      }
      draft.combatTurn += 1;
      let effects: EffectPayload[] = [];
      const log = (message: string, type: CombatLogMessage['type']) => {
        draft.combatLog.push({ id: Date.now() + Math.random(), turn: draft.combatTurn, message, type });
      };
      log(`--- ${draft.combatTurn}턴 ---`, 'system');

      const isCombatOver = () => !draft.player || draft.player.currentHp <= 0 || !draft.enemy || draft.enemy.currentHp <= 0;

      // 2. Start of Turn Phase
      if (draft.player && draft.enemy) {
        effects.push(...processStartOfTurn(draft.player, draft.enemy, log, draft));
      }
      if (!isCombatOver() && draft.player && draft.enemy) {
        effects.push(...processStartOfTurn(draft.enemy, draft.player, log, draft));
      }

      // 3. Action Phase
      if (!isCombatOver()) {
          effects.push(...applyPassives(draft, 'PLAYER_TURN_START', log));
          effects.push(...resolvePlayerActions(draft, log));
          if (draft.enemy && draft.enemy.currentHp > 0) {
              effects.push(...resolveEnemyActions(draft, log));
          }
      }

      // 4. End of Turn Phase
      if (!isCombatOver()) {
          effects.push(...processEndOfTurn(draft, log));
      }

      // 5. Resolution Phase
      const playerIsDead = !draft.player || draft.player.currentHp <= 0;
      const enemyIsDead = !draft.enemy || draft.enemy.currentHp <= 0;

      if (enemyIsDead) {
        log(`${draft.enemy!.name}을(를) 처치했습니다!`, 'system');
        
        const isMiniboss = draft.enemy!.tier === 'miniboss';
        if (isMiniboss && draft.reserveCoins.length < 3) {
            draft.reserveCoins.push({ face: null, locked: false, id: Date.now() + Math.random() });
            log('중간 보스를 처치하고 예비 동전을 획득했습니다!', 'system');
        }

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
            draft.currentTurn += 1;
            draft.gameState = GameState.EXPLORATION;
            if (draft.player) {
              draft.player.temporaryDefense = 0;
              draft.player.statusEffects = {};
              draft.player.temporaryEffects = {};
            }
            
            draft.currentEvent = null;
            draft.eventPhase = 'choice';
            draft.enemy = null;
            draft.combatLog = [];
            draft.playerCoins = [];
            draft.selectedPatterns = [];
        }

      } else if (playerIsDead) {
        log(`플레이어가 쓰러졌습니다...`, 'system');
        
        draft.metaProgress.totalRuns += 1;
        if (draft.currentStage > draft.metaProgress.highestStage) {
            draft.metaProgress.highestStage = draft.currentStage;
        }
        
        draft.gameState = GameState.GAME_OVER;
      } else {
        // --- Combat Continues: Setup next turn ---
        setupNextTurn(draft);
        
        const headsChance = (draft.player!.temporaryEffects?.headsChanceUp?.value || 0) + 0.5;
        
        draft.playerCoins.forEach((coin, index) => {
            if (coin.locked) {
                draft.playerCoins[index].locked = false; // Unlock for next turn
            } else {
                draft.playerCoins[index].face = flipCoin(headsChance);
            }
        });
        
        if (draft.player!.temporaryEffects?.firstCoinHeads && !draft.playerCoins[0].locked) {
            draft.playerCoins[0].face = CF.HEADS;
        }
        draft.selectedPatterns = [];
        draft.usedCoinIndices = [];
        
        draft.detectedPatterns = detectPatterns(draft.playerCoins);
        draft.combatPrediction = calculateCombatPrediction(draft.player!, draft.enemy!, draft.selectedPatterns, draft.enemyIntent!, draft.playerCoins);
      }

      // 6. Dispatch all collected effects to the UI
      effects.forEach(effect => {
        draft.combatEffects.push({ ...effect, id: Date.now() + Math.random() });
        if (effect.type === 'damage' && effect.data.amount > 0) {
            if (effect.target === 'player') draft.playerHit = (draft.playerHit || 0) + 1;
            else draft.enemyHit = (draft.enemyHit || 0) + 1;
        }
      });
    }));
  },
});