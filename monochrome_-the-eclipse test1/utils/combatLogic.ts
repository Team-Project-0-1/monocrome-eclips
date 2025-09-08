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
} from '../types';
import { monsterData, monsterPatterns } from '../dataMonsters';
import { characterData } from '../dataCharacters';
import { patternUpgrades } from '../dataUpgrades';
import { getPlayerAbility } from '../dataSkills';
import { detectPatterns } from './gameLogic';

// --- TYPE DEFINITIONS ---
type GameStoreDraft = {
    player: PlayerCharacter | null;
    enemy: EnemyCharacter | null;
    unlockedPatterns: string[];
    playerCoins: Coin[];
    selectedPatterns: DetectedPattern[];
    enemyIntent: EnemyIntent | null;
    combatLog: CombatLogMessage[];
};
type LogFn = (message: string, type: CombatLogMessage['type']) => void;
type Character = PlayerCharacter | EnemyCharacter;


// --- HELPER FUNCTIONS ---

const applyAndLogStatus = (target: Character, type: StatusEffectType, value: number, log: LogFn) => {
    if (value === 0) return;
    const effectName = type;
    const prevValue = target.statusEffects[type] || 0;
    target.statusEffects[type] = Math.max(0, prevValue + value);
    const action = value > 0 ? "부여" : "감소";
    if (target.statusEffects[type] !== prevValue) {
      log(`${target.name}에게 ${effectName} ${Math.abs(value)} ${action}. (총: ${target.statusEffects[type]})`, 'status');
    }
};

const applyHeal = (target: Character, amount: number, log: LogFn) => {
    if (amount <= 0) return;
    const prevHp = target.currentHp;
    target.currentHp = Math.min(target.maxHp, target.currentHp + amount);
    const healed = target.currentHp - prevHp;
    if (healed > 0) {
        log(`${target.name}(이)가 체력을 ${healed} 회복합니다.`, 'heal');
    }
}

const applyDamage = (caster: Character, target: Character, damage: number, log: LogFn, state: GameStoreDraft, options: { isFixed?: boolean, ignoreDefense?: boolean } = {}) => {
    if (damage <= 0) return 0;
    
    let totalDamage = damage;
    if (!options.isFixed) {
      const amplify = caster.statusEffects.AMPLIFY || 0;
      if (amplify > 0) {
          totalDamage += amplify;
          log(`${caster.name}의 증폭 효과로 피해량이 ${amplify} 증가!`, 'status');
      }
    }

    const targetDefense = options.ignoreDefense ? 0 : target.temporaryDefense;
    const finalDamage = Math.max(0, totalDamage - targetDefense);
    
    const prevHp = target.currentHp;
    target.currentHp = Math.max(0, target.currentHp - finalDamage);
    const actualDamage = prevHp - target.currentHp;

    if (actualDamage > 0) {
        log(`${caster.name}(이)가 ${target.name}에게 ${actualDamage} 피해. (${totalDamage} - ${targetDefense})`, 'damage');
        applyPassives(state, 'ON_DAMAGE_TAKEN', log, { character: target, damage: actualDamage });
        if (caster.statusEffects[StatusEffectType.BLEED]) {
            applyAndLogStatus(caster, StatusEffectType.BLEED, -1, log);
        }
    }

    return actualDamage;
};

const applyAbilityEffect = (caster: Character, target: Character, effect: AbilityEffect, state: GameStoreDraft, log: LogFn) => {
    if (!effect || typeof effect !== 'object') return;

    // Status Costs & Drains
    if (effect.statusCost && typeof effect.statusCost === 'object' && effect.statusCost.type && typeof effect.statusCost.value === 'number') {
        applyAndLogStatus(caster, effect.statusCost.type, -effect.statusCost.value, log);
    }
    if (effect.enemyStatusDrain && typeof effect.enemyStatusDrain === 'object' && effect.enemyStatusDrain.type && typeof effect.enemyStatusDrain.value === 'number') {
         applyAndLogStatus(target, effect.enemyStatusDrain.type, -effect.enemyStatusDrain.value, log);
    }
    if (effect.statusDrain && typeof effect.statusDrain === 'object' && effect.statusDrain.type && typeof effect.statusDrain.value === 'number') {
        applyAndLogStatus(caster, effect.statusDrain.type, -effect.statusDrain.value, log);
    }

    // Defense and Heal
    if (typeof effect.defense === 'number' && effect.defense > 0) {
        caster.temporaryDefense += effect.defense;
        log(`${caster.name}(이)가 방어 ${effect.defense}를 얻습니다.`, 'defense');
    }
    if (typeof effect.bonusDefense === 'number' && effect.bonusDefense > 0) {
        caster.temporaryDefense += effect.bonusDefense;
        log(`${caster.name}(이)가 추가 방어 ${effect.bonusDefense}를 얻습니다.`, 'defense');
    }
    if (typeof effect.heal === 'number' && effect.heal > 0) {
        applyHeal(caster, effect.heal, log);
    }
    
    // Status Effects
    if (effect.status) {
        const statuses = Array.isArray(effect.status) ? effect.status : [effect.status];
        statuses.forEach((s) => {
            if (s && typeof s === 'object' && s.type && typeof s.value === 'number') {
                const finalTarget = (s.target === 'player' || (s.target === 'self' && 'class' in caster)) ? caster : target;
                applyAndLogStatus(finalTarget, s.type, s.value, log);
            }
        });
    }

    // Temporary Effects
    if (effect.temporaryEffect && typeof effect.temporaryEffect === 'object' && effect.temporaryEffect.name && typeof effect.temporaryEffect.duration === 'number') {
        caster.temporaryEffects = caster.temporaryEffects || {};
        const te = effect.temporaryEffect;
        caster.temporaryEffects[te.name] = { ...te };
    }
    if (effect.enemyTemporaryEffect && typeof effect.enemyTemporaryEffect === 'object' && effect.enemyTemporaryEffect.name && typeof effect.enemyTemporaryEffect.duration === 'number') {
        target.temporaryEffects = target.temporaryEffects || {};
        const te = effect.enemyTemporaryEffect;
        if (te.accumulative && target.temporaryEffects[te.name]) {
             target.temporaryEffects[te.name].value = (target.temporaryEffects[te.name].value || 0) + te.value;
             target.temporaryEffects[te.name].duration = Math.max(target.temporaryEffects[te.name].duration || 0, te.duration);
        } else {
             target.temporaryEffects[te.name] = { ...te };
        }
    }
    
    // Gain max amplify
    if (effect.gainMaxAmplify === true) {
       applyAndLogStatus(caster, StatusEffectType.AMPLIFY, 10, log);
    }
    
    // Handle legacy monster pursuit logic
    if (typeof effect.pursuitCost === 'number' && effect.pursuitCost > 0) {
        if (!('class' in caster) && typeof caster.pursuit === 'number') {
            caster.pursuit = Math.max(0, caster.pursuit - effect.pursuitCost);
            log(`${caster.name}가 추적 스택 ${effect.pursuitCost}를 소모합니다.`, 'status');
        }
    }
    if (typeof effect.addPursuit === 'number' && effect.addPursuit > 0) {
         if (!('class' in caster)) {
            caster.pursuit = (caster.pursuit || 0) + effect.addPursuit;
            log(`${caster.name}의 추적 스택이 ${effect.addPursuit} 증가합니다.`, 'status');
        }
    }

    // Damage
    let totalDamageDealt = 0;
    let damagePayload = 0;
    if (typeof effect.fixedDamage === 'number') damagePayload += effect.fixedDamage;
    if (effect.bonusDamage) { // legacy property
        const bonusDmg = (caster.statusEffects[effect.bonusDamage as any] || 0); // Temporary any cast for legacy property
        damagePayload += bonusDmg;
    }

    if (damagePayload > 0) {
        totalDamageDealt += applyDamage(caster, target, damagePayload, log, state, { isFixed: true });
    }
    if (effect.multiHit && typeof effect.multiHit === 'object' && typeof effect.multiHit.count === 'number' && typeof effect.multiHit.damage === 'number') {
        for (let i = 0; i < effect.multiHit.count; i++) {
            totalDamageDealt += applyDamage(caster, target, effect.multiHit.damage, log, state, { isFixed: true });
        }
    }

    // Consume Amplify after dealing damage
    if (totalDamageDealt > 0 && (caster.statusEffects.AMPLIFY || 0) > 0) {
        log(`${caster.name}의 증폭 효과가 소모되었습니다.`, 'status');
        caster.statusEffects.AMPLIFY = 0;
    }
};


// --- PASSIVE APPLICATION LOGIC ---
export const applyInnatePassives = (state: GameStoreDraft, log: LogFn) => {
    const { player, enemy } = state;
    if (!player || !enemy) return;

    // Player Innate Passives
    const playerDef = characterData[player.class];
    playerDef.innatePassives?.forEach(passiveText => {
        if (passiveText.includes("증폭을 2 얻습니다")) {
            applyAndLogStatus(player, StatusEffectType.AMPLIFY, 2, log);
        }
        if (passiveText.includes("첫번째 동전은 반드시 앞면")) {
            player.temporaryEffects = { ...player.temporaryEffects, firstCoinHeads: { duration: 2 } };
        }
    });

    // Enemy Innate Passives
    const enemyDef = monsterData[enemy.key];
    enemyDef.passives?.forEach(passiveKey => {
         // Handle passives that trigger on combat start
    });
};

export const applyPassives = (
  state: GameStoreDraft,
  trigger: 'PLAYER_TURN_START' | 'ON_DAMAGE_TAKEN' | 'ENEMY_TURN_START' | 'END_OF_TURN' | 'ON_ATTACK',
  log: LogFn,
  payload?: any
) => {
    const { player, enemy, unlockedPatterns, playerCoins } = state;
    if (!player || !enemy) return;
    
    const character = payload?.character || null;

    // --- PLAYER PASSIVES ---
    if (trigger === 'PLAYER_TURN_START') {
        unlockedPatterns.forEach(id => {
            const upgrade = patternUpgrades[player.class]?.[id];
            if (!upgrade) return;

            switch (upgrade.id) {
                case 'WARRIOR_PASSIVE_LOSE_HP_GAIN_AMP':
                    player.currentHp = Math.max(1, player.currentHp - 1);
                    applyAndLogStatus(player, StatusEffectType.AMPLIFY, 1, log);
                    log(`[패시브] ${upgrade.name}: 체력 -1, 증폭 +1`, 'status');
                    break;
                case 'WARRIOR_PASSIVE_LOW_HP_GAIN_AMP':
                    if (player.currentHp <= player.maxHp / 2) {
                        applyAndLogStatus(player, StatusEffectType.AMPLIFY, 3, log);
                        log(`[패시브] ${upgrade.name}: 체력이 절반 이하, 증폭 +3`, 'status');
                    }
                    break;
                case 'ROGUE_P_GUN_KATA':
                    const headsCount = playerCoins.filter(c => c.face === CoinFace.HEADS).length;
                    if (headsCount > 0) {
                        applyAndLogStatus(player, StatusEffectType.PURSUIT, headsCount, log);
                        log(`[패시브] ${upgrade.name}: 앞면 개수 ${headsCount}만큼 추적 획득`, 'status');
                    }
                    break;
            }
        });
    }

    if (trigger === 'ON_DAMAGE_TAKEN') {
        if (character === player) {
            unlockedPatterns.forEach(id => {
                 const upgrade = patternUpgrades[player.class]?.[id];
                 if (upgrade?.id === 'ROGUE_P_KILLER_MINDSET') {
                     applyAndLogStatus(player, StatusEffectType.PURSUIT, 2, log);
                     log(`[패시브] ${upgrade.name}: 피격 시 추적 +2`, 'status');
                 }
            });
        }
        if (character === enemy) {
            const enemyDef = monsterData[enemy.key];
            enemyDef.passives?.forEach(passiveKey => {
                if (passiveKey === 'onDamageTakenGainCounterOnce') {
                     if(!enemy.temporaryEffects?.onDamageTakenGainCounterOnceTriggered) {
                        applyAndLogStatus(enemy, StatusEffectType.COUNTER, 1, log);
                        enemy.temporaryEffects = { ...enemy.temporaryEffects, onDamageTakenGainCounterOnceTriggered: true };
                    }
                }
            });
        }
    }
};


// --- CORE ACTION RESOLUTION ---
export const resolvePlayerActions = (state: GameStoreDraft, log: LogFn) => {
    const { player, enemy, selectedPatterns, playerCoins } = state;
    if (!player || !enemy) return;

    player.temporaryDefense += player.baseDef;

    for (const pattern of selectedPatterns) {
        const ability = getPlayerAbility(player.class, player.acquiredSkills, pattern.type, pattern.face);
        if (ability) {
            log(`${player.name}이(가) [${ability.name}] 사용!`, 'player');
            const effect = ability.effect(player, enemy, playerCoins);
            applyAbilityEffect(player, enemy, effect, state, log);
        }
    }
};

export const resolveEnemyActions = (state: GameStoreDraft, log: LogFn) => {
    const { player, enemy, enemyIntent } = state;
    if (!player || !enemy || !enemyIntent) return;
    
    enemy.temporaryDefense += enemy.baseDef;

    for (const key of enemyIntent.sourcePatternKeys) {
        const ability = monsterPatterns[key];
        if (ability) {
            log(`${enemy.name}이(가) [${ability.name}] 사용!`, 'enemy');
            const effect = ability.effect(enemy, player);
            applyAbilityEffect(enemy, player, effect, state, log);
        }
    }
};


// --- TURN PHASE MANAGEMENT ---
const processCharacterEndOfTurn = (character: Character, opponent: Character, log: LogFn, state: GameStoreDraft) => {
    // Pursuit
    const pursuit = character.statusEffects[StatusEffectType.PURSUIT] || 0;
    if (pursuit > 0) {
        applyDamage(character, opponent, pursuit, log, state, { isFixed: true });
        character.statusEffects[StatusEffectType.PURSUIT] = Math.max(0, pursuit - 3);
    }

    // Resonance (on enemy)
    if ('class' in opponent && character.temporaryEffects?.resonance?.value > 0) {
        const res = character.temporaryEffects.resonance;
        if (res.duration <= 1) {
             applyDamage(character, opponent, res.value, log, state, { isFixed: true, ignoreDefense: true });
        }
    }

    // Curse
    const curse = character.statusEffects[StatusEffectType.CURSE] || 0;
    if (curse > 0) {
        character.currentHp = Math.max(0, character.currentHp - curse);
        log(`[저주] ${character.name} (은)는 ${curse} 피해를 입었다.`, 'status');
    }

    // Tick down temporary effects
    if (character.temporaryEffects) {
        for (const key in character.temporaryEffects) {
            const effect = character.temporaryEffects[key];
            if (effect && typeof effect === 'object' && 'duration' in effect) {
                effect.duration -= 1;
                if (effect.duration <= 0) {
                    delete character.temporaryEffects[key];
                }
            }
        }
    }
};

export const processEndOfTurn = (state: GameStoreDraft, log: LogFn) => {
    const { player, enemy } = state;
    if (!player || !enemy) return;
    processCharacterEndOfTurn(player, enemy, log, state);
    processCharacterEndOfTurn(enemy, player, log, state);
};

export const setupNextTurn = (state: GameStoreDraft) => {
    const { player, enemy } = state;
    if (!player || !enemy) return;

    player.temporaryDefense = 0;
    enemy.temporaryDefense = 0;

    enemy.detectedPatterns = detectPatterns(enemy.coins);
    state.enemyIntent = determineEnemyIntent(enemy);
};


// --- PREDICTION LOGIC ---
export const determineEnemyIntent = (enemy: EnemyCharacter): EnemyIntent => {
  const availablePatterns = [...enemy.detectedPatterns].sort((a, b) => b.count - a.count);
  let bestPattern: DetectedPattern | null = null;
  
  for(const p of availablePatterns) {
    const skillDef = Object.values(monsterPatterns).find((mp) => mp.type === p.type && (!mp.face || mp.face === p.face));
    if (skillDef) {
        bestPattern = p;
        break;
    }
  }

  if (!bestPattern) {
    return { description: '숨을 고른다', damage: 0, defense: 0, sourcePatternKeys: [] };
  }

  const skillDefKey = Object.keys(monsterPatterns).find(key => {
      const skill = monsterPatterns[key];
      return skill.type === bestPattern!.type && (!skill.face || skill.face === bestPattern!.face)
  });
  
  if (!skillDefKey) return { description: '알 수 없는 행동', damage: 0, defense: 0, sourcePatternKeys: [] };

  const skillDef = monsterPatterns[skillDefKey];
  const effect = skillDef.effect(enemy, { statusEffects: {} } as PlayerCharacter);
  
  let damage = (effect.fixedDamage || 0) + enemy.baseAtk;
  if(effect.multiHit) damage += effect.multiHit.count * effect.multiHit.damage;
  if(enemy.statusEffects.AMPLIFY && enemy.statusEffects.AMPLIFY > 0) damage += enemy.statusEffects.AMPLIFY;

  const defense = (effect.defense || 0) + enemy.baseDef;
  
  return {
    description: skillDef.name,
    damage: Math.round(damage),
    defense: Math.round(defense),
    sourcePatternKeys: [skillDefKey],
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
  
  let playerAttack = tempPlayer.baseAtk;
  let playerDefense = tempPlayer.baseDef;
  
  selectedPlayerPatterns.forEach(p => {
    const ability = getPlayerAbility(player.class, player.acquiredSkills, p.type, p.face);
    if(ability && ability.effect) {
        const effect: AbilityEffect = ability.effect(tempPlayer, tempEnemy, playerCoins);
        if (typeof effect.fixedDamage === 'number') playerAttack += effect.fixedDamage;
        if(effect.multiHit && typeof effect.multiHit.count === 'number' && typeof effect.multiHit.damage === 'number') {
            playerAttack += effect.multiHit.count * effect.multiHit.damage;
        }
        if (typeof effect.defense === 'number') playerDefense += effect.defense;
    }
  });

  if(tempPlayer.statusEffects.AMPLIFY && tempPlayer.statusEffects.AMPLIFY > 0 && playerAttack > tempPlayer.baseAtk) {
    playerAttack += tempPlayer.statusEffects.AMPLIFY;
  }

  const damageToEnemy = Math.max(0, playerAttack - (tempEnemy.baseDef + enemyIntent.defense));
  const damageToPlayer = Math.max(0, enemyIntent.damage - playerDefense);

  return {
    player: {
      attack: { formula: `${player.baseAtk} + ...`, total: playerAttack },
      defense: { formula: `${player.baseDef} + ...`, total: playerDefense },
    },
    enemy: {
      attack: { formula: `${enemy.baseAtk} + ...`, total: enemyIntent.damage },
      defense: { formula: `${enemy.baseDef} + ...`, total: enemyIntent.defense },
    },
    damageToPlayer,
    damageToEnemy,
  };
};
