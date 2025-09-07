import React from 'react';
import { PlayerCharacter, EnemyCharacter, StatusEffectType } from '../types';

interface EnhancedStatusEffectDisplayProps {
  effects: PlayerCharacter["statusEffects"] | EnemyCharacter["statusEffects"];
}

const effectConfig: {
  [key in StatusEffectType]?: {
    icon: string;
    name: string;
    color: string;
    description: string;
    isBuff: boolean;
  };
} = {
  [StatusEffectType.AMPLIFY]: { icon: "⚡", name: "증폭", color: "bg-yellow-500 border-yellow-700 text-yellow-100", description: "다음 공격력 증가", isBuff: true },
  [StatusEffectType.RESONANCE]: { icon: "〰️", name: "공명", color: "bg-purple-500 border-purple-700 text-purple-100", description: "2턴 후, 중첩된 수치만큼 고정 피해", isBuff: false },
  [StatusEffectType.MARK]: { icon: "🎯", name: "표식", color: "bg-orange-500 border-orange-700 text-orange-100", description: "추가 피해를 받음", isBuff: false },
  [StatusEffectType.BLEED]: { icon: "🩸", name: "출혈", color: "bg-red-600 border-red-800 text-red-100", description: "피격 시, 중첩만큼 (최대 체력의 5%) 피해를 반복해서 받고, 수치 1 감소", isBuff: false },
  [StatusEffectType.COUNTER]: { icon: "🛡️", name: "반격", color: "bg-blue-500 border-blue-700 text-blue-100", description: "공격받을 시 반격", isBuff: true },
  [StatusEffectType.SHATTER]: { icon: "💔", name: "분쇄", color: "bg-gray-500 border-gray-700 text-gray-100", description: "방어력 감소", isBuff: false },
  [StatusEffectType.CURSE]: { icon: "☠️", name: "저주", color: "bg-indigo-500 border-indigo-700 text-indigo-100", description: "지속 피해", isBuff: false },
  [StatusEffectType.SEAL]: { icon: "🔒", name: "봉인", color: "bg-slate-500 border-slate-700 text-slate-100", description: "중첩당 공격력 15% 감소", isBuff: false },
  [StatusEffectType.PURSUIT]: { icon: "🐾", name: "추적", color: "bg-orange-600 border-orange-800 text-orange-100", description: "턴 종료 시, 수치만큼 피해를 주고 일부를 잃습니다. (최대 10)", isBuff: true },
};

const EnhancedStatusEffectDisplay: React.FC<EnhancedStatusEffectDisplayProps> = ({ effects }) => {
  const activeEffects = Object.entries(effects).filter(([, value]) => value && value > 0);

  if (activeEffects.length === 0) {
    return <div className="text-xs text-gray-400 italic py-2 text-center">활성 효과 없음</div>;
  }

  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-gray-300 mb-1">상태 효과</div>
      <div className="flex flex-wrap gap-2">
        {activeEffects.map(([type, value]) => {
          const config = effectConfig[type as StatusEffectType];
          if (!config) return null;
          return (
            <div
              key={type}
              className={`px-2 py-1 rounded-md border text-xs shadow-sm transition-all duration-200 hover:scale-105 ${config.color}`}
              title={config.description}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-base">{config.icon}</span>
                <div className="leading-tight">
                  <div className="font-semibold">{config.name}</div>
                  <div className="flex items-center gap-0.5">
                    <span className="font-bold text-sm">{value}</span>
                    {config.isBuff ? (
                      <span className="text-green-300">↑</span>
                    ) : (
                      <span className="text-red-300">↓</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EnhancedStatusEffectDisplay;