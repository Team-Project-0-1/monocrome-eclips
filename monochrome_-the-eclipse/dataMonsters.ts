import {
  MonsterData,
  PatternType,
  CoinFace,
  StatusEffectType,
  EnemyCharacter,
  PlayerCharacter,
  MonsterPatternDefinition,
  AbilityEffect,
  MonsterPhaseDefinition,
} from "./types";
import { assetPath } from "./utils/assetPath";

const monsterSpriteAnimations = { idle: 0, attack: 1, skill: 2, death: 3 };

export const getMonsterPhase = (enemy: EnemyCharacter): MonsterPhaseDefinition | null => {
    const phases = monsterData[enemy.key]?.phases ?? [];
    if (phases.length === 0) return null;

    const hpRatio = enemy.maxHp > 0 ? enemy.currentHp / enemy.maxHp : 1;
    const turn = Number(enemy.temporaryEffects?.combatTurn?.value ?? 1);

    return phases.filter((phase) => (
        (phase.hpBelow === undefined || hpRatio <= phase.hpBelow) &&
        (phase.turnFrom === undefined || turn >= phase.turnFrom)
    )).sort((a, b) => {
        const hpA = a.hpBelow ?? 1;
        const hpB = b.hpBelow ?? 1;
        if (hpA !== hpB) return hpA - hpB;
        return (b.turnFrom ?? 0) - (a.turnFrom ?? 0);
    })[0] ?? null;
};

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
        assetKey: "marauder1",
        portraitSrc: assetPath("assets/monsters/portraits/001_looter1.png"),
        spriteSheetSrc: assetPath("assets/monsters/sprites/001_looter1-spritesheet.png"),
        spriteFrameSize: 256,
        spriteAnimations: monsterSpriteAnimations,
        passives: ["PASSIVE_MARAUDER1_CRUEL_INTERIOR"]
    },
    marauder2: {
        name: "약탈자2", // 전사형 (Warrior)
        hp: 35,
        baseAtk: 0,
        baseDef: 0,
        patterns: ["MARAUDER2_SWING", "MARAUDER2_JUGGERNAUT", "MARAUDER2_CHARGE"],
        tier: "normal",
        assetKey: "marauder2",
        portraitSrc: assetPath("assets/monsters/portraits/002_looter2.png"),
        spriteSheetSrc: assetPath("assets/monsters/sprites/002_looter2-spritesheet.png"),
        spriteFrameSize: 256,
        spriteAnimations: monsterSpriteAnimations,
        passives: ["PASSIVE_MARAUDER2_MUSCLE_GROWTH"]
    },
    infectedDog: {
        name: "감염된 들개", // 마법형 (Mage)
        hp: 24,
        baseAtk: 0,
        baseDef: 0,
        patterns: ["INFECTEDDOG_BITE", "INFECTEDDOG_NECKBITE", "INFECTEDDOG_PUS"],
        tier: "normal",
        assetKey: "infectedDog",
        portraitSrc: assetPath("assets/monsters/portraits/003_wild_dog.png"),
        spriteSheetSrc: assetPath("assets/monsters/sprites/003_wild_dog-spritesheet.png"),
        spriteFrameSize: 256,
        spriteAnimations: monsterSpriteAnimations,
    },
    // Stage 1 Miniboss
    marauderLeader: {
        name: "약탈자 리더", // 방어형 (Tank)
        hp: 45,
        baseAtk: 0,
        baseDef: 0,
        patterns: ["LEADER_QUESTION", "LEADER_DEMAND", "LEADER_WAIT", "LEADER_STAY"],
        tier: "miniboss",
        assetKey: "marauderLeader",
        portraitSrc: assetPath("assets/monsters/portraits/004_looter_leader.png"),
        spriteSheetSrc: assetPath("assets/monsters/sprites/004_looter_leader-spritesheet.png"),
        spriteFrameSize: 256,
        spriteAnimations: monsterSpriteAnimations,
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
        assetKey: "lumenReaper",
        portraitSrc: assetPath("assets/monsters/portraits/005_lumen_reaper.png"),
        spriteSheetSrc: assetPath("assets/monsters/sprites/005_lumen_reaper-spritesheet.png"),
        spriteFrameSize: 256,
        spriteAnimations: monsterSpriteAnimations,
        passives: [
            "PASSIVE_REAPER_FLOWING_DARKNESS",
            "PASSIVE_REAPER_AMBUSH",
            "PASSIVE_REAPER_VITAL_STRIKE"
        ],
    },
    // Stage 2 Monsters
    shadowWraith: {
        name: "그림자 망령",
        hp: 75,
        baseAtk: 9,
        baseDef: 0,
        patterns: ["SHADOWWRAITH_ROAR", "SHADOWWRAITH_SCREAM"],
        tier: "normal",
        assetKey: "shadowWraith",
        portraitSrc: assetPath("assets/monsters/portraits/006_shadow_wraith-transparent.png"),
        spriteSheetSrc: assetPath("assets/monsters/sprites/006_shadow_wraith-spritesheet-transparent.png"),
        spriteFrameSize: 256,
        spriteAnimations: monsterSpriteAnimations,
        passives: ["PASSIVE_SHADOWWRAITH_EARDRUM_BREAK"],
    },
    doppelganger: {
        name: "도플갱어",
        hp: 95,
        baseAtk: 5,
        baseDef: 5,
        patterns: ["DOPPELGANGER_IMITATE", "DOPPELGANGER_REPEATED_MIMICRY"],
        tier: "normal",
        assetKey: "doppelganger",
        portraitSrc: assetPath("assets/monsters/portraits/007_doppelganger-transparent.png"),
        spriteSheetSrc: assetPath("assets/monsters/sprites/007_doppelganger-spritesheet-transparent.png"),
        spriteFrameSize: 256,
        spriteAnimations: monsterSpriteAnimations,
        passives: ["PASSIVE_DOPPELGANGER_AFTERIMAGE"],
    },
    unpleasantCube: {
        name: "불쾌한 큐브",
        hp: 85,
        baseAtk: 2,
        baseDef: 8,
        patterns: ["UNPLEASANTCUBE_WHIP", "UNPLEASANTCUBE_DEFENSIVE_STANCE"],
        tier: "normal",
        assetKey: "unpleasantCube",
        portraitSrc: assetPath("assets/monsters/stage2-generated/unpleasant_cube_portrait.png"),
        spriteSheetSrc: assetPath("assets/monsters/stage2-generated/unpleasant_cube_spritesheet.png"),
        spriteFrameSize: 256,
        spriteAnimations: monsterSpriteAnimations,
        passives: ["PASSIVE_UNPLEASANTCUBE_BIND"],
    },
    subject162: {
        name: "개체번호 162",
        hp: 100,
        baseAtk: 1,
        baseDef: 9,
        patterns: ["SUBJECT162_OPEN_MOUTH", "SUBJECT162_DAMAGE_DELUSION", "SUBJECT162_PSYCHOTIC_WAVE"],
        tier: "miniboss",
        assetKey: "subject162",
        portraitSrc: assetPath("assets/monsters/stage2-generated/subject_162_portrait.png"),
        spriteSheetSrc: assetPath("assets/monsters/stage2-generated/subject_162_spritesheet.png"),
        spriteFrameSize: 256,
        spriteAnimations: monsterSpriteAnimations,
        passives: ["PASSIVE_SUBJECT162_DISGUST"],
    },
    chimera: {
        name: "키메라",
        hp: 220,
        baseAtk: 10,
        baseDef: 8,
        patterns: [
            "CHIMERA_FIERCE_ROAR",
            "CHIMERA_THORN_TENTACLE",
            "CHIMERA_SHARP_CHARGE",
            "CHIMERA_MERCILESS_PREDATION",
            "CHIMERA_THORN_SKIN",
        ],
        tier: "boss",
        assetKey: "chimera",
        portraitSrc: assetPath("assets/monsters/portraits/010_chimera-transparent.png"),
        spriteSheetSrc: assetPath("assets/monsters/sprites/010_chimera-spritesheet-transparent.png"),
        spriteFrameSize: 256,
        spriteAnimations: monsterSpriteAnimations,
        phases: [
            {
                id: "chimera_bloodied",
                label: "2페이즈: 찢어진 몸",
                hpBelow: 0.5,
                patterns: [
                    "CHIMERA_FIERCE_ROAR",
                    "CHIMERA_THORN_TENTACLE",
                    "CHIMERA_SHARP_CHARGE",
                ],
            },
            {
                id: "chimera_last_hunger",
                label: "3페이즈: 마지막 포식",
                hpBelow: 0.3,
                patterns: [
                    "CHIMERA_MERCILESS_PREDATION",
                    "CHIMERA_SHARP_CHARGE",
                    "CHIMERA_THORN_SKIN",
                ],
            },
        ],
        passives: ["PASSIVE_CHIMERA_SAW_TEETH"],
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

    // --- 그림자 망령 (Shadow Wraith) ---
    SHADOWWRAITH_ROAR: {
        name: "포효",
        type: PatternType.UNIQUE,
        face: CoinFace.HEADS,
        description: "기본 공격 후 표식 수치당 추가 피해를 줍니다.",
        effect: (_a: EnemyCharacter, d: PlayerCharacter): AbilityEffect => ({
            fixedDamage: 9 + (d.statusEffects[StatusEffectType.MARK] || 0),
        }),
    },
    SHADOWWRAITH_SCREAM: {
        name: "비명",
        type: PatternType.QUAD,
        face: CoinFace.TAILS,
        description: "방어를 3 얻고 표식을 5 부여합니다.",
        effect: (): AbilityEffect => ({
            defense: 3,
            status: { type: StatusEffectType.MARK, value: 5, target: "enemy" },
        }),
    },

    // --- 도플갱어 (Doppelganger) ---
    DOPPELGANGER_IMITATE: {
        name: "따라하기",
        type: PatternType.PAIR,
        face: CoinFace.HEADS,
        description: "2회 공격하고 증폭을 1 얻습니다.",
        effect: (a: EnemyCharacter): AbilityEffect => ({
            multiHit: { count: 2, damage: a.baseAtk },
            status: { type: StatusEffectType.AMPLIFY, value: 1, target: "self" },
        }),
    },
    DOPPELGANGER_REPEATED_MIMICRY: {
        name: "반복적인 모방",
        type: PatternType.PENTA,
        face: CoinFace.TAILS,
        description: "증폭을 5 얻습니다.",
        effect: (): AbilityEffect => ({ status: { type: StatusEffectType.AMPLIFY, value: 5, target: "self" } }),
    },

    // --- 불쾌한 큐브 (Unpleasant Cube) ---
    UNPLEASANTCUBE_WHIP: {
        name: "채찍질",
        type: PatternType.PENTA,
        face: CoinFace.HEADS,
        description: "4회 공격하고 반격을 2 얻습니다.",
        effect: (a: EnemyCharacter): AbilityEffect => ({
            multiHit: { count: 4, damage: a.baseAtk },
            status: { type: StatusEffectType.COUNTER, value: 2, target: "self" },
        }),
    },
    UNPLEASANTCUBE_DEFENSIVE_STANCE: {
        name: "방어 태세",
        type: PatternType.TRIPLE,
        face: CoinFace.TAILS,
        description: "반격을 3 얻습니다.",
        effect: (): AbilityEffect => ({ status: { type: StatusEffectType.COUNTER, value: 3, target: "self" } }),
    },

    // --- 개체번호 162 (Subject 162) ---
    SUBJECT162_OPEN_MOUTH: {
        name: "아가리 열기",
        type: PatternType.QUAD,
        face: CoinFace.HEADS,
        description: "2회 공격하고 저주를 4 부여합니다.",
        effect: (a: EnemyCharacter): AbilityEffect => ({
            multiHit: { count: 2, damage: a.baseAtk },
            status: { type: StatusEffectType.CURSE, value: 4, target: "enemy" },
        }),
    },
    SUBJECT162_DAMAGE_DELUSION: {
        name: "피해 망상",
        type: PatternType.PAIR,
        face: CoinFace.TAILS,
        description: "저주를 2 부여합니다.",
        effect: (): AbilityEffect => ({ status: { type: StatusEffectType.CURSE, value: 2, target: "enemy" } }),
    },
    SUBJECT162_PSYCHOTIC_WAVE: {
        name: "정신병 파동",
        type: PatternType.AWAKENING,
        face: CoinFace.TAILS,
        description: "자신의 체력을 2 잃고 저주를 5 부여합니다.",
        effect: (): AbilityEffect => ({
            selfDamage: 2,
            status: { type: StatusEffectType.CURSE, value: 5, target: "enemy" },
        }),
    },

    // --- 키메라 (Chimera) ---
    CHIMERA_FIERCE_ROAR: {
        name: "거센 포효",
        type: PatternType.TRIPLE,
        face: CoinFace.HEADS,
        description: "2회 공격하고 표식을 2 부여합니다.",
        effect: (a: EnemyCharacter): AbilityEffect => ({
            multiHit: { count: 2, damage: a.baseAtk },
            status: { type: StatusEffectType.MARK, value: 2, target: "enemy" },
        }),
    },
    CHIMERA_THORN_TENTACLE: {
        name: "가시 촉수",
        type: PatternType.QUAD,
        face: CoinFace.HEADS,
        description: "부여한 표식만큼 고정 피해를 줍니다.",
        effect: (_a: EnemyCharacter, d: PlayerCharacter): AbilityEffect => ({
            fixedDamage: d.statusEffects[StatusEffectType.MARK] || 0,
        }),
    },
    CHIMERA_SHARP_CHARGE: {
        name: "날카로운 돌진",
        type: PatternType.PENTA,
        face: CoinFace.HEADS,
        description: "2회 공격합니다. 출혈이 있으면 2회 더 공격합니다.",
        effect: (a: EnemyCharacter, d: PlayerCharacter): AbilityEffect => ({
            multiHit: { count: (d.statusEffects[StatusEffectType.BLEED] || 0) > 0 ? 4 : 2, damage: a.baseAtk },
        }),
    },
    CHIMERA_MERCILESS_PREDATION: {
        name: "무자비한 포식",
        type: PatternType.UNIQUE,
        face: CoinFace.HEADS,
        description: "표식과 출혈 수치만큼 연속 공격합니다.",
        effect: (a: EnemyCharacter, d: PlayerCharacter): AbilityEffect => ({
            multiHit: {
                count: (d.statusEffects[StatusEffectType.MARK] || 0) + (d.statusEffects[StatusEffectType.BLEED] || 0),
                damage: a.baseAtk,
            },
        }),
    },
    CHIMERA_THORN_SKIN: {
        name: "가시 피부",
        type: PatternType.PAIR,
        face: CoinFace.TAILS,
        description: "체력 40% 이하일 때 방어를 2 얻습니다.",
        effect: (a: EnemyCharacter): AbilityEffect => a.currentHp <= a.maxHp * 0.4 ? { defense: 2 } : { defense: 0 },
    },
};
