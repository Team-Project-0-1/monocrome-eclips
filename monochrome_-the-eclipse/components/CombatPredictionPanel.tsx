import React from 'react';
import { CombatPrediction } from '../types';
import { Shield, Swords, ArrowRight } from 'lucide-react';

interface CombatPredictionPanelProps {
  prediction: CombatPrediction | null;
}

const CombatPredictionPanel: React.FC<CombatPredictionPanelProps> = ({ prediction }) => {
  if (!prediction) {
    return (
      <div className="p-3 bg-gray-800/50 text-gray-400 text-center rounded-lg min-h-[80px] flex flex-col items-center justify-center text-sm border-2 border-dashed border-gray-600">
        <div className="text-xs uppercase tracking-wider mb-1">전투 예측</div>
        <p className="text-xs">족보 선택 시 결과 표시</p>
      </div>
    );
  }

  const { player, enemy, damageToPlayer, damageToEnemy } = prediction;

  return (
    <div className="bg-gray-800/80 text-white rounded-lg border border-gray-600 overflow-hidden">
      {/* Compact Battle Preview */}
      <div className="px-3 py-2 bg-gray-700/50 border-b border-gray-600">
        <div className="text-xs uppercase tracking-wider text-center text-gray-300">전투 예측</div>
      </div>

      {/* Damage Exchange */}
      <div className="p-3">
        <div className="flex items-center justify-between gap-4">
          {/* Player Damage */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 mb-1">
              <Swords size={14} className="text-green-400" />
              <span className="text-xs text-gray-300">공격</span>
            </div>
            <div className="text-lg font-bold text-green-400">{damageToEnemy}</div>
          </div>

          {/* VS Indicator */}
          <div className="flex flex-col items-center">
            <ArrowRight size={16} className="text-gray-500 mb-1" />
            <div className="text-xs text-gray-400">vs</div>
          </div>

          {/* Enemy Damage */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs text-gray-300">피해</span>
              <Shield size={14} className="text-red-400" />
            </div>
            <div className="text-lg font-bold text-red-400">{damageToPlayer}</div>
          </div>
        </div>

        {/* Power Summary */}
        <div className="mt-3 pt-2 border-t border-gray-700">
          <div className="flex justify-center gap-4 text-xs">
            <span className="text-blue-400">방어 {player.defense.total}</span>
            <span className="text-gray-500">•</span>
            <span className="text-green-400">공격 {player.attack.total}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CombatPredictionPanel;