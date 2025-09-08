import React, { useMemo } from 'react';
import { PlayerCharacter, EnemyCharacter, EnemyIntent, StatusEffectType, LucideIcon, CharacterClass } from '../types';
import HealthBar from './HealthBar';
import EnhancedStatusEffectDisplay from './EnhancedStatusEffectDisplay';
import { Heart, Swords, Shield, AlertTriangle, Zap, Target, ShieldCheck, Ghost, Star, Skull, Square } from 'lucide-react';

interface CharacterStatusProps {
  character: PlayerCharacter | EnemyCharacter;
  isPlayer?: boolean;
}

const playerIcons: { [key in CharacterClass]: LucideIcon } = {
  [CharacterClass.WARRIOR]: Zap,
  [CharacterClass.ROGUE]: Target,
  [CharacterClass.TANK]: ShieldCheck,
  [CharacterClass.MAGE]: Ghost,
};

const monsterIcons: { [key: string]: LucideIcon } = {
  marauder1: Swords,
  marauder2: Shield,
  infectedDog: Skull,
  marauderLeader: Star,
  lumenReaper: Ghost,
  shadowWraith: Ghost,
  doppelganger: Square,
  unpleasantCube: Square,
  entity162: Skull,
  chimera: Star,
};

const CharacterStatus: React.FC<CharacterStatusProps> = ({ character, isPlayer = false }) => {
  const getIcon = () => {
    if (isPlayer) {
      const pc = character as PlayerCharacter;
      return playerIcons[pc.class] || Heart;
    } else {
      const ec = character as EnemyCharacter;
      return monsterIcons[ec.key] || Skull;
    }
  };

  const Icon = getIcon();

  const currentHp = Number(character.currentHp) || 0;
  const maxHp = Number(character.maxHp) || 1;
  const baseDef = Number(character.baseDef) || 0;
  const temporaryDefense = Number(character.temporaryDefense) || 0;
  
  const baseAtk = Number(character.baseAtk) || 0;

  const containerClass = isPlayer
    ? "bg-gray-800 border-blue-700 text-blue-100"
    : "bg-gray-800 border-red-700 text-red-100";
  
  const iconBgClass = isPlayer ? "bg-blue-700" : "bg-red-700";

  const effectsToShow = useMemo(() => {
    const allEffects = { ...character.statusEffects };
    const resonanceEffect = (character as EnemyCharacter).temporaryEffects?.resonance;
    
    if (!isPlayer && resonanceEffect && typeof resonanceEffect.value === 'number' && resonanceEffect.value > 0) {
        allEffects[StatusEffectType.RESONANCE] = (allEffects[StatusEffectType.RESONANCE] || 0) + resonanceEffect.value;
    }
    return allEffects;
  }, [character.statusEffects, (character as EnemyCharacter).temporaryEffects, isPlayer]);
  
  const frenzyEffect = isPlayer ? (character as PlayerCharacter).temporaryEffects?.frenzy : undefined;

  return (
    <div className={`p-4 rounded-lg border-2 shadow-xl ${containerClass} relative`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-full ${iconBgClass} shadow-md`}>
            <Icon className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-xl">{character.name}</h3>
            {"title" in character && character.title && (
              <p className="text-xs opacity-80 font-medium">
                {character.title}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mb-3">
        <HealthBar current={currentHp} max={maxHp} isPlayer={isPlayer} />
      </div>

      {frenzyEffect && (
          <div className="mb-3 p-2 rounded-md bg-red-800 border border-red-600 text-center animate-pulse">
              <p className="font-bold text-white">🔥 광분! ({frenzyEffect.duration - 1}턴 남음)</p>
          </div>
      )}

      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
        <div className={`p-3 rounded-md shadow bg-opacity-70 ${isPlayer ? 'bg-blue-900' : 'bg-red-900'}`}>
          <div className={`flex items-center gap-2 text-xs opacity-80 mb-1 ${isPlayer ? 'text-blue-300' : 'text-red-300'}`}>
            <Swords size={14} />
            <span>기본 공격</span>
          </div>
          <p className="font-bold text-2xl text-center">{baseAtk}</p>
        </div>
        <div className={`p-3 rounded-md shadow bg-opacity-70 ${isPlayer ? 'bg-blue-900' : 'bg-red-900'}`}>
          <div className={`flex items-center gap-2 text-xs opacity-80 mb-1 ${isPlayer ? 'text-blue-300' : 'text-red-300'}`}>
            <Shield size={14} />
            <span>방어력</span>
          </div>
          <p className="font-bold text-2xl text-center">
            {baseDef + temporaryDefense}
            {temporaryDefense > 0 && <span className="text-xs text-blue-300 ml-1">(+{temporaryDefense})</span>}
          </p>
        </div>
      </div>
      
      <div className="min-h-[4rem]">
        <EnhancedStatusEffectDisplay effects={effectsToShow} />
      </div>
    </div>
  );
};

export default CharacterStatus;