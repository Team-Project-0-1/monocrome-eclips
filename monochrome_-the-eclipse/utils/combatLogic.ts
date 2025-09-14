import {
  PlayerCharacter,
  EnemyCharacter,
  DetectedPattern,
  EnemyIntent,
  CombatPrediction,
  Coin,
  CombatLogMessage,
  PatternType,
  StatusEffectType,
  CoinFace,
  AbilityEffect,
  MonsterPatternDefinition,
  CharacterClass,
} from '../types';
import { monsterData, monsterPatterns } from '../dataMonsters';
import { characterData } from '../dataCharacters';
import { patternUpgrades } from '../dataUpgrades';
import { getPlayerAbility } from '../dataSkills';
import { detectPatterns, generateCoins } from './gameLogic';
import { EffectPayload } from '../store/slices/uiSlice';

// --- TYPE DEFINITIONS ---
type GameStoreDraft = {
    player: PlayerCharacter | null;
    enemy: EnemyCharacter | null;
    unlockedPatterns: string[];
    playerCoins: Coin[];
    selectedPatterns: DetectedPattern[];
    enemyIntent: EnemyIntent | null;
    combatLog: CombatLogMessage[];
    combatTurn: number;
};
type LogFn = (message: string, type: CombatLogMessage['type']) => void;
type Character = PlayerCharacter | EnemyCharacter;


// --- HELPER FUNCTIONS ---

const applyAndLogStatus = (target: Character, type: StatusEffectType, value: number, log: LogFn): EffectPayload[] => {
    if (value === 0) return [];
    const effectName = type;
    const prevValue = target.statusEffects[type] || 0;
    target.statusEffects[type] = Math.max(0, prevValue + value);
    const action = value > 0 ? "부여" : "감소";
    if (target.statusEffects[type] !== prevValue) {
      log(`${target.name}에게 ${effectName} ${Math.abs(value)} ${action}. (총: ${target.statusEffects[type]})`, 'status');
    }

    const targetType = 'class' in target ? 'player' : 'enemy';
    let effects: EffectPayload[] = [{
        type: 'status',
        target: targetType,
        data: { statusType: type, value: value }
    }];
    return effects;
};

const applyHeal = (target: Character, amount: number, log: LogFn): EffectPayload[] => {
    if (amount <= 0) return [];
    const prevHp = target.currentHp;
    target.currentHp = Math.min(target.maxHp, target.currentHp + amount);
    const healed = target.currentHp - prevHp;
    if (healed > 0) {
        log(`${target.name}(이)가 체력을 ${healed} 회복합니다.`, 'heal');
        const targetType = 'class' in target ? 'player' : 'enemy';
        return [{ type: 'heal', target: targetType, data: { amount: healed } }];
    }
    return [];
}

const applyDamage = (caster: Character, target: Character, damage: number, log: LogFn, state: GameStoreDraft, options: { isFixed?: boolean, ignoreDefense?: boolean, isCounterAttack?: boolean, isBleed?: boolean, isCurse?: boolean, isPursuit?: boolean } = {}): { damageDealt: number, effects: EffectPayload[] } => {
    if (damage <= 0) return { damageDealt: 0, effects: [] };
    
    let totalDamage = damage;
    let allEffects: EffectPayload[] = [];
    
    // 1. Caster's attack modifiers
    if (!options.isFixed) {
      const amp = caster.statusEffects.AMPLIFY || 0;
      const ampBonus = Math.floor(amp / 2);
      if (ampBonus > 0) {
          totalDamage += ampBonus;
          log(`${caster.name}의 증폭 효과로 피해량이 ${ampBonus} 증가!`, 'status');
      }
      
      const sealStacks = caster.statusEffects.SEAL || 0;
      if (sealStacks > 0) {
          const reduction = Math.floor(totalDamage * (sealStacks * 0.15));
          totalDamage = Math.max(0, totalDamage - reduction);
          log(`${caster.name}의 봉인 효과로 피해량이 ${reduction} 감소!`, 'status');
      }
    }
    
    if (options.isPursuit && 'class' in caster && caster.temporaryEffects?.doublePursuitDamageAndModifiedLoss) {
        totalDamage *= 2;
    }

    // 2. Target's defense modifiers
    let targetDefense = options.ignoreDefense ? 0 : target.temporaryDefense;
    const shatterStacks = target.statusEffects.SHATTER || 0;
    if (shatterStacks > 0) {
        const reduction = Math.floor(targetDefense * (shatterStacks * 0.15));
        targetDefense = Math.max(0, targetDefense - reduction);
        log(`${target.name}의 분쇄 효과로 방어력이 ${reduction} 감소!`, 'status');
    }

    const finalDamage = Math.max(0, totalDamage - targetDefense);
    
    const prevHp = target.currentHp;
    target.currentHp = Math.max(0, target.currentHp - finalDamage);
    const actualDamage = prevHp - target.currentHp;
    
    if (caster.temporaryEffects) {
        caster.temporaryEffects.damageDealtThisTurn = (caster.temporaryEffects.damageDealtThisTurn || 0) + actualDamage;
    }

    if (actualDamage > 0) {
        if (target.temporaryEffects) {
            target.temporaryEffects.damageTakenThisTurn = (target.temporaryEffects.damageTakenThisTurn || 0) + actualDamage;
        }

        const targetType = 'class' in target ? 'player' : 'enemy';
        allEffects.push({ type: 'damage', target: targetType, data: { amount: actualDamage } });
        log(`${caster.name}(이)가 ${target.name}에게 ${actualDamage} 피해. (${totalDamage} - ${targetDefense})`, 'damage');
        
        // 3. On Damage Taken effects
        
        const bleedStacks = target.statusEffects[StatusEffectType.BLEED] || 0;
        if (bleedStacks > 0) {
            let bleedDamage = Math.floor(target.maxHp * 0.05);
            
            const bleedHits = (state.player && state.unlockedPatterns.includes('ROGUE_P_WOUND_TEAR')) ? 2 : 1;

            for (let i = 0; i < bleedHits; i++) {
                if (bleedDamage > 0) {
                    const { damageDealt, effects } = applyDamage(target, target, bleedDamage, log, state, { isFixed: true, ignoreDefense: true, isBleed: true });
                    if(damageDealt > 0) {
                         log(`[출혈] ${target.name}(이)가 ${damageDealt} 피해를 입었다!`, 'damage');
                         allEffects.push(...effects);
                         if (state.player && state.unlockedPatterns.includes('ROGUE_P_LIFE_STEAL')) {
                             allEffects.push(...applyHeal(state.player, Math.floor(damageDealt * 0.1), log));
                         }
                    }
                }
            }
            allEffects.push(...applyAndLogStatus(target, StatusEffectType.BLEED, -1, log));
        }

        const counterStacks = target.statusEffects[StatusEffectType.COUNTER] || 0;
        if (counterStacks > 0 && !options.isCounterAttack) {
            const counterDamage = counterStacks;
            log(`[반격] ${target.name}이(가) ${caster.name}에게 ${counterDamage} 피해를 돌려줍니다!`, 'player');
            const counterResult = applyDamage(target, caster, counterDamage, log, state, { isFixed: true, isCounterAttack: true });
            allEffects.push(...counterResult.effects);
            allEffects.push(...applyAndLogStatus(target, StatusEffectType.COUNTER, -counterStacks, log));
        }
        
        allEffects.push(...applyPassives(state, 'ON_DAMAGE_TAKEN', log, { character: target, damage: actualDamage, caster, ignoreDefense: options.ignoreDefense }));
    }

    return { damageDealt: actualDamage, effects: allEffects };
};

const applyAbilityEffect = (caster: Character, target: Character, effect: AbilityEffect, state: GameStoreDraft, log: LogFn): EffectPayload[] => {
    if (!effect || typeof effect !== 'object') return [];
    let allEffects: EffectPayload[] = [];
    const casterType = 'class' in caster ? 'player' : 'enemy';

    // Status Costs & Drains
    if (effect.statusCost) {
        allEffects.push(...applyAndLogStatus(caster, effect.statusCost.type, -effect.statusCost.value, log));
    }
    if (effect.enemyStatusDrain) {
        allEffects.push(...applyAndLogStatus(target, effect.enemyStatusDrain.type, -effect.enemyStatusDrain.value, log));
    }
    if (effect.statusDrain) {
        allEffects.push(...applyAndLogStatus(caster, effect.statusDrain.type, -effect.statusDrain.value, log));
    }

    // Defense and Heal
    let defenseGain = 0;
    if (typeof effect.defense === 'number') defenseGain += effect.defense;
    if (typeof effect.bonusDefense === 'number') defenseGain += effect.bonusDefense;

    if (defenseGain > 0) {
        caster.temporaryDefense += defenseGain;
        log(`${caster.name}(이)가 방어 ${defenseGain}를 얻습니다.`, 'defense');
        allEffects.push({ type: 'defense', target: casterType, data: { amount: defenseGain } });
    }
    if (typeof effect.heal === 'number' && effect.heal > 0) {
        allEffects.push(...applyHeal(caster, effect.heal, log));
    }
    
    // Status Effects
    if (effect.status) {
        const statuses = Array.isArray(effect.status) ? effect.status : [effect.status];
        statuses.forEach((s) => {
            const finalTarget = s.target === 'enemy' ? target : caster;
            allEffects.push(...applyAndLogStatus(finalTarget, s.type, s.value, log));
        });
    }

    // Temporary Effects
    if (effect.temporaryEffect) handleTemporaryEffect(caster, casterType, effect.temporaryEffect, allEffects);
    if (effect.enemyTemporaryEffect) handleTemporaryEffect(target, 'class' in target ? 'player' : 'enemy', effect.enemyTemporaryEffect, allEffects);
    
    if (effect.gainMaxAmplify === true) {
       allEffects.push(...applyAndLogStatus(caster, StatusEffectType.AMPLIFY, 10, log));
    }
    
    // Damage
    let damagePayload = 0;
    if (typeof effect.fixedDamage === 'number') damagePayload += effect.fixedDamage;
    if (effect.bonusDamage) {
        damagePayload += effect.bonusDamage;
    }

    if (effect.damageMultiplier) {
        damagePayload *= effect.damageMultiplier;
    }

    if (damagePayload > 0) {
        const { effects } = applyDamage(caster, target, damagePayload, log, state);
        allEffects.push(...effects);
    }
    if (effect.multiHit) {
        for (let i = 0; i < effect.multiHit.count; i++) {
            const { effects } = applyDamage(caster, target, effect.multiHit.damage, log, state);
            allEffects.push(...effects);
        }
    }
    return allEffects;
};

const handleTemporaryEffect = (char: Character, charType: 'player' | 'enemy', te: any, allEffects: EffectPayload[]) => {
    char.temporaryEffects = char.temporaryEffects || {};
    if (te.accumulative && char.temporaryEffects[te.name]) {
        char.temporaryEffects[te.name].value = (char.temporaryEffects[te.name].value || 0) + te.value;
        char.temporaryEffects[te.name].duration = Math.max(char.temporaryEffects[te.name].duration || 0, te.duration);
    } else {
        char.temporaryEffects[te.name] = { ...te };
    }

    if ((te.name === 'bonusAtk' || te.name === 'bonusDef') && typeof te.value === 'number' && te.value !== 0) {
        allEffects.push({
            type: 'temp_stat',
            target: charType,
            data: { stat: te.name === 'bonusAtk' ? 'attack' : 'defense', value: te.value, duration: te.duration - 1 },
        });
    }
};

// --- PASSIVE APPLICATION LOGIC ---
export const applyInnatePassives = (state: GameStoreDraft, log: LogFn): EffectPayload[] => {
    const { player, enemy } = state;
    if (!player || !enemy) return [];
    let allEffects: EffectPayload[] = [];
    player.temporaryEffects = player.temporaryEffects || {};

    switch (player.class) {
        case CharacterClass.WARRIOR:
            allEffects.push(...applyAndLogStatus(player, StatusEffectType.AMPLIFY, 2, log));
            break;
        case CharacterClass.ROGUE:
            player.temporaryEffects.firstCoinHeads = { duration: 2 };
            break;
        case CharacterClass.TANK:
            player.temporaryEffects.bonusAtk = { value: 3, duration: 999 };
            player.temporaryEffects.bonusDef = { value: 3, duration: 999 };
            log(`${player.name}이(가) 전투 태세에 돌입하여 공격과 방어를 3 얻습니다.`, 'status');
            break;
        case CharacterClass.MAGE:
            player.temporaryEffects.debuffAccumulator = { damage: 0, turns: 0 };
            log(`${player.name}이(가) 5턴간 디버프 피해를 저장합니다.`, 'status');
            break;
    }
    return allEffects;
};

export const applyPassives = (
  state: GameStoreDraft,
  trigger: 'PLAYER_TURN_START' | 'ON_DAMAGE_TAKEN' | 'ENEMY_TURN_START' | 'END_OF_TURN' | 'ON_ATTACK',
  log: LogFn,
  payload?: any
): EffectPayload[] => {
    const { player, unlockedPatterns, playerCoins, enemy } = state;
    if (!player || !enemy) return [];
    
    let allEffects: EffectPayload[] = [];

    if (trigger === 'PLAYER_TURN_START') {
        unlockedPatterns.forEach(id => {
            switch (id) {
                case 'ROGUE_P_GUN_KATA':
                    const headsCount = playerCoins.filter(c => c.face === CoinFace.HEADS).length;
                    if (headsCount > 0) allEffects.push(...applyAndLogStatus(player, StatusEffectType.PURSUIT, headsCount, log));
                    break;
            }
        });
    }

    if (trigger === 'ON_DAMAGE_TAKEN' && payload.character === player) {
        unlockedPatterns.forEach(id => {
            if (id === 'ROGUE_P_KILLER_MINDSET') {
                allEffects.push(...applyAndLogStatus(player, StatusEffectType.PURSUIT, 2, log));
            }
        });
    }
    
    if (trigger === 'END_OF_TURN' && payload.character === player) {
        unlockedPatterns.forEach(id => {
             if (id === 'TANK_P_KEEP_DEF') {
                player.temporaryDefense += payload.defense;
             }
        });
    }

    return allEffects;
};

// --- CORE ACTION RESOLUTION ---
export const resolvePlayerActions = (state: GameStoreDraft, log: LogFn): EffectPayload[] => {
    const { player, enemy, selectedPatterns, playerCoins } = state;
    if (!player || !enemy) return [];
    let allEffects: EffectPayload[] = [];

    player.temporaryDefense += player.baseDef;

    for (const pattern of selectedPatterns) {
        const ability = getPlayerAbility(player.class, player.acquiredSkills, pattern.type, pattern.face);
        if (ability) {
            log(`${player.name}이(가) [${ability.name}] 사용!`, 'player');
            allEffects.push({ type: 'skill', target: 'player', data: { name: ability.name } });
            const effect = ability.effect(player, enemy, playerCoins, selectedPatterns);
            allEffects.push(...applyAbilityEffect(player, enemy, effect, state, log));
        }
    }
    return allEffects;
};

export const resolveEnemyActions = (state: GameStoreDraft, log: LogFn): EffectPayload[] => {
    const { player, enemy, enemyIntent } = state;
    if (!player || !enemy || !enemyIntent) return [];
    let allEffects: EffectPayload[] = [];
    
    enemy.temporaryDefense += enemy.baseDef;

    for (const key of enemyIntent.sourcePatternKeys) {
        const ability = monsterPatterns[key];
        if (ability) {
            log(`${enemy.name}이(가) [${ability.name}] 사용!`, 'enemy');
            allEffects.push({ type: 'skill', target: 'enemy', data: { name: ability.name } });
            const effect = ability.effect(enemy, player);
            allEffects.push(...applyAbilityEffect(enemy, player, effect, state, log));
        }
    }
    return allEffects;
};


// --- TURN PHASE MANAGEMENT ---
export const processStartOfTurn = (character: Character, opponent: Character, log: LogFn, state: GameStoreDraft): EffectPayload[] => {
    let allEffects: EffectPayload[] = [];
    const curse = character.statusEffects[StatusEffectType.CURSE] || 0;
    if (curse > 0) {
        if ('class' in character && character.temporaryEffects?.debuffAccumulator) {
            character.temporaryEffects.debuffAccumulator.damage += curse;
            log(`[저주] ${character.name} (은)는 피해 ${curse}를 저장했다.`, 'status');
        } else {
             const { effects } = applyDamage(character, character, curse, log, state, { isFixed: true, ignoreDefense: true, isCurse: true });
             allEffects.push(...effects);
        }
        allEffects.push(...applyAndLogStatus(character, StatusEffectType.CURSE, -1, log));
    }
    
    if ('class' in character && character.temporaryEffects?.debuffAccumulator) {
        const acc = character.temporaryEffects.debuffAccumulator;
        acc.turns++;
        if (acc.turns >= 5) {
            log(`[저장된 고통] ${character.name}이(가) 누적된 디버프 피해 ${acc.damage}를 받습니다!`, 'status');
            const { effects } = applyDamage(character, character, acc.damage, log, state, { isFixed: true, ignoreDefense: true, isCurse: true });
            allEffects.push(...effects);
            acc.damage = 0;
            acc.turns = 0;
        }
    }
    return allEffects;
};


const processCharacterEndOfTurn = (character: Character, opponent: Character, log: LogFn, state: GameStoreDraft): EffectPayload[] => {
    let allEffects: EffectPayload[] = [];
    let pursuit = character.statusEffects[StatusEffectType.PURSUIT] || 0;
    if (pursuit > 0) {
        const { effects } = applyDamage(character, opponent, pursuit, log, state, { isFixed: true, isPursuit: true });
        allEffects.push(...effects);
        let loss = 3;
        if ('class' in character && character.temporaryEffects?.doublePursuitDamageAndModifiedLoss) {
            loss = character.temporaryEffects.doublePursuitDamageAndModifiedLoss.value.loss;
        }
        character.statusEffects[StatusEffectType.PURSUIT] = Math.max(0, pursuit - loss);
    }
    
    if (character.temporaryEffects?.pursuitReload && 'class' in character) {
        if ((character.statusEffects.PURSUIT || 0) === 0) {
            const tailsCount = state.playerCoins.filter(c => c.face === CoinFace.TAILS).length;
            const pursuitGain = tailsCount * character.temporaryEffects.pursuitReload.value;
            if (pursuitGain > 0) {
                allEffects.push(...applyAndLogStatus(character, StatusEffectType.PURSUIT, pursuitGain, log));
            }
        }
    }

    if (character.temporaryEffects?.pursuitRefill && 'class' in character) {
        if ((character.statusEffects.PURSUIT || 0) <= 2) {
            const pursuitGain = character.temporaryEffects.pursuitRefill.value;
            if (pursuitGain > 0) {
                log(`[퀵 슬롯] 추적 수치가 낮아 재장전합니다!`, 'player');
                allEffects.push(...applyAndLogStatus(character, StatusEffectType.PURSUIT, pursuitGain, log));
            }
        }
    }

    if ((character.statusEffects[StatusEffectType.SHATTER] || 0) > 0) {
        allEffects.push(...applyAndLogStatus(character, StatusEffectType.SHATTER, -1, log));
    }
    if ((character.statusEffects[StatusEffectType.SEAL] || 0) > 0) {
        allEffects.push(...applyAndLogStatus(character, StatusEffectType.SEAL, -1, log));
    }

    if (character.temporaryEffects) {
        for (const key in character.temporaryEffects) {
            const effect = character.temporaryEffects[key];
            if (effect?.duration) {
                effect.duration -= 1;
                if (effect.duration <= 0) delete character.temporaryEffects[key];
            }
        }
    }
    return allEffects;
};

export const processEndOfTurn = (state: GameStoreDraft, log: LogFn): EffectPayload[] => {
    const { player, enemy } = state;
    if (!player || !enemy) return [];
    let allEffects: EffectPayload[] = [];
    
    const playerDefenseBefore = player.temporaryDefense;
    allEffects.push(...processCharacterEndOfTurn(player, enemy, log, state));
    allEffects.push(...applyPassives(state, 'END_OF_TURN', log, { character: player, defense: playerDefenseBefore }));

    allEffects.push(...processCharacterEndOfTurn(enemy, player, log, state));
    return allEffects;
};

export const setupNextTurn = (state: GameStoreDraft) => {
    const { player, enemy } = state;
    if (!player || !enemy) return;

    player.temporaryDefense = 0;
    enemy.temporaryDefense = 0;
    
    if (player.temporaryEffects) {
        player.temporaryEffects.damageDealtThisTurn = 0;
        player.temporaryEffects.damageTakenThisTurn = 0;
    }
    if (enemy.temporaryEffects) {
        enemy.temporaryEffects.damageDealtThisTurn = 0;
        enemy.temporaryEffects.damageTakenThisTurn = 0;
    }

    enemy.coins = generateCoins();

    if (enemy.temporaryEffects?.guaranteedFirstCoinHeads?.value) enemy.coins[0].face = CoinFace.HEADS;
    if (enemy.temporaryEffects?.guaranteedFirstCoinTails?.value) enemy.coins[0].face = CoinFace.TAILS;

    enemy.detectedPatterns = detectPatterns(enemy.coins);
    state.enemyIntent = determineEnemyIntent(enemy);
};


// --- PREDICTION LOGIC ---
export const determineEnemyIntent = (enemy: EnemyCharacter): EnemyIntent => {
  const allowedSkillKeys = monsterData[enemy.key]?.patterns || [];
  const availableDetectedPatterns = [...enemy.detectedPatterns].sort((a, b) => b.count - a.count);
  let bestMatch: { patternKey: string; skillDef: MonsterPatternDefinition; patternInstance: DetectedPattern; } | null = null;
  
  for (const detectedPattern of availableDetectedPatterns) {
    const matchingSkillKey = allowedSkillKeys.find(key => {
        const skillDef = monsterPatterns[key];
        return skillDef && skillDef.type === detectedPattern.type && (!skillDef.face || skillDef.face === detectedPattern.face);
    });

    if (matchingSkillKey) {
        bestMatch = { patternKey: matchingSkillKey, skillDef: monsterPatterns[matchingSkillKey], patternInstance: detectedPattern };
        break;
    }
  }

  if (!bestMatch) {
    return { description: '숨을 고른다', damage: 0, defense: 0, sourcePatternKeys: [], sourceCoinIndices: [] };
  }

  const { patternKey, skillDef, patternInstance } = bestMatch;
  const effect = skillDef.effect(enemy, { statusEffects: {} } as PlayerCharacter);
  
  let damage = (effect.fixedDamage || 0) + enemy.baseAtk;
  if(effect.multiHit) damage += effect.multiHit.count * effect.multiHit.damage;

  const amplifyBonus = Math.floor((enemy.statusEffects.AMPLIFY || 0) / 2);
  if (amplifyBonus > 0) damage += amplifyBonus;
  
  const defense = (effect.defense || 0) + enemy.baseDef;
  
  return {
    description: skillDef.name,
    damage: Math.round(damage),
    defense: Math.round(defense),
    sourcePatternKeys: [patternKey],
    sourceCoinIndices: patternInstance.indices,
  };
};

export const calculateCombatPrediction = (
  player: PlayerCharacter,
  enemy: EnemyCharacter,
  selectedPlayerPatterns: DetectedPattern[],
  enemyIntent: EnemyIntent,
  playerCoins: Coin[]
): CombatPrediction => {
  
  const tempPlayer = JSON.parse(JSON.stringify(player));
  const tempEnemy = JSON.parse(JSON.stringify(enemy));
  
  let playerAttack = 0;
  let playerDefense = tempPlayer.baseDef;
  
  selectedPlayerPatterns.forEach(p => {
    const ability = getPlayerAbility(player.class, player.acquiredSkills, p.type, p.face);
    if(ability && ability.effect) {
        const effect: AbilityEffect = ability.effect(tempPlayer, tempEnemy, playerCoins, selectedPlayerPatterns);
        if (typeof effect.fixedDamage === 'number') playerAttack += effect.fixedDamage;
        if(effect.multiHit) playerAttack += effect.multiHit.count * effect.multiHit.damage;
        if (typeof effect.defense === 'number') playerDefense += effect.defense;
    }
  });

  const amplifyBonus = Math.floor((tempPlayer.statusEffects.AMPLIFY || 0) / 2);
  if (amplifyBonus > 0 && playerAttack > 0) {
    playerAttack += amplifyBonus;
  }
  
  let predictedEnemyDefense = tempEnemy.baseDef + enemyIntent.defense;
  const shatterStacks = tempEnemy.statusEffects.SHATTER || 0;
  if(shatterStacks > 0) {
      predictedEnemyDefense = Math.max(0, predictedEnemyDefense - Math.floor(predictedEnemyDefense * (shatterStacks * 0.15)));
  }

  const damageToEnemy = Math.max(0, playerAttack - predictedEnemyDefense);
  const damageToPlayer = Math.max(0, enemyIntent.damage - playerDefense);

  return {
    player: {
      attack: { formula: `...`, total: playerAttack },
      defense: { formula: `${player.baseDef} + ...`, total: playerDefense },
    },
    enemy: {
      attack: { formula: `${enemy.baseAtk} + ...`, total: enemyIntent.damage },
      defense: { formula: `${enemy.baseDef} + ...`, total: enemyIntent.defense },
    },
    damageToPlayer,
    damageToEnemy,
    playerHp: player.currentHp,
    enemyHp: enemy.currentHp,
  };
};