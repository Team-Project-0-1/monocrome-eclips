import {
  MonsterData,
  PatternType,
  CoinFace,
  StatusEffectType,
  EnemyCharacter,
  PlayerCharacter,
  MonsterPatternDefinition,
  AbilityEffect,
} from "./types";

// --- MONSTER DEFINITIONS ---
// This data structure defines the core stats and available skills for each monster.
export const monsterData: MonsterData = {
    // Stage 1 Monsters
    marauder1: { 
        name: "약탈자1", // 도적형 (Rogue)
        hp: 30, 
        baseAtk: 0, 
        baseDef: 0, 
        patterns: ["MARAUDER1_PURSUE", "MARAUDER1_MANGLE", "MARAUDER1_SHARPEN"], 
        tier: "normal", 
        passives: ["PASSIVE_MARAUDER1_CRUEL_INTERIOR"] 
    },
    marauder2: { 
        name: "약탈자2", // 전사형 (Warrior)
        hp: 35, 
        baseAtk: 0, 
        baseDef: 0, 
        patterns: ["MARAUDER2_SWING", "MARAUDER2_JUGGERNAUT", "MARAUDER2_CHARGE"], 
        tier: "normal", 
        passives: ["PASSIVE_MARAUDER2_MUSCLE_GROWTH"] 
    },
    infectedDog: { 
        name: "감염된 들개", // 마법형 (Mage)
        hp: 24, 
        baseAtk: 0, 
        baseDef: 0, 
        patterns: ["INFECTEDDOG_BITE", "INFECTEDDOG_NECKBITE", "INFECTEDDOG_PUS"], 
        tier: "normal" 
    },
    // Stage 1 Miniboss
    marauderLeader: { 
        name: "약탈자 리더", // 방어형 (Tank)
        hp: 45, 
        baseAtk: 0, 
        baseDef: 0, 
        patterns: ["LEADER_QUESTION", "LEADER_DEMAND", "LEADER_WAIT", "LEADER_STAY"], 
        tier: "miniboss", 
        passives: ["PASSIVE_LEADER_HARD_SKIN"]
    },
    // Stage 1 Boss
    lumenReaper: { 
        name: "루멘 리퍼", // 마법형 (Mage)
        hp: 50, 
        baseAtk: 0, 
        baseDef: 0, 
        patterns: [
            "LUMENREAPER_EROSION_SCYTHE", 
            "LUMENREAPER_SHADOW_STRIKE", 
            "LUMENREAPER_NIGHT_PLUNDER", 
            "LUMENREAPER_STEALTH", 
            "LUMENREAPER_SHADOW_SHROUD"
        ], 
        tier: "boss", 
        passives: [
            "PASSIVE_REAPER_FLOWING_DARKNESS", 
            "PASSIVE_REAPER_AMBUSH", 
            "PASSIVE_REAPER_VITAL_STRIKE"
        ],
    },
};

// --- MONSTER SKILL IMPLEMENTATIONS ---
// This structure defines the logic and effects for each monster skill.
export const monsterPatterns: { [key: string]: MonsterPatternDefinition } = {
    // --- 약탈자1 (Marauder1) ---
    MARAUDER1_PURSUE: { 
        name: "추적", 
        type: PatternType.PAIR, 
        face: CoinFace.HEADS, 
        description: "피해를 4 줍니다. 추적을 1 얻습니다.", 
        effect: (): AbilityEffect => ({ fixedDamage: 4, status: { type: StatusEffectType.PURSUIT, value: 1, target: 'self' } }) 
    },
    MARAUDER1_MANGLE: { 
        name: "난도질", 
        type: PatternType.TRIPLE, 
        face: CoinFace.HEADS, 
        description: "피해를 5 줍니다. 추적을 3 소비할 경우 피해를 5 만큼 2 번 줍니다.", 
        effect: (a: EnemyCharacter): AbilityEffect => {
            if ((a.statusEffects[StatusEffectType.PURSUIT] || 0) >= 3) {
                return { multiHit: { count: 2, damage: 5 }, statusCost: { type: StatusEffectType.PURSUIT, value: 3 } };
            }
            return { fixedDamage: 5 };
        }
    },
    MARAUDER1_SHARPEN: { 
        name: "칼날 갈기", 
        type: PatternType.PAIR, 
        face: CoinFace.TAILS, 
        description: "방어를 4 얻습니다.", 
        effect: (): AbilityEffect => ({ defense: 4 }) 
    },
    
    // --- 약탈자2 (Marauder2) ---
    MARAUDER2_SWING: { 
        name: "망치 휘두르기", 
        type: PatternType.PAIR, 
        face: CoinFace.HEADS, 
        description: "피해를 4 줍니다. 증폭을 1 얻습니다.", 
        effect: (): AbilityEffect => ({ fixedDamage: 4, status: {type: StatusEffectType.AMPLIFY, value: 1, target: "self"} }) 
    },
    MARAUDER2_JUGGERNAUT: { 
        name: "파괴전차", 
        type: PatternType.PENTA, 
        face: CoinFace.HEADS, 
        description: "모든 증폭을 소모하여 잃은 증폭의 2배만큼 피해", 
        effect: (a: EnemyCharacter): AbilityEffect => {
            const ampToConsume = a.statusEffects[StatusEffectType.AMPLIFY] || 0;
            return { 
                fixedDamage: ampToConsume * 2, 
                statusCost: { type: StatusEffectType.AMPLIFY, value: ampToConsume } 
            };
        }
    },
    MARAUDER2_CHARGE: { 
        name: "힘 충전", 
        type: PatternType.PAIR, 
        face: CoinFace.TAILS, 
        description: "방어를 4 얻습니다. 증폭을 2 얻습니다.", 
        effect: (): AbilityEffect => ({ defense: 4, status: {type: StatusEffectType.AMPLIFY, value: 2, target: "self"} }) 
    },

    // --- 감염된 들개 (Infected Dog) ---
    INFECTEDDOG_BITE: { 
        name: "깨물기", 
        type: PatternType.PAIR, 
        face: CoinFace.HEADS, 
        description: "피해를 4 줍니다.", 
        effect: (): AbilityEffect => ({ fixedDamage: 4 }) 
    },
    INFECTEDDOG_NECKBITE: { 
        name: "목 물어뜯기", 
        type: PatternType.TRIPLE, 
        face: CoinFace.HEADS, 
        description: "피해를 6 줍니다. 저주를 2 부여합니다.", 
        effect: (): AbilityEffect => ({ fixedDamage: 6, status: {type: StatusEffectType.CURSE, value: 2, target: "enemy"} }) 
    },
    INFECTEDDOG_PUS: { 
        name: "차오르는 고름", 
        type: PatternType.PAIR, 
        face: CoinFace.TAILS, 
        description: "방어를 3 얻습니다.", 
        effect: (): AbilityEffect => ({ defense: 3 }) 
    },

    // --- 약탈자 리더 (Marauder Leader) ---
    LEADER_QUESTION: { 
        name: "가진거 있냐", 
        type: PatternType.PAIR, 
        face: CoinFace.HEADS, 
        description: "피해를 4 줍니다. 반격이 2 이상이면 분쇄를 1 부여합니다.", 
        effect: (a: EnemyCharacter): AbilityEffect => {
            const effect: AbilityEffect = { fixedDamage: 4 };
            if ((a.statusEffects[StatusEffectType.COUNTER] || 0) >= 2) {
                effect.status = { type: StatusEffectType.SHATTER, value: 1, target: 'player' };
            }
            return effect;
        }
    },
    LEADER_DEMAND: { 
        name: "가진거 다 내놔", 
        type: PatternType.TRIPLE, 
        face: CoinFace.HEADS, 
        description: "피해를 6 줍니다.", 
        effect: (): AbilityEffect => ({ fixedDamage: 6 }) 
    },
    LEADER_WAIT: { 
        name: "잠깐!", 
        type: PatternType.PAIR, 
        face: CoinFace.TAILS, 
        description: "방어를 3 얻습니다. 반격을 2 얻습니다.", 
        effect: (): AbilityEffect => ({ defense: 3, status: {type: StatusEffectType.COUNTER, value: 2, target: "self"} }) 
    },
    LEADER_STAY: { 
        name: "기다려!", 
        type: PatternType.TRIPLE, 
        face: CoinFace.TAILS, 
        description: "방어를 5 얻습니다.", 
        effect: (): AbilityEffect => ({ defense: 5 }) 
    },

    // --- 루멘 리퍼 (Lumen Reaper) ---
    LUMENREAPER_EROSION_SCYTHE: { 
        name: "침식의 낫", 
        type: PatternType.PAIR, 
        face: CoinFace.HEADS, 
        description: "피해를 4 줍니다. 저주를 2 부여합니다.", 
        effect: (): AbilityEffect => ({ fixedDamage: 4, status: {type: StatusEffectType.CURSE, value: 2, target: "enemy"} }) 
    },
    LUMENREAPER_SHADOW_STRIKE: { 
        name: "그림자 강타", 
        type: PatternType.UNIQUE, 
        face: CoinFace.HEADS, 
        description: "피해를 4 줍니다. 다음 턴에 루멘 리퍼의 첫번째 동전이 뒷면으로 확정됩니다.", 
        effect: (): AbilityEffect => ({ fixedDamage: 4, enemyTemporaryEffect: { name: 'guaranteedFirstCoinTails', value: true, duration: 2 } }) 
    },
    LUMENREAPER_NIGHT_PLUNDER: { 
        name: "밤의 약탈", 
        type: PatternType.QUAD, 
        face: CoinFace.HEADS, 
        description: "피해를 8 줍니다. 현재 저주 수치만큼 스킬 피해량이 1 증가합니다.", 
        effect: (a: EnemyCharacter, d: PlayerCharacter): AbilityEffect => ({ fixedDamage: 8 + (d.statusEffects[StatusEffectType.CURSE] || 0) }) 
    },
    LUMENREAPER_STEALTH: { 
        name: "은신", 
        type: PatternType.PAIR, 
        face: CoinFace.TAILS, 
        description: "방어를 4 얻습니다.", 
        effect: (): AbilityEffect => ({ defense: 4 }) 
    },
    LUMENREAPER_SHADOW_SHROUD: { 
        name: "그림자 장막", 
        type: PatternType.QUAD, 
        face: CoinFace.TAILS, 
        description: "방어를 8 얻습니다. 저주를 3 부여합니다.", 
        effect: (): AbilityEffect => ({ defense: 8, status: {type: StatusEffectType.CURSE, value: 3, target: "enemy"} }) 
    },
};