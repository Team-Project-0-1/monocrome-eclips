import {
  MemoryUpgradeDataDefinition,
  MemoryUpgradeType,
} from "./types";


export const COIN_COUNT = 5;
export const TURN_COOLDOWN = 3;
export const STAGE_TURNS = 15;
export const MINIBOSS_TURN_RANGE = [7, 8];
export const BOSS_TURN = 15;
export const MAX_SKILLS = 12;


export const MEMORY_UPGRADE_DATA: { [key in MemoryUpgradeType]: MemoryUpgradeDataDefinition } = {
  maxHp: {
    name: "생명의 기억",
    description: "최대 체력을 5 증가시킵니다.",
    cost: (level: number) => 1 + level,
    effect: 5,
  },
  baseAtk: {
    name: "투쟁의 기억",
    description: "기본 공격력을 1 증가시킵니다.",
    cost: (level: number) => 1 + level,
    effect: 1,
  },
  baseDef: {
    name: "수호의 기억",
    description: "기본 방어력을 1 증가시킵니다.",
    cost: (level: number) => 1 + level,
    effect: 1,
  },
} as const;