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
  },
  [CharacterClass.TANK]: {
    name: "곽장환",
    title: "손끝으로 바람을 읽는 자",
    hp: 75,
    baseAtk: 0,
    baseDef: 0,
    mainEffect: StatusEffectType.COUNTER,
    subEffect: StatusEffectType.SHATTER,
    innatePassives: ["반사", "정밀 누적"],
  },
  [CharacterClass.MAGE]: {
    name: "박재석",
    title: "영적인 시야를 보는 자",
    hp: 70,
    baseAtk: 0,
    baseDef: 0,
    mainEffect: StatusEffectType.CURSE,
    subEffect: StatusEffectType.SEAL,
    innatePassives: ["내면 침묵", "의지 절단"],
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
      name: "불괴",
      description: "첫 번째 동전을 잠그고, 반격 +3을 얻습니다.",
      cooldown: 3,
    },
    [CharacterClass.MAGE]: {
      name: "주문 배치",
      description: "첫 두 동전의 위치를 바꾸고, 적에게 저주 +2.",
      cooldown: 3,
    },
  };
