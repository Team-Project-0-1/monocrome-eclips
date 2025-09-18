import { CharacterClass, StatusEffectType } from "./types";

export const characterData = {
  [CharacterClass.WARRIOR]: {
    name: "김훈희",
    title: "공명회의 기술자",
    hp: 75,
    baseAtk: 0,
    baseDef: 0,
    mainEffect: StatusEffectType.AMPLIFY,
    subEffect: StatusEffectType.RESONANCE,
    innatePassives: ["전투 시작 시 증폭을 2 얻습니다."],
    sprite: "/sprites/characters/warrior.svg",
  },
  [CharacterClass.ROGUE]: {
    name: "신제우",
    title: "냄새로 추적하는 자",
    hp: 60,
    baseAtk: 0,
    baseDef: 0,
    mainEffect: StatusEffectType.PURSUIT,
    subEffect: StatusEffectType.BLEED,
    innatePassives: ["전투 시작 시 첫번째 동전은 반드시 앞면이 됩니다."],
    sprite: "/sprites/characters/rogue.svg",
  },
  [CharacterClass.TANK]: {
    name: "곽장환",
    title: "손끝으로 바람을 읽는 자",
    hp: 70,
    baseAtk: 0,
    baseDef: 0,
    mainEffect: StatusEffectType.COUNTER,
    subEffect: StatusEffectType.SHATTER,
    innatePassives: ["전투 시작 시 공격과 방어를 3 얻습니다."],
    sprite: "/sprites/characters/tank.svg",
  },
  [CharacterClass.MAGE]: {
    name: "박재석",
    title: "영적인 시야를 보는 자",
    hp: 65,
    baseAtk: 0,
    baseDef: 0,
    mainEffect: StatusEffectType.CURSE,
    subEffect: StatusEffectType.SEAL,
    innatePassives: ["5턴간 디버프 피해를 받지 않고 저장했다가, 5턴 후 누적된 피해를 한번에 받습니다."],
    sprite: "/sprites/characters/mage.svg",
  },
};

export const characterActiveSkills = {
    [CharacterClass.WARRIOR]: {
      name: "재조정",
      description: "모든 동전 배치를 초기화합니다. (재사용 5턴)",
      cooldown: 5,
    },
    [CharacterClass.ROGUE]: {
      name: "동전 뒤집기",
      description: "원하는 동전 하나를 뒤집습니다. (재사용 3턴)",
      cooldown: 3,
    },
    [CharacterClass.TANK]: {
      name: "위치 변경",
      description: "자신의 동전 2개의 위치를 서로 바꿉니다. (재사용 8턴)",
      cooldown: 8,
    },
    [CharacterClass.MAGE]: {
      name: "동전 고정",
      description: "1턴간 원하는 동전 1개를 고정 시킵니다. (재사용 3턴)",
      cooldown: 3,
    },
  };