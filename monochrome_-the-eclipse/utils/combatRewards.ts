import { EnemyCharacter, PlayerCharacter } from '../types';
import { playerSkillUnlocks } from '../dataSkills';
import { patternUpgrades } from '../dataUpgrades';
import { faceLabel, patternLabels } from './combatPresentation';
import { MAX_SKILLS } from '../constants';

export interface CombatRewardChoice {
  id: string;
  label: string;
  description: string;
  rewards: {
    echoRemnants?: number;
    senseFragments?: number;
    memoryPieces?: number;
    reserveCoin?: boolean;
  };
  skillId?: string;
  passiveId?: string;
}

const getSkillDraftChoices = (
  player: PlayerCharacter | null,
  draftCount: number,
): CombatRewardChoice[] => {
  if (!player || player.acquiredSkills.length >= MAX_SKILLS) return [];

  const skillPool = Object.values(playerSkillUnlocks[player.class] ?? {})
    .filter(skill => !player.acquiredSkills.includes(skill.id));

  if (skillPool.length === 0) return [];

  return skillPool
    .sort(() => Math.random() - 0.5)
    .slice(0, draftCount)
    .map(skill => ({
      id: `skill_${skill.id}`,
      label: `기술 각인: ${skill.name}`,
      description: `${patternLabels[skill.replaces.type]} ${faceLabel(skill.replaces.face)} 기술을 대체합니다. ${skill.description}`,
      rewards: {},
      skillId: skill.id,
    }));
};

const getPassiveDraftChoices = (
  player: PlayerCharacter | null,
  unlockedPatterns: string[],
  draftCount: number,
): CombatRewardChoice[] => {
  if (!player) return [];

  const passivePool = Object.values(patternUpgrades[player.class] ?? {})
    .filter(passive => !unlockedPatterns.includes(passive.id));

  if (passivePool.length === 0) return [];

  return passivePool
    .sort(() => Math.random() - 0.5)
    .slice(0, draftCount)
    .map(passive => ({
      id: `passive_${passive.id}`,
      label: `패시브 각성: ${passive.name}`,
      description: passive.description,
      rewards: {},
      passiveId: passive.id,
    }));
};

export const createCombatRewardChoices = (
  enemy: EnemyCharacter,
  player: PlayerCharacter | null,
  unlockedPatterns: string[] = [],
): CombatRewardChoice[] => {
  const isElite = enemy.tier === 'miniboss';
  const isBoss = enemy.tier === 'boss';

  const baseEcho = isBoss ? 32 : isElite ? 22 : 12;
  const baseSense = isBoss ? 3 : isElite ? 2 : 1;
  const baseMemory = isBoss ? 3 : isElite ? 2 : 1;
  const skillDraftCount = isBoss || isElite ? 2 : 1;
  const passiveDraftCount = isBoss ? 3 : isElite ? 2 : 0;

  const choices: CombatRewardChoice[] = [
    {
      id: 'balanced_cache',
      label: '전리품 회수',
      description: '에코, 감각, 기억을 고르게 확보합니다. 다음 선택지를 넓히는 안정 보상입니다.',
      rewards: { echoRemnants: baseEcho, senseFragments: baseSense, memoryPieces: baseMemory },
    },
    {
      id: 'sense_focus',
      label: '감각 증폭',
      description: '패턴 강화와 기술 해금에 필요한 감각 조각을 더 얻습니다.',
      rewards: { echoRemnants: Math.max(6, baseEcho - 6), senseFragments: baseSense + 2 },
    },
    {
      id: 'memory_focus',
      label: '기억 채집',
      description: '영구 성장 자원인 기억 조각을 더 확보합니다. 장기적으로 강해지는 선택입니다.',
      rewards: { echoRemnants: Math.max(4, baseEcho - 8), memoryPieces: baseMemory + 2 },
    },
    ...getSkillDraftChoices(player, skillDraftCount),
    ...getPassiveDraftChoices(player, unlockedPatterns, passiveDraftCount),
  ];

  if (isElite || isBoss) {
    choices.push({
      id: 'reserve_coin',
      label: '행운 동전 확보',
      description: '보상량은 낮지만 전투 중 교체할 수 있는 행운 동전을 얻습니다.',
      rewards: { echoRemnants: Math.max(4, Math.floor(baseEcho * 0.5)), reserveCoin: true },
    });
  }

  return choices;
};
