import React from 'react';
import { CombatPrediction } from '../types';

interface CombatPredictionPanelProps {
  prediction: CombatPrediction | null;
}

const CombatPredictionPanel: React.FC<CombatPredictionPanelProps> = ({ prediction }) => {
  if (!prediction) {
    return (
      <div className="p-4 bg-gray-700 text-gray-400 text-center rounded-lg min-h-[96px] flex items-center justify-center text-sm">
        족보를 선택하여 결과를 예측하세요.
      </div>
    );
  }

  const { player, enemy, damageToPlayer, damageToEnemy } = prediction;

  const renderSection = (title: string, data: { formula: string; total: number }, color: string) => (
    <>
      <div className={`md:col-span-2 text-center my-1`}>
        <span className={`font-semibold text-${color}-400`}>{title}</span>
      </div>
      <div className="text-left text-sm text-gray-300 truncate" title={data.formula}>
        식: <span className={`text-yellow-300`}>{data.formula}</span>
      </div>
      <div className="text-right">
        총합: <span className={`font-bold text-lg text-${color}-300`}>{data.total}</span>
      </div>
    </>
  );

  return (
    <div className="p-4 bg-gray-700 text-white rounded-lg grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-sm shadow-inner">
      {renderSection('나의 공격', player.attack, 'green')}
      {renderSection('나의 방어', player.defense, 'blue')}
      
      <div className="md:col-span-2 border-b border-gray-600/50 my-2"></div>

      {renderSection('적의 공격', enemy.attack, 'red')}
      {renderSection('적의 방어', enemy.defense, 'gray')}
      
      <div className="md:col-span-2 border-b border-gray-600 my-2"></div>
      
      <div className="text-left text-red-400 font-bold text-base">
        예상 받는 피해: {damageToPlayer}
      </div>
      <div className="text-right text-green-400 font-bold text-base">
        예상 가하는 피해: {damageToEnemy}
      </div>
    </div>
  );
};

export default CombatPredictionPanel;
