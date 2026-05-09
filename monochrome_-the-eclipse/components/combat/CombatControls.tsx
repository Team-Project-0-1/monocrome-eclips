import React, { useMemo } from 'react';
import { HelpCircle, Shield, Swords } from 'lucide-react';
import { characterActiveSkills } from '../../dataCharacters';
import { getPlayerAbility } from '../../dataSkills';
import {
  CharacterClass,
  Coin,
  CoinFace,
  DetectedPattern,
  PatternType,
  PlayerCharacter,
} from '../../types';
import {
  faceClass,
  faceLabel,
  patternLabels,
  patternOrder,
  PatternGroup,
} from '../../utils/combatPresentation';
import { assetPath } from '../../utils/assetPath';
import EffectSummary from '../EffectSummary';
import { summarizeAbility } from '../../utils/effectSummary';

const activeSkillIconPaths: Record<CharacterClass, string> = {
  [CharacterClass.WARRIOR]: 'assets/icons/combat/active-warrior-reroll.png',
  [CharacterClass.ROGUE]: 'assets/icons/combat/active-rogue-flip.png',
  [CharacterClass.TANK]: 'assets/icons/combat/active-tank-lock.png',
  [CharacterClass.MAGE]: 'assets/icons/combat/active-mage-swap.png',
};

const patternIconPaths: Record<PatternType, string> = {
  [PatternType.PAIR]: 'assets/icons/combat/pattern-pair.png',
  [PatternType.TRIPLE]: 'assets/icons/combat/pattern-triple.png',
  [PatternType.QUAD]: 'assets/icons/combat/pattern-quad.png',
  [PatternType.PENTA]: 'assets/icons/combat/pattern-penta.png',
  [PatternType.UNIQUE]: 'assets/icons/combat/pattern-unique.png',
  [PatternType.AWAKENING]: 'assets/icons/combat/pattern-awakening.png',
};

const usePatternGroups = (patterns: DetectedPattern[]) => {
  return useMemo(() => {
    const map = new Map<string, PatternGroup>();

    patterns.forEach(pattern => {
      const key = `${pattern.type}-${pattern.face ?? 'none'}`;
      const existing = map.get(key);
      if (existing) {
        existing.patterns.push(pattern);
      } else {
        map.set(key, { type: pattern.type, face: pattern.face, patterns: [pattern] });
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      const byType = patternOrder[a.type] - patternOrder[b.type];
      if (byType !== 0) return byType;
      return faceLabel(a.face).localeCompare(faceLabel(b.face));
    });
  }, [patterns]);
};

interface PatternRailProps {
  patterns: DetectedPattern[];
  selectedPatterns: DetectedPattern[];
  usedCoinIndices: number[];
  player: PlayerCharacter;
  onToggle: (type: PatternType, face?: CoinFace) => void;
}

export const PatternRail: React.FC<PatternRailProps> = ({
  patterns,
  selectedPatterns,
  usedCoinIndices,
  player,
  onToggle,
}) => {
  const groups = usePatternGroups(patterns);
  const selectedIds = useMemo(() => new Set(selectedPatterns.map(pattern => pattern.id)), [selectedPatterns]);
  const selectedUsedIndices = useMemo(() => new Set(selectedPatterns.flatMap(pattern => pattern.indices)), [selectedPatterns]);

  if (groups.length === 0) {
    return (
      <div className="combat-pattern-empty">
        조합 없음
      </div>
    );
  }

  return (
    <div className="combat-pattern-rail" aria-label="available patterns">
      {groups.map(group => {
        const selectedCount = selectedPatterns.filter(pattern => pattern.type === group.type && pattern.face === group.face).length;
        const isAvailable = group.patterns.some(pattern => (
          !selectedIds.has(pattern.id) &&
          !pattern.indices.some(index => selectedUsedIndices.has(index))
        ));
        const disabled = selectedCount === 0 && !isAvailable;
        const ability = getPlayerAbility(player.class, player.acquiredSkills, group.type, group.face);
        const summary = summarizeAbility(ability);
        const selectedClass = selectedCount > 0 ? 'is-selected' : '';
        const cappedClass = selectedCount >= 2 || (selectedCount > 0 && !isAvailable) ? 'is-capped' : '';

        return (
          <button
            key={`${group.type}-${group.face ?? 'none'}`}
            type="button"
            className={`combat-pattern-chip ${faceClass(group.face)} ${selectedClass} ${cappedClass}`}
            disabled={disabled}
            aria-pressed={selectedCount > 0}
            onClick={() => onToggle(group.type, group.face)}
            title={ability.description}
            data-testid={`combat-pattern-${group.type.toLowerCase()}-${group.face?.toLowerCase() ?? 'mixed'}`}
          >
            <img
              className="combat-pattern-icon-img"
              src={assetPath(patternIconPaths[group.type])}
              alt=""
              loading="lazy"
              aria-hidden="true"
            />
            <span className="combat-pattern-text">
              <EffectSummary summary={summary} compact hideHeadline chipLimit={3} className="combat-pattern-summary" />
              <strong>{ability.name}</strong>
              <span className="combat-pattern-kind">{patternLabels[group.type]} {faceLabel(group.face)}</span>
              <span>{selectedCount > 0 ? `선택 ${selectedCount}` : `후보 ${group.patterns.length}`}</span>
            </span>
          </button>
        );
      })}
      {usedCoinIndices.length > 0 ? <span className="combat-used-count">{usedCoinIndices.length}개 사용 예정</span> : null}
    </div>
  );
};

interface ActiveSkillPillProps {
  player: PlayerCharacter;
  disabled: boolean;
  onClick: () => void;
}

export const ActiveSkillPill: React.FC<ActiveSkillPillProps> = ({ player, disabled, onClick }) => {
  const skill = characterActiveSkills[player.class];
  if (!skill) return null;

  const onCooldown = player.activeSkillCooldown > 0;
  const isDisabled = disabled || onCooldown;

  return (
    <button
      type="button"
      className="combat-active-skill"
      disabled={isDisabled}
      onClick={onClick}
      title={skill.description}
    >
      <img
        className="combat-active-skill-img"
        src={assetPath(activeSkillIconPaths[player.class])}
        alt=""
        loading="lazy"
        aria-hidden="true"
      />
      <span className="combat-active-skill-copy">
        <strong>{skill.name}</strong>
        <EffectSummary text={skill.description} compact hideHeadline chipLimit={2} />
      </span>
      <b>{onCooldown ? player.activeSkillCooldown : 'OK'}</b>
    </button>
  );
};

interface ReserveCoinStripProps {
  reserveCoins: Coin[];
  isSwapping: boolean;
  selectedIndex: number | null;
  testMode: boolean;
  onFlip: (index: number) => void;
  onSwap: (index: number) => void;
}

export const ReserveCoinStrip: React.FC<ReserveCoinStripProps> = ({
  reserveCoins,
  isSwapping,
  selectedIndex,
  testMode,
  onFlip,
  onSwap,
}) => {
  if (reserveCoins.length === 0) {
    return <div className="combat-reserve-empty">행운 없음</div>;
  }

  return (
    <div className="combat-reserve-strip" aria-label="reserve coins">
      {reserveCoins.map((coin, index) => (
        <div key={coin.id} className="combat-reserve-item">
          <button
            type="button"
            className={`combat-mini-coin ${faceClass(coin.face)} ${selectedIndex === index ? 'is-used' : ''}`}
            disabled={!testMode}
            onClick={() => onFlip(index)}
            title={`행운 동전 ${index + 1}`}
          >
            {coin.face === null ? <HelpCircle size={15} /> : coin.face === CoinFace.HEADS ? <Swords size={15} /> : <Shield size={15} />}
          </button>
          <button type="button" className="combat-swap-button" disabled={isSwapping} onClick={() => onSwap(index)}>
            교체
          </button>
        </div>
      ))}
    </div>
  );
};
