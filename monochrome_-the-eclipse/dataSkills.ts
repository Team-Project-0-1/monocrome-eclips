import {
  PatternType,
  StatusEffectType,
  CharacterClass,
  SkillUpgradeDefinition,
  CoinFace,
  PlayerCharacter,
  EnemyCharacter,
  Coin,
  AbilityEffect,
} from "./types";

export const playerAbilities: { [key: string]: any } = {
    [CharacterClass.WARRIOR]: {
        [PatternType.PAIR]: { 
            [CoinFace.HEADS]: { name: "진동 타격", description: "피해를 4 줍니다. 증폭을 1 얻습니다.", effect: (): AbilityEffect => ({ fixedDamage: 4, status: { type: StatusEffectType.AMPLIFY, value: 1, target: 'player' } }) }, 
            [CoinFace.TAILS]: { name: "진동 방어막", description: "방어를 3 얻습니다. 증폭을 1 얻습니다.", effect: (): AbilityEffect => ({ defense: 3, status: { type: StatusEffectType.AMPLIFY, value: 1, target: 'player' } }) }, 
        },
        [PatternType.TRIPLE]: { 
            [CoinFace.HEADS]: { name: "증폭 돌진", description: "피해를 5 줍니다. 스킬 사용 전, 증폭을 1 얻고, 1 턴간 추가 공격력을 2 얻습니다.", effect: (): AbilityEffect => ({ fixedDamage: 5, status: { type: StatusEffectType.AMPLIFY, value: 1, target: 'player' }, temporaryEffect: { name: 'bonusAtk', value: 2, duration: 2 } }) }, 
            [CoinFace.TAILS]: { name: "진동막", description: "방어를 6 얻습니다. 스킬 사용 전, 증폭을 1 얻고, 1 턴간 추가 방어력을 2 얻습니다.", effect: (): AbilityEffect => ({ defense: 6, status: { type: StatusEffectType.AMPLIFY, value: 1, target: 'player' }, temporaryEffect: { name: 'bonusDef', value: 2, duration: 2 } }) }, 
        },
        [PatternType.QUAD]: { 
            [CoinFace.HEADS]: { name: "위상 붕괴", description: "피해를 8 줍니다. 스킬 사용 전, 현재 증폭 수치가 10 이면, 피해를 8 + 증폭 만큼 주고, 모든 증폭을 잃습니다.", effect: (p: PlayerCharacter): AbilityEffect => {
                const amp = p.statusEffects.AMPLIFY || 0;
                if(amp >= 10) return { fixedDamage: 8 + amp, statusCost: { type: StatusEffectType.AMPLIFY, value: amp } };
                return { fixedDamage: 8 };
            }}, 
            [CoinFace.TAILS]: { name: "증폭 유지 파동", description: "방어를 5 얻습니다. 스킬 사용 전, 현재 증폭 수치가 10 이면, 방어를 5 + 증폭 만큼 얻고, 모든 증폭을 잃습니다.", effect: (p: PlayerCharacter): AbilityEffect => {
                const amp = p.statusEffects.AMPLIFY || 0;
                if(amp >= 10) return { defense: 5 + amp, statusCost: { type: StatusEffectType.AMPLIFY, value: amp } };
                return { defense: 5 };
            }}, 
        },
        [PatternType.PENTA]: { 
            [CoinFace.HEADS]: { name: "해방", description: "피해를 10 줍니다. 스킬 사용 전, 현재 증폭 수치가 10 이면, 피해를 10 + (증폭*2) 만큼 주고, 모든 증폭을 잃습니다.", effect: (p: PlayerCharacter): AbilityEffect => {
                const amp = p.statusEffects.AMPLIFY || 0;
                if(amp >= 10) return { fixedDamage: 10 + (amp * 2), statusCost: { type: StatusEffectType.AMPLIFY, value: amp } };
                return { fixedDamage: 10 };
            }}, 
            [CoinFace.TAILS]: { name: "초진동 갑주", description: "방어를 8 얻습니다. 스킬 사용 전, 현재 증폭 수치가 10 이면, 방어를 10 얻고, 1턴간 추가 공격력을 증폭 만큼 얻습니다. 사용 후 모든 증폭을 잃습니다.", effect: (p: PlayerCharacter): AbilityEffect => {
                const amp = p.statusEffects.AMPLIFY || 0;
                if(amp >= 10) return { defense: 10, temporaryEffect: { name: 'bonusAtk', value: amp, duration: 2 }, statusCost: { type: StatusEffectType.AMPLIFY, value: amp } };
                return { defense: 8 };
            }}, 
        },
        [PatternType.UNIQUE]: { 
            [CoinFace.HEADS]: { name: "공진", description: "피해를 4 줍니다. 상대방에게 공명을 1 부여합니다.", effect: (): AbilityEffect => ({ fixedDamage: 4, enemyTemporaryEffect: { name: 'resonance', value: 1, duration: 3, accumulative: true } }) }, 
            [CoinFace.TAILS]: { name: "충격 전달", description: "방어를 4 얻습니다. 다음 턴 시작 시 첫번째 동전을 앞면으로 만듭니다.", effect: (): AbilityEffect => ({ defense: 4, temporaryEffect: { name: 'firstCoinHeads', value: true, duration: 2 } }) }, 
        },
        [PatternType.AWAKENING]: {
            [CoinFace.HEADS]: { name: "파멸의 메아리", description: "피해를 12 줍니다. 스킬 사용 전, 현재 증폭 수치가 10 이면, 피해를 12 + 앞면 개수 + (증폭*4) 만큼 주고, 모든 증폭을 잃습니다.", effect: (p: PlayerCharacter, e: EnemyCharacter, c?: Coin[]): AbilityEffect => {
                const amp = p.statusEffects.AMPLIFY || 0;
                if(amp >= 10) {
                    const headsCount = c?.filter(cn => cn.face === CoinFace.HEADS).length || 0;
                    return { fixedDamage: 12 + headsCount + (amp * 4), statusCost: { type: StatusEffectType.AMPLIFY, value: amp } };
                }
                return { fixedDamage: 12 };
            }},
            [CoinFace.TAILS]: { name: "생명의 메아리", description: "방어를 10 얻습니다. 스킬 사용 전, 현재 증폭 수치가 10 이면, 방어를 10 얻고, 체력을 5 + 뒷면 개수 + (증폭)만큼 회복합니다. 사용 후 모든 증폭을 잃습니다.", effect: (p: PlayerCharacter, e: EnemyCharacter, c?: Coin[]): AbilityEffect => {
                const amp = p.statusEffects.AMPLIFY || 0;
                if(amp >= 10) {
                    const tailsCount = c?.filter(cn => cn.face === CoinFace.TAILS).length || 0;
                    return { defense: 10, heal: 5 + tailsCount + amp, statusCost: { type: StatusEffectType.AMPLIFY, value: amp } };
                }
                return { defense: 10 };
            }},
        },
    },
    [CharacterClass.ROGUE]: {
        [PatternType.PAIR]: {
            [CoinFace.HEADS]: { name: "추적 탄환", description: "피해를 4 줍니다. 추적을 3 얻습니다.", effect: (): AbilityEffect => ({ fixedDamage: 4, status: { type: StatusEffectType.PURSUIT, value: 3, target: 'player' } }) },
            [CoinFace.TAILS]: { name: "가로막기", description: "방어를 3 얻습니다. 추적을 1 얻습니다.", effect: (): AbilityEffect => ({ defense: 3, status: { type: StatusEffectType.PURSUIT, value: 1, target: 'player' } }) },
        },
        [PatternType.TRIPLE]: {
            [CoinFace.HEADS]: { name: "집요한 일격", description: "피해를 3 만큼 2 번 반복합니다. 추적을 2 얻습니다.", effect: (): AbilityEffect => ({ multiHit: { count: 2, damage: 3 }, status: { type: StatusEffectType.PURSUIT, value: 2, target: 'player' } }) },
            [CoinFace.TAILS]: { name: "긴급 후퇴", description: "방어를 4 얻습니다. 추적 2 당 추가 방어력을 1 얻습니다.", effect: (p: PlayerCharacter): AbilityEffect => ({ defense: 4 + Math.floor((p.statusEffects.PURSUIT || 0) / 2) }) },
        },
        [PatternType.QUAD]: {
            [CoinFace.HEADS]: { name: "이동 사격", description: "피해를 10 줍니다. 턴 종료 시, 2 배의 추적 피해로 주고, 수치를 6 잃습니다.", effect: (): AbilityEffect => ({ fixedDamage: 10, temporaryEffect: { name: 'doublePursuitDamageAndModifiedLoss', value: { multiplier: 2, loss: 6 }, duration: 2 } }) },
            [CoinFace.TAILS]: { name: "예측 기동", description: "방어를 5 얻습니다. 상대가 공격 스킬을 사용한 경우 추적을 2 번 반복합니다.", effect: (): AbilityEffect => ({ defense: 5, temporaryEffect: { name: 'pursuitOnEnemyAttack', value: 2, duration: 2 } }) },
        },
        [PatternType.PENTA]: {
            [CoinFace.HEADS]: { name: "연사 본능", description: "피해를 8 줍니다. 추적을 5 얻습니다. 턴 종료 시, 1 턴간 추적을 3 번 반복합니다", effect: (): AbilityEffect => ({ fixedDamage: 8, status: { type: StatusEffectType.PURSUIT, value: 5, target: 'player' }, temporaryEffect: { name: 'pursuitTriggerCount', value: 3, duration: 2 } }) },
            [CoinFace.TAILS]: { name: "퀵 슬롯", description: "방어를 7 얻습니다. 턴 종료 시, 추적이 2 이하인 경우 추적을 6 얻습니다.", effect: (): AbilityEffect => ({ defense: 7, temporaryEffect: { name: 'pursuitRefill', value: 6, duration: 2 } }) },
        },
        [PatternType.UNIQUE]: {
            [CoinFace.HEADS]: { name: "다리 걸기", description: "피해를 4 줍니다. 분쇄를 2 부여합니다.", effect: (): AbilityEffect => ({ fixedDamage: 4, status: { type: StatusEffectType.SHATTER, value: 2, target: 'enemy' } }) },
            [CoinFace.TAILS]: { name: "손놀림", description: "방어를 4 얻습니다. 다음 턴에 앞면 확률이 15% 증가합니다.", effect: (): AbilityEffect => ({ defense: 4, temporaryEffect: { name: 'headsChanceUp', value: 0.15, duration: 2 } }) },
        },
        [PatternType.AWAKENING]: {
            [CoinFace.HEADS]: { name: "전탄 사격", description: "피해를 5 만큼 (추적*2) 번 반복합니다. 턴 종료 시, 1 턴간 추적을 5 번 반복하고, 모든 추적을 잃습니다.", effect: (p: PlayerCharacter): AbilityEffect => ({ multiHit: { count: ((p.statusEffects.PURSUIT || 0) * 2), damage: 5 }, temporaryEffect: { name: 'pursuitAnnihilation', value: { triggers: 5 }, duration: 2 } }) },
            [CoinFace.TAILS]: { name: "탄창 교체", description: "방어를 9 얻습니다. 턴 종료 시, 추적이 0 인 경우 뒷면 개수*3 만큼 얻습니다.", effect: (): AbilityEffect => ({ defense: 9, temporaryEffect: { name: 'pursuitReload', value: 3, duration: 2 } }) },
        }
    },
    [CharacterClass.TANK]: {
        [PatternType.PAIR]: { 
            [CoinFace.HEADS]: { name: "방패 가격", description: "피해 2, 반격 +1", effect: (): AbilityEffect => ({ fixedDamage: 2, status: { type: StatusEffectType.COUNTER, value: 1, target: 'player' } }) }, 
            [CoinFace.TAILS]: { name: "수비 태세", description: "방어 4, 반격 +1", effect: (): AbilityEffect => ({ defense: 4, status: { type: StatusEffectType.COUNTER, value: 1, target: 'player' } }) }, 
        },
        [PatternType.TRIPLE]: { 
            [CoinFace.HEADS]: { name: "압박", description: "피해 4, 분쇄 +1", effect: (): AbilityEffect => ({ fixedDamage: 4, status: { type: StatusEffectType.SHATTER, value: 1, target: 'enemy' } }) }, 
            [CoinFace.TAILS]: { name: "철옹성", description: "방어 6, 반격 +1", effect: (): AbilityEffect => ({ defense: 6, status: { type: StatusEffectType.COUNTER, value: 1, target: 'player' } }) }, 
        },
        [PatternType.UNIQUE]: { 
            [CoinFace.HEADS]: { name: "분쇄의 일격", description: "피해 4, 보조 효과: 분쇄 +1", effect: (): AbilityEffect => ({ fixedDamage: 4, status: { type: StatusEffectType.SHATTER, value: 1, target: 'enemy' } }) }, 
            [CoinFace.TAILS]: { name: "굳건함", description: "방어 4, 보조 효과: 반격 +1", effect: (): AbilityEffect => ({ defense: 4, status: { type: StatusEffectType.COUNTER, value: 1, target: 'player' } }) }, 
        },
    },
    [CharacterClass.MAGE]: {
        [PatternType.PAIR]: { 
            [CoinFace.HEADS]: { name: "마력 방출", description: "피해 4, 저주 +1", effect: (): AbilityEffect => ({ fixedDamage: 4, status: { type: StatusEffectType.CURSE, value: 1, target: 'enemy' } }) }, 
            [CoinFace.TAILS]: { name: "보호막", description: "방어 3, 봉인 +1", effect: (): AbilityEffect => ({ defense: 3, status: { type: StatusEffectType.SEAL, value: 1, target: 'enemy' } }) }, 
        },
        [PatternType.TRIPLE]: { 
            [CoinFace.HEADS]: { name: "부패의 속삭임", description: "피해를 6 줍니다. 저주 +2", effect: (): AbilityEffect => ({ fixedDamage: 6, status: { type: StatusEffectType.CURSE, value: 2, target: 'enemy' } }) }, 
            [CoinFace.TAILS]: { name: "정신 방벽", description: "방어를 5 얻습니다. 저주 1 제거", effect: (p: PlayerCharacter): AbilityEffect => ({ defense: 5, statusDrain: { type: StatusEffectType.CURSE, value: 1 } }) }, 
        },
        [PatternType.UNIQUE]: { 
            [CoinFace.HEADS]: { name: "공허의 손길", description: "피해 4, 보조 효과: 저주 +1", effect: (): AbilityEffect => ({ fixedDamage: 4, status: { type: StatusEffectType.CURSE, value: 1, target: 'enemy' } }) }, 
            [CoinFace.TAILS]: { name: "시간 왜곡", description: "방어 4, 보조 효과: 공명 +1", effect: (): AbilityEffect => ({ defense: 4, status: { type: StatusEffectType.RESONANCE, value: 1, target: 'enemy' } }) }, 
        },
    }
};

export const playerSkillUnlocks: { [key in CharacterClass]?: { [id: string]: SkillUpgradeDefinition } } = {
  [CharacterClass.WARRIOR]: {
    // Resonance Build
    'WARRIOR_RES_P_H': { id: 'WARRIOR_RES_P_H', name: '공명 주입', description: '피해를 5 줍니다. 공명을 2 부여합니다.', cost: { echoRemnants: 50 }, replaces: { type: PatternType.PAIR, face: CoinFace.HEADS }, effect: (): AbilityEffect => ({ fixedDamage: 5, enemyTemporaryEffect: { name: 'resonance', value: 2, duration: 3, accumulative: true } })},
    'WARRIOR_RES_P_T': { id: 'WARRIOR_RES_P_T', name: '잔류 방어', description: '방어를 2 얻습니다. 공명을 1 부여합니다.', cost: { echoRemnants: 50 }, replaces: { type: PatternType.PAIR, face: CoinFace.TAILS }, effect: (): AbilityEffect => ({ defense: 2, enemyTemporaryEffect: { name: 'resonance', value: 1, duration: 3, accumulative: true } })},
    'WARRIOR_RES_U_H': { id: 'WARRIOR_RES_U_H', name: '두통 유발 타격', description: '피해를 4 줍니다. 다음 턴 시작 시 공명 수치만큼 앞면 확률이 5% 증가합니다.', cost: { echoRemnants: 60 }, replaces: { type: PatternType.UNIQUE, face: CoinFace.HEADS }, effect: (p, e): AbilityEffect => ({ fixedDamage: 4, temporaryEffect: { name: 'headsChanceUp', value: (e.temporaryEffects?.resonance?.value || 0) * 0.05, duration: 2 } })},
    'WARRIOR_RES_U_T': { id: 'WARRIOR_RES_U_T', name: '재충전', description: '방어를 4 얻습니다. 다음 턴 시작 시 증폭을 2 얻습니다.', cost: { echoRemnants: 60 }, replaces: { type: PatternType.UNIQUE, face: CoinFace.TAILS }, effect: (): AbilityEffect => ({ defense: 4, temporaryEffect: { name: 'gainAmplifyOnTurnStart', value: 2, duration: 2 } })},
    'WARRIOR_RES_T_H': { id: 'WARRIOR_RES_T_H', name: '삼중 타격', description: '피해를 2 만큼 3번 줍니다. 스킬 사용 전, 증폭을 2 소모할 경우 마지막 타격에 공명을 3 부여합니다.', cost: { echoRemnants: 70 }, replaces: { type: PatternType.TRIPLE, face: CoinFace.HEADS }, effect: (p: PlayerCharacter): AbilityEffect => {
        const effect: AbilityEffect = { multiHit: { count: 3, damage: 2 } };
        if ((p.statusEffects.AMPLIFY || 0) >= 2) {
            effect.statusCost = { type: StatusEffectType.AMPLIFY, value: 2 };
            effect.enemyTemporaryEffect = { name: 'resonance', value: 3, duration: 3, accumulative: true };
        }
        return effect;
    }},
    'WARRIOR_RES_T_T': { id: 'WARRIOR_RES_T_T', name: '반복 파동', description: '방어를 4 얻습니다. 스킬 사용 전, 증폭을 2 소모할 경우 적에게 공명을 2 부여합니다.', cost: { echoRemnants: 70 }, replaces: { type: PatternType.TRIPLE, face: CoinFace.TAILS }, effect: (p): AbilityEffect => {
        const effect: AbilityEffect = { defense: 4 };
        if ((p.statusEffects.AMPLIFY || 0) >= 2) {
            effect.statusCost = { type: StatusEffectType.AMPLIFY, value: 2 };
            effect.enemyTemporaryEffect = { name: 'resonance', value: 2, duration: 3, accumulative: true };
        }
        return effect;
    }},
    'WARRIOR_RES_Q_H': { id: 'WARRIOR_RES_Q_H', name: '연쇄 공명', description: '피해를 9 줍니다. 스킬 사용 전, 증폭을 4 소모할 경우 적에게 공명을 4 부여합니다.', cost: { echoRemnants: 80 }, replaces: { type: PatternType.QUAD, face: CoinFace.HEADS }, effect: (p): AbilityEffect => {
        const effect: AbilityEffect = { fixedDamage: 9 };
        if ((p.statusEffects.AMPLIFY || 0) >= 4) {
            effect.statusCost = { type: StatusEffectType.AMPLIFY, value: 4 };
            effect.enemyTemporaryEffect = { name: 'resonance', value: 4, duration: 3, accumulative: true };
        }
        return effect;
    }},
    'WARRIOR_RES_Q_T': { id: 'WARRIOR_RES_Q_T', name: '일시 정지', description: '방어를 7 얻습니다. 증폭을 2 소모할 경우 적에게 공명을 4 부여합니다.', cost: { echoRemnants: 80 }, replaces: { type: PatternType.QUAD, face: CoinFace.TAILS }, effect: (p): AbilityEffect => {
        const effect: AbilityEffect = { defense: 7 };
        if ((p.statusEffects.AMPLIFY || 0) >= 2) {
            effect.statusCost = { type: StatusEffectType.AMPLIFY, value: 2 };
            effect.enemyTemporaryEffect = { name: 'resonance', value: 4, duration: 3, accumulative: true };
        }
        return effect;
    }},
    'WARRIOR_RES_PENTA_H': { id: 'WARRIOR_RES_PENTA_H', name: '초진동 타격', description: '피해를 공명 수치만큼 줍니다. 스킬 사용 전, 증폭을 6 소모할 경우 피해를 2배로 줍니다.', cost: { echoRemnants: 90 }, replaces: { type: PatternType.PENTA, face: CoinFace.HEADS }, effect: (p, e): AbilityEffect => {
        const resonanceValue = e.temporaryEffects?.resonance?.value || 0;
        const effect: AbilityEffect = { fixedDamage: resonanceValue };
        if ((p.statusEffects.AMPLIFY || 0) >= 6) {
            effect.fixedDamage = resonanceValue * 2;
            effect.statusCost = { type: StatusEffectType.AMPLIFY, value: 6 };
        }
        return effect;
    }},
    'WARRIOR_RES_PENTA_T': { id: 'WARRIOR_RES_PENTA_T', name: '위상 차단', description: '방어를 10 얻습니다. 증폭을 4 소모할 경우 상대방의 공명을 2 턴 더 지속시킵니다.', cost: { echoRemnants: 90 }, replaces: { type: PatternType.PENTA, face: CoinFace.TAILS }, effect: (p): AbilityEffect => {
        const effect: AbilityEffect = { defense: 10 };
        if ((p.statusEffects.AMPLIFY || 0) >= 4) {
            effect.statusCost = { type: StatusEffectType.AMPLIFY, value: 4 };
            effect.enemyTemporaryEffect = { name: 'resonance_extend', value: 2, duration: 1 };
        }
        return effect;
    }},
    'WARRIOR_RES_AWA_H': { id: 'WARRIOR_RES_AWA_H', name: '영속의 파동', description: '피해를 7 + 앞면 개수 + (공명*2) 만큼 주고, 모든 공명을 잃습니다.', cost: { echoRemnants: 100 }, replaces: { type: PatternType.AWAKENING, face: CoinFace.HEADS }, effect: (p: PlayerCharacter, e: EnemyCharacter, c?: Coin[]): AbilityEffect => ({ fixedDamage: 7 + (c?.filter(cn => cn.face === CoinFace.HEADS).length || 0) + (e.temporaryEffects?.resonance?.value || 0) * 2, enemyTemporaryEffect: { name: 'resonance_clear', value: 0, duration: 1 } })},
    'WARRIOR_RES_AWA_T': { id: 'WARRIOR_RES_AWA_T', name: '완전 공명', description: '현재 적이 보유한 공명 + 뒷면 개수 만큼 방어를 얻고, 모든 공명을 잃습니다.', cost: { echoRemnants: 100 }, replaces: { type: PatternType.AWAKENING, face: CoinFace.TAILS }, effect: (p: PlayerCharacter, e: EnemyCharacter, c?: Coin[]): AbilityEffect => ({ defense: (e.temporaryEffects?.resonance?.value || 0) + (c?.filter(cn => cn.face === CoinFace.TAILS).length || 0), enemyTemporaryEffect: { name: 'resonance_clear', value: 0, duration: 1 } })},

    // Self-Bleed Build
    'WARRIOR_BLEED_P_H': { id: 'WARRIOR_BLEED_P_H', name: '이명 타격', description: '피해를 4 줍니다. 자신에게 출혈을 2 부여합니다.', cost: { echoRemnants: 50 }, replaces: { type: PatternType.PAIR, face: CoinFace.HEADS }, effect: (): AbilityEffect => ({ fixedDamage: 4, status: { type: StatusEffectType.BLEED, value: 2, target: 'player' } })},
    'WARRIOR_BLEED_P_T': { id: 'WARRIOR_BLEED_P_T', name: '소음 방벽', description: '방어를 4 얻습니다. 자신에게 출혈을 1 부여합니다.', cost: { echoRemnants: 50 }, replaces: { type: PatternType.PAIR, face: CoinFace.TAILS }, effect: (): AbilityEffect => ({ defense: 4, status: { type: StatusEffectType.BLEED, value: 1, target: 'player' } })},
    'WARRIOR_BLEED_U_H': { id: 'WARRIOR_BLEED_U_H', name: '낮은 진동', description: '피해를 4 줍니다. 다음 턴 시작 시 뒷면 확률이 15% 증가합니다.', cost: { echoRemnants: 60 }, replaces: { type: PatternType.UNIQUE, face: CoinFace.HEADS }, effect: (): AbilityEffect => ({ fixedDamage: 4, temporaryEffect: { name: 'tailsChanceUp', value: 0.15, duration: 2 } })},
    'WARRIOR_BLEED_U_T': { id: 'WARRIOR_BLEED_U_T', name: '흩어지는 소리', description: '방어를 4 얻습니다. 다음 턴에 뒷면 3 개 이상이면 임의의 뒷면 1 개를 앞면으로 뒤집습니다.', cost: { echoRemnants: 60 }, replaces: { type: PatternType.UNIQUE, face: CoinFace.TAILS }, effect: (): AbilityEffect => ({ defense: 4, temporaryEffect: { name: 'tailsToHeads', value: 1, duration: 2 } })},
    'WARRIOR_BLEED_T_H': { id: 'WARRIOR_BLEED_T_H', name: '내부 파열', description: '피해를 6 줍니다. 스킬 사용 전, 자신의 출혈이 3 이상인 경우 2 턴간 추가 공격력을 4 얻습니다.', cost: { echoRemnants: 70 }, replaces: { type: PatternType.TRIPLE, face: CoinFace.HEADS }, effect: (p): AbilityEffect => {
        const effect: AbilityEffect = { fixedDamage: 6 };
        if ((p.statusEffects.BLEED || 0) >= 3) {
            effect.temporaryEffect = { name: 'bonusAtk', value: 4, duration: 3 };
        }
        return effect;
    }},
    'WARRIOR_BLEED_T_T': { id: 'WARRIOR_BLEED_T_T', name: '비탄', description: '방어를 6 얻습니다. 자신에게 출혈을 5 부여하고, 2 턴간 자신의 출혈 피해가 2% 증가합니다.', cost: { echoRemnants: 70 }, replaces: { type: PatternType.TRIPLE, face: CoinFace.TAILS }, effect: (): AbilityEffect => ({ defense: 6, status: { type: StatusEffectType.BLEED, value: 5, target: 'player' }, temporaryEffect: { name: 'bleedDamageUp', value: 0.02, duration: 3 } })},
    'WARRIOR_BLEED_Q_H': { id: 'WARRIOR_BLEED_Q_H', name: '날카로운 파동', description: '피해를 8 줍니다. 스킬 사용 전, 자신의 출혈을 5 소모할 경우 3 턴간 증폭을 1 얻습니다.', cost: { echoRemnants: 80 }, replaces: { type: PatternType.QUAD, face: CoinFace.HEADS }, effect: (p): AbilityEffect => {
        const effect: AbilityEffect = { fixedDamage: 8 };
        if ((p.statusEffects.BLEED || 0) >= 5) {
            effect.statusCost = { type: StatusEffectType.BLEED, value: 5 };
            effect.temporaryEffect = { name: 'gainAmplifyOnTurnEnd', value: 1, duration: 4 };
        }
        return effect;
    }},
    'WARRIOR_BLEED_Q_T': { id: 'WARRIOR_BLEED_Q_T', name: '목을 찢는 비명', description: '방어를 8 얻습니다. 스킬 사용 전, 출혈이 5 이상이라면 출혈*2 만큼 추가 방어를 얻습니다.', cost: { echoRemnants: 80 }, replaces: { type: PatternType.QUAD, face: CoinFace.TAILS }, effect: (p): AbilityEffect => ({ defense: 8 + ((p.statusEffects.BLEED || 0) >= 5 ? (p.statusEffects.BLEED || 0) * 2 : 0) })},
    'WARRIOR_BLEED_PENTA_H': { id: 'WARRIOR_BLEED_PENTA_H', name: '귀를 찢는 나팔', description: '피해를 12 줍니다. 스킬 사용 전, 자신의 출혈만큼 추가 공격력을 얻고, 모든 출혈을 잃습니다.', cost: { echoRemnants: 90 }, replaces: { type: PatternType.PENTA, face: CoinFace.HEADS }, effect: (p): AbilityEffect => ({ fixedDamage: 12, bonusDamage: p.statusEffects.BLEED, statusCost: { type: StatusEffectType.BLEED, value: p.statusEffects.BLEED || 0 } })},
    'WARRIOR_BLEED_PENTA_T': { id: 'WARRIOR_BLEED_PENTA_T', name: '고통의 갑옷', description: '방어를 11 얻습니다. 다음 턴에 자신의 출혈 피해가 2 배 증가하고, 증폭을 최대치까지 얻습니다.', cost: { echoRemnants: 90 }, replaces: { type: PatternType.PENTA, face: CoinFace.TAILS }, effect: (): AbilityEffect => ({ defense: 11, temporaryEffect: { name: 'bleedMultiplier', value: 2, duration: 2 }, gainMaxAmplify: true })},
    'WARRIOR_BLEED_AWA_H': { id: 'WARRIOR_BLEED_AWA_H', name: '피의 합주', description: '피해를 15 줍니다. 다음 턴 시작 시 1턴간 (출혈*2) 만큼 추가 공격력을 얻고, 모든 출혈을 잃습니다.', cost: { echoRemnants: 100 }, replaces: { type: PatternType.AWAKENING, face: CoinFace.HEADS }, effect: (p): AbilityEffect => ({ fixedDamage: 15, temporaryEffect: { name: 'bonusAtk', value: (p.statusEffects.BLEED || 0) * 2, duration: 2 }, statusCost: { type: StatusEffectType.BLEED, value: p.statusEffects.BLEED || 0 } })},
    'WARRIOR_BLEED_AWA_T': { id: 'WARRIOR_BLEED_AWA_T', name: '천사의 비명', description: '자신의 출혈*3 만큼 방어를 얻고, 증폭을 뒷면 개수*2 얻습니다.', cost: { echoRemnants: 100 }, replaces: { type: PatternType.AWAKENING, face: CoinFace.TAILS }, effect: (p: PlayerCharacter, e: EnemyCharacter, c?: Coin[]): AbilityEffect => ({ defense: (p.statusEffects.BLEED || 0) * 3, status: { type: StatusEffectType.AMPLIFY, value: (c?.filter(cn => cn.face === CoinFace.TAILS).length || 0) * 2, target: 'player' } })},
  },
  [CharacterClass.ROGUE]: {
    // --- Bleed Build ---
    'ROGUE_BLEED_PH': { id: 'ROGUE_BLEED_PH', name: '연사', description: '피해를 2 만큼 2 번 반복합니다. 출혈을 2 부여합니다.', cost: { echoRemnants: 50 }, replaces: { type: PatternType.PAIR, face: CoinFace.HEADS }, effect: (): AbilityEffect => ({ multiHit: { count: 2, damage: 2 }, status: { type: StatusEffectType.BLEED, value: 2, target: 'enemy' } }) },
    'ROGUE_BLEED_PT': { id: 'ROGUE_BLEED_PT', name: '거친 저항', description: '방어를 3 얻습니다. 출혈을 1 부여합니다.', cost: { echoRemnants: 50 }, replaces: { type: PatternType.PAIR, face: CoinFace.TAILS }, effect: (): AbilityEffect => ({ defense: 3, status: { type: StatusEffectType.BLEED, value: 1, target: 'enemy' } }) },
    'ROGUE_BLEED_UH': { id: 'ROGUE_BLEED_UH', name: '전술 사격', description: '피해를 4 줍니다. 스킬 사용 전, 추적이 2 이상인 경우 적의 동전 2개를 무작위로 뒤집습니다.', cost: { echoRemnants: 60 }, replaces: { type: PatternType.UNIQUE, face: CoinFace.HEADS }, effect: (p): AbilityEffect => {
        const effect: AbilityEffect = { fixedDamage: 4 };
        if ((p.statusEffects.PURSUIT || 0) >= 2) {
            effect.enemyTemporaryEffect = { name: 'flipCoinsRandom', value: 2, duration: 1 };
        }
        return effect;
    }},
    'ROGUE_BLEED_UT': { id: 'ROGUE_BLEED_UT', name: '팔 꺾기', description: '방어를 4 얻습니다. 분쇄를 2 부여합니다.', cost: { echoRemnants: 60 }, replaces: { type: PatternType.UNIQUE, face: CoinFace.TAILS }, effect: (): AbilityEffect => ({ defense: 4, status: { type: StatusEffectType.SHATTER, value: 2, target: 'enemy' } }) },
    'ROGUE_BLEED_TH': { id: 'ROGUE_BLEED_TH', name: '상처 관통', description: '피해를 3 줍니다. 스킬 사용 전, 추적이 3 이상인 경우 출혈을 4 부여합니다.', cost: { echoRemnants: 70 }, replaces: { type: PatternType.TRIPLE, face: CoinFace.HEADS }, effect: (p): AbilityEffect => {
        const effect: AbilityEffect = { fixedDamage: 3 };
        if ((p.statusEffects.PURSUIT || 0) >= 3) {
            effect.status = { type: StatusEffectType.BLEED, value: 4, target: 'enemy' };
        }
        return effect;
    }},
    'ROGUE_BLEED_TT': { id: 'ROGUE_BLEED_TT', name: '약점 파악', description: '방어를 5 얻습니다. 1 턴간 부여하는 출혈이 2 증가합니다.', cost: { echoRemnants: 70 }, replaces: { type: PatternType.TRIPLE, face: CoinFace.TAILS }, effect: (): AbilityEffect => ({ defense: 5, temporaryEffect: { name: 'bleedUp', value: 2, duration: 2 } }) },
    'ROGUE_BLEED_QH': { id: 'ROGUE_BLEED_QH', name: '확장형 탄자', description: '피해를 4 줍니다. 스킬 사용 전, 추적이 6 이상인 경우 다음 턴 시작 시 출혈을 추적*2 만큼 부여합니다.', cost: { echoRemnants: 80 }, replaces: { type: PatternType.QUAD, face: CoinFace.HEADS }, effect: (p): AbilityEffect => {
        const effect: AbilityEffect = { fixedDamage: 4 };
        const pursuit = p.statusEffects.PURSUIT || 0;
        if (pursuit >= 6) {
            effect.temporaryEffect = { name: 'bleedOnTurnStart', value: pursuit * 2, duration: 2 };
        }
        return effect;
    }},
    'ROGUE_BLEED_QT': { id: 'ROGUE_BLEED_QT', name: '혈기 왕성', description: '방어를 5 얻습니다. 스킬 사용 전, 상대방이 부여한 출혈을 3 소모할 경우 추가 방어를 2 얻습니다.', cost: { echoRemnants: 80 }, replaces: { type: PatternType.QUAD, face: CoinFace.TAILS }, effect: (p, e): AbilityEffect => {
        const effect: AbilityEffect = { defense: 5 };
        if ((e.statusEffects.BLEED || 0) >= 3) {
            effect.bonusDefense = 2;
            effect.enemyStatusDrain = { type: StatusEffectType.BLEED, value: 3 };
        }
        return effect;
    }},
    'ROGUE_BLEED_PENTA_H': { id: 'ROGUE_BLEED_PENTA_H', name: '피의 화망', description: '상대방의 출혈 스택 수만큼 1 피해를 반복한다.', cost: { echoRemnants: 90 }, replaces: { type: PatternType.PENTA, face: CoinFace.HEADS }, effect: (p, e): AbilityEffect => ({ multiHit: { count: e.statusEffects.BLEED || 0, damage: 1 } }) },
    'ROGUE_BLEED_PENTA_T': { id: 'ROGUE_BLEED_PENTA_T', name: '흡혈마', description: '방어를 6 얻습니다. 스킬 사용 전, 상대방의 출혈을 5 소모할 경우 방어를 10 얻습니다.', cost: { echoRemnants: 90 }, replaces: { type: PatternType.PENTA, face: CoinFace.TAILS }, effect: (p, e): AbilityEffect => {
        if ((e.statusEffects.BLEED || 0) >= 5) {
            return { defense: 10, enemyStatusDrain: { type: StatusEffectType.BLEED, value: 5 } };
        }
        return { defense: 6 };
    }},
    'ROGUE_BLEED_AWA_H': { id: 'ROGUE_BLEED_AWA_H', name: '혈탄', description: '스킬 사용 전, 상대방의 모든 출혈을 잃고, 방어 무시 피해를 출혈*2 만큼 줍니다.', cost: { echoRemnants: 100 }, replaces: { type: PatternType.AWAKENING, face: CoinFace.HEADS }, effect: (p, e): AbilityEffect => ({ fixedDamage: (e.statusEffects.BLEED || 0) * 2, enemyStatusDrain: { type: StatusEffectType.BLEED, value: e.statusEffects.BLEED || 0 } }) },
    'ROGUE_BLEED_AWA_T': { id: 'ROGUE_BLEED_AWA_T', name: '인계철선', description: '방어를 8 얻습니다. 스킬 사용 전, 상대방의 출혈을 2 배로 늘립니다.', cost: { echoRemnants: 100 }, replaces: { type: PatternType.AWAKENING, face: CoinFace.TAILS }, effect: (p, e): AbilityEffect => ({ defense: 8, status: { type: StatusEffectType.BLEED, value: e.statusEffects.BLEED || 0, target: 'enemy' } }) },

    // --- Shatter/Combo Build ---
    'ROGUE_SHATTER_PH': { id: 'ROGUE_SHATTER_PH', name: '철갑탄', description: '피해를 4 줍니다. 스킬 사용 후, 추적 피해를 줄 경우 분쇄를 3 부여합니다.', cost: { echoRemnants: 50 }, replaces: { type: PatternType.PAIR, face: CoinFace.HEADS }, effect: (): AbilityEffect => ({ fixedDamage: 4, temporaryEffect: { name: 'shatterOnPursuitDamage', value: 3, duration: 2 } }) },
    'ROGUE_SHATTER_PT': { id: 'ROGUE_SHATTER_PT', name: '호흡 제어', description: '방어를 2 얻습니다. 스킬 사용 전, 중복으로 사용할 경우 체력을 4 회복합니다.', cost: { echoRemnants: 50 }, replaces: { type: PatternType.PAIR, face: CoinFace.TAILS }, effect: (): AbilityEffect => ({ defense: 2, healIfPairedWithSame: 4 }) },
    'ROGUE_SHATTER_UH': { id: 'ROGUE_SHATTER_UH', name: '빈틈 명중', description: '피해를 4 줍니다. 스킬 사용 후, 상대방의 방어가 파괴될 경우, 다음 턴 시작 시 상대방의 가운데 동전을 뒷면으로 만듭니다.', cost: { echoRemnants: 60 }, replaces: { type: PatternType.UNIQUE, face: CoinFace.HEADS }, effect: (): AbilityEffect => ({ fixedDamage: 4, enemyFlipMiddleCoinIfBreakDefense: true }) },
    'ROGUE_SHATTER_UT': { id: 'ROGUE_SHATTER_UT', name: '곡예', description: '방어를 4 얻습니다. 이번 턴에 자신의 방어가 파괴되었다면, 다음 턴에 본인 동전 1개를 뒷면으로 만듭니다.', cost: { echoRemnants: 60 }, replaces: { type: PatternType.UNIQUE, face: CoinFace.TAILS }, effect: (): AbilityEffect => ({ defense: 4, playerFlipCoinIfBreakDefense: 1 }) },
    'ROGUE_SHATTER_TH': { id: 'ROGUE_SHATTER_TH', name: '저격', description: '피해를 2 만큼 4 번 반복합니다. 분쇄를 2 부여합니다.', cost: { echoRemnants: 70 }, replaces: { type: PatternType.TRIPLE, face: CoinFace.HEADS }, effect: (): AbilityEffect => ({ multiHit: { count: 4, damage: 2 }, status: { type: StatusEffectType.SHATTER, value: 2, target: 'enemy' } }) },
    'ROGUE_SHATTER_TT': { id: 'ROGUE_SHATTER_TT', name: '밀쳐내기', description: '방어를 5 얻습니다. 이번 턴에 공격하지 않은 경우 분쇄를 3 부여합니다.', cost: { echoRemnants: 70 }, replaces: { type: PatternType.TRIPLE, face: CoinFace.TAILS }, effect: (): AbilityEffect => ({ defense: 5, addShatterIfNotAttacking: 3 }) },
    'ROGUE_SHATTER_QH': { id: 'ROGUE_SHATTER_QH', name: '영점 사격', description: '피해를 7 줍니다. 스킬 사용 후, 상대방의 분쇄가 6 이상인 경우 추적을 3 얻습니다.', cost: { echoRemnants: 80 }, replaces: { type: PatternType.QUAD, face: CoinFace.HEADS }, effect: (p, e): AbilityEffect => {
        const effect: AbilityEffect = { fixedDamage: 7 };
        if ((e.statusEffects.SHATTER || 0) >= 6) {
            effect.status = { type: StatusEffectType.PURSUIT, value: 3, target: 'player' };
        }
        return effect;
    }},
    'ROGUE_SHATTER_QT': { id: 'ROGUE_SHATTER_QT', name: '흩어내기', description: '방어를 8 얻습니다. 추적을 2 얻습니다. 분쇄를 2 부여합니다.', cost: { echoRemnants: 80 }, replaces: { type: PatternType.QUAD, face: CoinFace.TAILS }, effect: (): AbilityEffect => ({ defense: 8, status: [{ type: StatusEffectType.PURSUIT, value: 2, target: 'player' }, { type: StatusEffectType.SHATTER, value: 2, target: 'enemy' }] }) },
    'ROGUE_SHATTER_PENTA_H': { id: 'ROGUE_SHATTER_PENTA_H', name: '파열탄', description: '피해를 8 줍니다. 스킬 사용 전, 상대방이 방어를 가지고 있는 경우 피해를 2 배로 늘립니다.', cost: { echoRemnants: 90 }, replaces: { type: PatternType.PENTA, face: CoinFace.HEADS }, effect: (p, e): AbilityEffect => ({ fixedDamage: 8, damageMultiplierIfEnemyHasDefense: (e.temporaryDefense > 0 || e.baseDef > 0) ? 2 : 1 }) },
    'ROGUE_SHATTER_PENTA_T': { id: 'ROGUE_SHATTER_PENTA_T', name: '삼전', description: '방어를 5 얻습니다. 스킬 사용 전, 상대방의 분쇄 만큼의 추가 방어를 얻고, 모든 분쇄를 잃습니다.', cost: { echoRemnants: 90 }, replaces: { type: PatternType.PENTA, face: CoinFace.TAILS }, effect: (p, e): AbilityEffect => ({ defense: 5 + (e.statusEffects.SHATTER || 0), enemyStatusDrain: { type: StatusEffectType.SHATTER, value: e.statusEffects.SHATTER || 0 } }) },
    'ROGUE_SHATTER_AWA_H': { id: 'ROGUE_SHATTER_AWA_H', name: '평정', description: '스킬 사용 전, 상대방의 모든 분쇄를 잃고, 피해를 자신의 추적 + (분쇄*2) 만큼 줍니다.', cost: { echoRemnants: 100 }, replaces: { type: PatternType.AWAKENING, face: CoinFace.HEADS }, effect: (p, e): AbilityEffect => ({ fixedDamage: (p.statusEffects.PURSUIT || 0) + ((e.statusEffects.SHATTER || 0) * 2), enemyStatusDrain: { type: StatusEffectType.SHATTER, value: e.statusEffects.SHATTER || 0 } }) },
    'ROGUE_SHATTER_AWA_T': { id: 'ROGUE_SHATTER_AWA_T', name: '필살의 준비', description: '방어를 5 얻습니다. 스킬 사용 후, 상대방의 분쇄 만큼의 추적을 얻습니다.', cost: { echoRemnants: 100 }, replaces: { type: PatternType.AWAKENING, face: CoinFace.TAILS }, effect: (p, e): AbilityEffect => ({ defense: 5, status: { type: StatusEffectType.PURSUIT, value: (e.statusEffects.SHATTER || 0), target: 'player' } }) },
  },
  [CharacterClass.TANK]: {},
  [CharacterClass.MAGE]: {},
};

const UNDEFINED_ABILITY = {
  name: `미정의`,
  description: "효과 없음.",
  effect: () => ({}),
};

export const getPlayerAbility = (playerClass: CharacterClass, acquiredSkills: string[], type: PatternType, face?: CoinFace) => {
    const acquiredSkillId = acquiredSkills.find(skillId => {
      const skillDef = playerSkillUnlocks[playerClass]?.[skillId];
      return skillDef && skillDef.replaces.type === type && skillDef.replaces.face === face;
    });

    if (acquiredSkillId) {
      const upgrade = playerSkillUnlocks[playerClass]?.[acquiredSkillId];
      if (upgrade) return upgrade;
    }

    const baseAbilitySet = playerAbilities[playerClass]?.[type];
    if (face && baseAbilitySet?.[face as CoinFace]) {
      return baseAbilitySet[face as CoinFace];
    }
    if (baseAbilitySet && !face && baseAbilitySet.description) { // For UNIQUE, AWAKENING
      return baseAbilitySet;
    }

    return UNDEFINED_ABILITY;
};
