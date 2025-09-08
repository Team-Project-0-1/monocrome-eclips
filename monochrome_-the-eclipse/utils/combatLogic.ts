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
} from '../types';
import { monsterData, monsterPatterns } from '../dataMonsters';
import { characterData } from '../dataCharacters';
import { patternUpgrades } from '../dataUpgrades';
import { getPlayerAbility } from '../dataSkills';
import { detectPatterns, generateCoins } from './gameLogic';

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

    // NEW: Frenzy trigger
    if (type === StatusEffectType.PURSUIT && 'class' in target && target.statusEffects[type]! >= 10) {
        const hasFrenzy = target.temporaryEffects?.frenzy;
        if (!hasFrenzy) {
            target.temporaryEffects = target.temporaryEffects || {};
            target.temporaryEffects.frenzy = { name: 'frenzy', value: true, duration: 4 }; // lasts for 3 turns
            log(`${target.name}의 추적이 10에 도달하여 광분 상태가 됩니다!`, 'status');
        }
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

const applyDamage = (caster: Character, target: Character, damage: number, log: LogFn, state: GameStoreDraft, options: { isFixed?: boolean, ignoreDefense?: boolean, isCounterAttack?: boolean } = {}) => {
    if (damage <= 0) return 0;
    
    let totalDamage = damage;
    
    // 1. Caster's attack modifiers
    if (!options.isFixed) {
      // Amplify (new logic: permanent bonus, not consumed)
      const amplifyBonus = Math.floor((caster.statusEffects.AMPLIFY || 0) / 2);
      if (amplifyBonus > 0) {
          totalDamage += amplifyBonus;
          log(`${caster.name}의 증폭 효과로 피해량이 ${amplifyBonus} 증가!`, 'status');
      }
      
      // Seal (new logic)
      const sealStacks = caster.statusEffects.SEAL || 0;
      if (sealStacks > 0) {
          const reduction = Math.floor(totalDamage * (sealStacks * 0.15));
          totalDamage = Math.max(0, totalDamage - reduction);
          log(`${caster.name}의 봉인 효과로 피해량이 ${reduction} 감소!`, 'status');
      }
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

    if (actualDamage > 0) {
        log(`${caster.name}(이)가 ${target.name}에게 ${actualDamage} 피해. (${totalDamage} - ${targetDefense})`, 'damage');
        
        // 3. On Damage Taken effects
        
        // Bleed (new logic)
        const bleedStacks = target.statusEffects[StatusEffectType.BLEED] || 0;
        if (bleedStacks > 0) {
            const bleedDamage = Math.floor(target.maxHp * 0.05);
            if (bleedDamage > 0) {
                const prevHpBleed = target.currentHp;
                target.currentHp = Math.max(0, target.currentHp - bleedDamage);
                const actualBleedDamage = prevHpBleed - target.currentHp;
                if (actualBleedDamage > 0) {
                    log(`[출혈] ${target.name}(이)가 ${actualBleedDamage} 피해를 입었다!`, 'damage');
                }
            }
            applyAndLogStatus(target, StatusEffectType.BLEED, -1, log);
        }

        // Counter (new logic)
        const counterStacks = target.statusEffects[StatusEffectType.COUNTER] || 0;
        if (counterStacks > 0 && !options.isCounterAttack) {
            const counterDamage = counterStacks * 2;
            log(`[반격] ${target.name}이(가) ${caster.name}에게 ${counterDamage} 피해를 돌려줍니다!`, 'player');
            applyDamage(target, caster, counterDamage, log, state, { isFixed: true, isCounterAttack: true });
            applyAndLogStatus(target, StatusEffectType.COUNTER, -1, log);
        }
        
        applyPassives(state, 'ON_DAMAGE_TAKEN', log, { character: target, damage: actualDamage });
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
                const isPlayerCasting = 'class' in caster;
                let finalTarget: Character;

                if (isPlayerCasting) {
                    // Player is casting. 'enemy' means the opponent. Everything else ('player', 'self', undefined) means self.
                    finalTarget = s.target === 'enemy' ? target : caster;
                } else {
                    // Enemy is casting. 'player' means the opponent. Everything else ('self', undefined) means self.
                    finalTarget = s.target === 'player' ? target : caster;
                }
                
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
    
    // Damage
    let damagePayload = 0;
    if (typeof effect.fixedDamage === 'number') damagePayload += effect.fixedDamage;
    if (effect.bonusDamage) { // legacy property
        const bonusDmg = (caster.statusEffects[effect.bonusDamage as any] || 0); // Temporary any cast for legacy property
        damagePayload += bonusDmg;
    }

    if (damagePayload > 0) {
        applyDamage(caster, target, damagePayload, log, state, { isFixed: false });
    }
    if (effect.multiHit && typeof effect.multiHit === 'object' && typeof effect.multiHit.count === 'number' && typeof effect.multiHit.damage === 'number') {
        for (let i = 0; i < effect.multiHit.count; i++) {
            applyDamage(caster, target, effect.multiHit.damage, log, state, { isFixed: false });
        }
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

    if (trigger === 'ENEMY_TURN_START') {
        const enemyDef = monsterData[enemy.key];
        enemyDef.passives?.forEach(passiveKey => {
            switch (passiveKey) {
                case 'PASSIVE_REAPER_FLOWING_DARKNESS':
                    if ((player.statusEffects[StatusEffectType.CURSE] || 0) <= 2) {
                        applyAndLogStatus(player, StatusEffectType.CURSE, 1, log);
                        log(`[흐르는 어둠] ${enemy.name}이(가) ${player.name}에게 저주를 부여합니다.`, 'status');
                    }
                    break;
                case 'PASSIVE_REAPER_AMBUSH':
                    if ((player.statusEffects[StatusEffectType.CURSE] || 0) >= 4) {
                        applyAndLogStatus(player, StatusEffectType.SEAL, 1, log);
                        log(`[기습] ${enemy.name}이(가) ${player.name}에게 봉인을 부여합니다.`, 'status');
                    }
                    break;
                case 'PASSIVE_REAPER_VITAL_STRIKE':
                    if ((player.statusEffects[StatusEffectType.CURSE] || 0) >= 6) {
                        applyAndLogStatus(player, StatusEffectType.BLEED, 1, log);
                        log(`[급소 긋기] ${enemy.name}이(가) ${player.name}에게 출혈을 부여합니다.`, 'status');
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
                if (passiveKey === 'PASSIVE_LEADER_HARD_SKIN') {
                     if(!enemy.temporaryEffects?.hardSkinTriggered) {
                        applyAndLogStatus(enemy, StatusEffectType.COUNTER, 5, log);
                        log(`[단단한 피부] ${enemy.name}이(가) 반격을 5 얻습니다!`, 'status');
                        enemy.temporaryEffects = { ...enemy.temporaryEffects, hardSkinTriggered: true };
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

    // Post-action passives
    if (enemy.key === 'marauder1') {
        const usedTailsSkill = enemyIntent.sourcePatternKeys.some(key => {
            const skill = monsterPatterns[key];
            return skill && skill.face === CoinFace.TAILS;
        });
        if (usedTailsSkill) {
            enemy.temporaryEffects = enemy.temporaryEffects || {};
            enemy.temporaryEffects.guaranteedFirstCoinHeads = { name: 'guaranteedFirstCoinHeads', value: true, duration: 2 };
            log(`[잔혹한 내면] ${enemy.name}이(가) 다음 턴을 준비합니다.`, 'status');
        }
    }
};


// --- TURN PHASE MANAGEMENT ---
export const processStartOfTurn = (character: Character, opponent: Character, log: LogFn, state: GameStoreDraft) => {
    // Curse
    const curse = character.statusEffects[StatusEffectType.CURSE] || 0;
    if (curse > 0) {
        character.currentHp = Math.max(0, character.currentHp - curse);
        log(`[저주] ${character.name} (은)는 ${curse} 피해를 입었다.`, 'status');
    }

    // Resonance (on character)
    if (character.temporaryEffects?.resonance?.value > 0) {
        const res = character.temporaryEffects.resonance;
        if (res.duration <= 1) { // It will be 1 at the start of the turn it should trigger
             applyDamage(character, opponent, res.value, log, state, { isFixed: true, ignoreDefense: true });
             delete character.temporaryEffects.resonance; // Consume it
        }
    }
    
    // Frenzy (player only)
    if ('class' in character && character.temporaryEffects?.frenzy) {
        const headsCount = state.playerCoins.filter(c => c.face === CoinFace.HEADS).length;
        if (headsCount > 0) {
            log(`[광분] ${character.name}이(가) ${headsCount}회 자동 공격합니다!`, 'player');
            for (let i = 0; i < headsCount; i++) {
                if (opponent.currentHp > 0) {
                    applyDamage(character, opponent, 2, log, state, { isFixed: true });
                }
            }
        }
    }

    // Enemy start-of-turn passives
    if (!('class' in character)) {
        applyPassives(state, 'ENEMY_TURN_START', log);
    }
};


const processCharacterEndOfTurn = (character: Character, opponent: Character, log: LogFn, state: GameStoreDraft) => {
    // Pursuit
    const pursuit = character.statusEffects[StatusEffectType.PURSUIT] || 0;
    if (pursuit > 0) {
        applyDamage(character, opponent, pursuit, log, state, { isFixed: true });
        character.statusEffects[StatusEffectType.PURSUIT] = Math.max(0, pursuit - 3);
    }

    // Status effect duration decrease
    if ((character.statusEffects[StatusEffectType.CURSE] || 0) > 0) {
        applyAndLogStatus(character, StatusEffectType.CURSE, -1, log);
    }
    if ((character.statusEffects[StatusEffectType.SHATTER] || 0) > 0) {
        applyAndLogStatus(character, StatusEffectType.SHATTER, -1, log);
    }
    if ((character.statusEffects[StatusEffectType.SEAL] || 0) > 0) {
        applyAndLogStatus(character, StatusEffectType.SEAL, -1, log);
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

    // Re-roll enemy coins for the new turn
    enemy.coins = generateCoins();

    // Handle enemy coin manipulation passives before re-detecting patterns
    if (enemy.key === 'marauder2') {
        const amplify = enemy.statusEffects.AMPLIFY || 0;
        const headsChance = amplify * 0.05;
        if (headsChance > 0) {
            enemy.coins.forEach(coin => {
                if (coin.face === CoinFace.TAILS && Math.random() < headsChance) {
                    coin.face = CoinFace.HEADS;
                }
            });
        }
    }

    if (enemy.temporaryEffects?.guaranteedFirstCoinHeads?.value) {
        enemy.coins[0].face = CoinFace.HEADS;
    }
    if (enemy.temporaryEffects?.guaranteedFirstCoinTails?.value) {
        enemy.coins[0].face = CoinFace.TAILS;
    }

    // Enemy coins are re-rolled, then manipulated by passives before patterns are detected
    enemy.detectedPatterns = detectPatterns(enemy.coins);
    state.enemyIntent = determineEnemyIntent(enemy);
};


// --- PREDICTION LOGIC ---
export const determineEnemyIntent = (enemy: EnemyCharacter): EnemyIntent => {
  // Get the list of skill keys allowed for this specific monster.
  const allowedSkillKeys = monsterData[enemy.key]?.patterns || [];
  
  // Get the monster's currently available patterns from its coins, sorted by priority.
  const availableDetectedPatterns = [...enemy.detectedPatterns].sort((a, b) => b.count - a.count);

  let bestMatch: { patternKey: string; skillDef: MonsterPatternDefinition } | null = null;
  
  // Find the best available skill from the allowed list that matches a detected pattern.
  for (const detectedPattern of availableDetectedPatterns) {
    // Search within the allowed skills for a match.
    const matchingSkillKey = allowedSkillKeys.find(key => {
        const skillDef = monsterPatterns[key];
        return skillDef && skillDef.type === detectedPattern.type && (!skillDef.face || skillDef.face === detectedPattern.face);
    });

    if (matchingSkillKey) {
        bestMatch = { patternKey: matchingSkillKey, skillDef: monsterPatterns[matchingSkillKey] };
        break; // Found the highest-priority match, so we can stop.
    }
  }

  if (!bestMatch) {
    return { description: '숨을 고른다', damage: 0, defense: 0, sourcePatternKeys: [] };
  }

  const { patternKey, skillDef } = bestMatch;
  const effect = skillDef.effect(enemy, { statusEffects: {} } as PlayerCharacter);
  
  let damage = (effect.fixedDamage || 0) + enemy.baseAtk;
  if(effect.multiHit) damage += effect.multiHit.count * effect.multiHit.damage;

  // Predict Amplify
  const amplifyBonus = Math.floor((enemy.statusEffects.AMPLIFY || 0) / 2);
  if (amplifyBonus > 0) {
      damage += amplifyBonus;
  }
  
  const defense = (effect.defense || 0) + enemy.baseDef;
  
  return {
    description: skillDef.name,
    damage: Math.round(damage),
    defense: Math.round(defense),
    sourcePatternKeys: [patternKey],
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
  
  let playerAttack = 0; // Base attack is handled by Amplify now
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
  };
};