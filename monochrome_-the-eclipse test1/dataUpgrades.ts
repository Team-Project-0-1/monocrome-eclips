import {
  PatternUpgradeDefinition,
  CharacterClass,
} from "./types";

export const patternUpgrades: { [key in CharacterClass]?: { [id: string]: PatternUpgradeDefinition } } = {
  [CharacterClass.WARRIOR]: {
    'WARRIOR_PASSIVE_LOSE_HP_GAIN_AMP': { id: 'WARRIOR_PASSIVE_LOSE_HP_GAIN_AMP', name: "소음 유발 장치", description: "매 턴 체력을 1 잃고, 증폭을 1 얻습니다.", cost: { senseFragments: 3 } },
    'WARRIOR_PASSIVE_NO_ATTACK_GAIN_AMP': { id: 'WARRIOR_PASSIVE_NO_ATTACK_GAIN_AMP', name: "A S M R", description: "한 턴 동안 공격을 하지 않으면 증폭을 2 얻습니다.", cost: { senseFragments: 4 } },
    'WARRIOR_PASSIVE_AMP_GIVES_DEF': { id: 'WARRIOR_PASSIVE_AMP_GIVES_DEF', name: "공방일체", description: "이제 증폭으로 추가 방어력을 같이 얻습니다.", cost: { senseFragments: 4 } },
    'WARRIOR_PASSIVE_AMP_BONUS_UP': { id: 'WARRIOR_PASSIVE_AMP_BONUS_UP', name: "초진동 증폭 장치 : E.C.H.O", description: "이제 증폭으로 얻는 추가 능력치가 1 증가합니다.", cost: { senseFragments: 5 } },
    'WARRIOR_PASSIVE_MAX_AMP_20': { id: 'WARRIOR_PASSIVE_MAX_AMP_20', name: "진동 충전지", description: "이제 증폭 상한치가 20 까지 증가합니다.", cost: { senseFragments: 5 } },
    'WARRIOR_PASSIVE_RESONANCE_DURATION': { id: 'WARRIOR_PASSIVE_RESONANCE_DURATION', name: "공명 지속 장치", description: "적에게 부여된 공명의 지속 시간이 3 턴으로 늘어난다.", cost: { senseFragments: 3 } },
    'WARRIOR_PASSIVE_HEADS_GIVE_RESONANCE': { id: 'WARRIOR_PASSIVE_HEADS_GIVE_RESONANCE', name: "공명 전이 발생기", description: "매 턴, 앞면이 3 이상일 경우 적에게 공명을 1 부여합니다.", cost: { senseFragments: 4 } },
    'WARRIOR_PASSIVE_ATTACKS_GIVE_RESONANCE': { id: 'WARRIOR_PASSIVE_ATTACKS_GIVE_RESONANCE', name: "자가 공명 기능", description: "이번 전투에 공격 스킬을 3 번 사용할 때 마다 공명을 5 부여합니다.", cost: { senseFragments: 5 } },
    'WARRIOR_PASSIVE_RESONANCE_HEAL': { id: 'WARRIOR_PASSIVE_RESONANCE_HEAL', name: "비명 수집가", description: "공명으로 준 피해의 20% 만큼 체력을 회복합니다.", cost: { senseFragments: 4 } },
    'WARRIOR_PASSIVE_START_RESONANCE': { id: 'WARRIOR_PASSIVE_START_RESONANCE', name: "공명 동기화", description: "전투 시작 시 상대방에게 공명을 2 부여한 상태로 시작합니다.", cost: { senseFragments: 4 } },
    'WARRIOR_PASSIVE_KILL_MAX_HP': { id: 'WARRIOR_PASSIVE_KILL_MAX_HP', name: "피 주머니", description: "적을 처치할 때 마다 최대 체력을 5 얻습니다.", cost: { senseFragments: 4 } },
    'WARRIOR_PASSIVE_BLEED_GIVES_ATK': { id: 'WARRIOR_PASSIVE_BLEED_GIVES_ATK', name: "고통과 쾌락", description: "자신의 출혈 수치만큼 추가 공격력을 1 얻습니다.", cost: { senseFragments: 5 } },
    'WARRIOR_PASSIVE_HIGH_AMP_GIVES_BLEED': { id: 'WARRIOR_PASSIVE_HIGH_AMP_GIVES_BLEED', name: "초진동 돌풍", description: "증폭이 5 이상일 때 매 턴 출혈을 1 얻습니다.", cost: { senseFragments: 3 } },
    'WARRIOR_PASSIVE_SHARE_BLEED_DMG': { id: 'WARRIOR_PASSIVE_SHARE_BLEED_DMG', name: "비명 이중주", description: "자신의 출혈 피해을 적에게도 전달합니다.", cost: { senseFragments: 5 } },
    'WARRIOR_PASSIVE_LOW_HP_GAIN_AMP': { id: 'WARRIOR_PASSIVE_LOW_HP_GAIN_AMP', name: "고행", description: "체력이 50% 이하면 증폭을 3 얻습니다.", cost: { senseFragments: 4 } },
  },
  [CharacterClass.ROGUE]: {
    // Base Passives
    'ROGUE_P_ADRENALINE': { id: "ROGUE_P_ADRENALINE", name: "아드레날린", description: "앞면 확률이 10% 증가합니다.", cost: { senseFragments: 3 } },
    'ROGUE_P_HUNT_FLOW': { id: "ROGUE_P_HUNT_FLOW", name: "사냥의 흐름", description: "추적이 6 이상인 경우, 다음 턴 뒷면 1 개를 앞면으로 바꿉니다. 이 효과는 한 전투 당 한 번만 사용할 수 있습니다.", cost: { senseFragments: 4 } },
    'ROGUE_P_DUAL_WIELD': { id: "ROGUE_P_DUAL_WIELD", name: "쌍권총 마스터", description: "앞으로 추적을 2 번 발동하고, 수치를 6 잃습니다.", cost: { senseFragments: 5 } },
    'ROGUE_P_KILLER_MINDSET': { id: "ROGUE_P_KILLER_MINDSET", name: "킬러의 마음가짐", description: "피격 시 추적을 2 얻습니다.", cost: { senseFragments: 4 } },
    'ROGUE_P_GUN_KATA': { id: "ROGUE_P_GUN_KATA", name: "건 카타", description: "턴 시작 시 나온 앞면 개수당 추적을 얻습니다.", cost: { senseFragments: 5 } },
    // Bleed Synergy Passives
    'ROGUE_P_HUNT_INSTINCT': { id: "ROGUE_P_HUNT_INSTINCT", name: "사냥 본능", description: "추적 피해를 줄 때 마다 출혈을 1 부여합니다.", cost: { senseFragments: 3 } },
    'ROGUE_P_WOUND_TEAR': { id: "ROGUE_P_WOUND_TEAR", name: "상처 찢기", description: "출혈 피해를 2 번 반복합니다.", cost: { senseFragments: 4 } },
    'ROGUE_P_LIFE_STEAL': { id: "ROGUE_P_LIFE_STEAL", name: "생명력 강탈", description: "출혈 피해의 10% 만큼 체력을 회복합니다.", cost: { senseFragments: 4 } },
    'ROGUE_P_BLOOD_BULLET': { id: "ROGUE_P_BLOOD_BULLET", name: "피로 벼려낸 탄환", description: "출혈 피해를 줄 때 마다 추적을 1 얻습니다.", cost: { senseFragments: 5 } },
    'ROGUE_P_BLOOD_FESTIVAL': { id: "ROGUE_P_BLOOD_FESTIVAL", name: "피의 축제", description: "상대방의 출혈이 6 이상인 경우 추가 피해를 2 줍니다.", cost: { senseFragments: 5 } },
    // Shatter Synergy Passives
    'ROGUE_P_WEAKNESS_TRACK': { id: "ROGUE_P_WEAKNESS_TRACK", name: "약점 추적", description: "상대방의 방어가 5 이하인 경우, 스킬 피해가 30%(소수점 버림) 만큼 증가합니다.", cost: { senseFragments: 4 } },
    'ROGUE_P_STENCH_SPRAYER': { id: "ROGUE_P_STENCH_SPRAYER", name: "악취 분사기", description: "매 턴 뒷면 개수만큼 분쇄를 부여합니다.", cost: { senseFragments: 3 } },
    'ROGUE_P_BULLETPROOF_VEST': { id: "ROGUE_P_BULLETPROOF_VEST", name: "방탄 조끼", description: "얻는 방어가 2 증가합니다.", cost: { senseFragments: 5 } },
    'ROGUE_P_SCENT_SCOPE': { id: "ROGUE_P_SCENT_SCOPE", name: "채취 추적 조준경", description: "부여하는 분쇄가 1 증가합니다.", cost: { senseFragments: 4 } },
    'ROGUE_P_SMOKE_BOMB': { id: "ROGUE_P_SMOKE_BOMB", name: "연막탄", description: "상대방의 분쇄가 5 이상인 경우, 방어를 3 얻습니다.", cost: { senseFragments: 4 } },
  },
  [CharacterClass.TANK]: {
    flexibility: {
      id: "flexibility",
      name: "정밀 타격",
      description: "[분쇄] 상태인 적에게 반격 시, 피해량 +2",
      cost: { senseFragments: 3 },
    },
  },
  [CharacterClass.MAGE]: {
    oblivion: {
      id: "oblivion",
      name: "망각",
      description: "적의 [저주] 수치가 5 이상일 경우, 공격 시 봉인 +1",
      cost: { senseFragments: 4 },
    },
  },
};
