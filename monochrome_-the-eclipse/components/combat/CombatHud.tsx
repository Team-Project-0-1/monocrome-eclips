import React from 'react';
import { Shield, Swords } from 'lucide-react';
import {
  CoinFace,
  EnemyCharacter,
  EnemyIntent,
  PlayerCharacter,
  StatusEffectType,
} from '../../types';
import {
  faceClass,
  faceLabel,
  getIntentPatternLabel,
  hpPercent,
  statusLabels,
} from '../../utils/combatPresentation';
import { effectConfig, effectIconPaths } from '../../dataEffects';
import { assetPath } from '../../utils/assetPath';

const getActiveStatuses = (character: PlayerCharacter | EnemyCharacter) => (
  Object.entries(character.statusEffects)
    .map(([key, value]) => ({ key: key as StatusEffectType, value }))
    .filter((entry): entry is { key: StatusEffectType; value: number } => (
      typeof entry.value === 'number' && entry.value !== 0
    ))
);

export const CombatStatusTray: React.FC<{
  character: PlayerCharacter | EnemyCharacter;
  side: 'player' | 'enemy';
}> = ({ character, side }) => {
  const statuses = getActiveStatuses(character);

  if (statuses.length === 0) {
    return null;
  }

  const visibleStatuses = statuses.slice(0, 5);

  return (
    <div className={`combat-foot-status-tray ${side}`} aria-label={`${character.name} active status effects`}>
      {visibleStatuses.map(status => {
        const config = effectConfig[status.key];
        const iconPath = effectIconPaths[status.key];
        const statusName = statusLabels[status.key] ?? config?.name ?? status.key;
        const toneClass = config?.isBuff ? 'is-buff' : 'is-debuff';

        return (
          <span key={status.key} className={`combat-status-pill ${toneClass}`} title={config?.description ?? statusName}>
            {iconPath ? (
              <img className="combat-status-icon-img" src={assetPath(iconPath)} alt="" loading="lazy" />
            ) : null}
            <span className="combat-status-text">
              <b>{statusName}</b>
              <em>{status.value}</em>
            </span>
          </span>
        );
      })}
      {statuses.length > visibleStatuses.length ? (
        <span className="combat-status-more">+{statuses.length - visibleStatuses.length}</span>
      ) : null}
    </div>
  );
};

export const CombatOverheadVitals: React.FC<{
  character: PlayerCharacter | EnemyCharacter;
  side: 'player' | 'enemy';
}> = ({ character, side }) => {
  const hp = hpPercent(character.currentHp, character.maxHp);
  const hpLabel = `${character.currentHp}/${character.maxHp}`;

  return (
    <aside className={`combat-overhead-vitals ${side}`} aria-label={`${character.name} HP`}>
      <div className="combat-overhead-head">
        {side === 'enemy' ? (
          <>
            <b>{hpLabel}</b>
            <span className="combat-overhead-name">{character.name}</span>
          </>
        ) : (
          <>
            <span className="combat-overhead-name">{character.name}</span>
            <b>{hpLabel}</b>
          </>
        )}
      </div>
      <div className="combat-hp-track combat-overhead-hp-track">
        <div className="combat-hp-fill" style={{ width: `${hp}%` }} />
      </div>
    </aside>
  );
};

export const EnemyCoinStrip: React.FC<{ enemy: EnemyCharacter; intent: EnemyIntent | null }> = ({ enemy, intent }) => {
  const sourceIndices = intent?.sourceCoinIndices ?? [];
  const patternLabel = getIntentPatternLabel(intent, enemy);
  const actionLabel = intent?.damage
    ? `공격 ${intent.damage}`
    : intent?.defense
      ? `방어 ${intent.defense}`
      : '대기';

  return (
    <div className="combat-enemy-strip" aria-label="enemy coins">
      <div className="combat-enemy-strip-head">
        <b>{patternLabel ? `${patternLabel} / ${actionLabel}` : actionLabel}</b>
      </div>
      <div className="combat-mini-coins">
        {enemy.coins.map((coin, index) => (
          <div
            key={coin.id}
            className={`combat-mini-coin ${faceClass(coin.face)} ${sourceIndices.includes(index) ? 'is-used' : ''}`}
            title={`적 동전 ${index + 1}: ${faceLabel(coin.face)}`}
          >
            {coin.face === CoinFace.HEADS ? <Swords size={16} /> : <Shield size={16} />}
          </div>
        ))}
      </div>
    </div>
  );
};
