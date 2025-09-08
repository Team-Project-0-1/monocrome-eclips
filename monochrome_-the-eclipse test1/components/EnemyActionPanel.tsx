import React, { useMemo } from 'react';
import { Coin, DetectedPattern, EnemyCharacter, PatternType, CoinFace, EnemyIntent } from '../types';
import { monsterPatterns } from '../dataMonsters';
import { Swords, Shield, Eye } from 'lucide-react';

interface EnemyActionPanelProps {
  enemy: EnemyCharacter | null;
  intent: EnemyIntent | null;
}

const patternTypeNames: { [key in PatternType]: string } = {
  [PatternType.PAIR]: "2연",
  [PatternType.TRIPLE]: "3연",
  [PatternType.QUAD]: "4연",
  [PatternType.PENTA]: "5연",
  [PatternType.UNIQUE]: "유일",
  [PatternType.AWAKENING]: "각성",
};
const coinFaceNames: { [key in CoinFace]: string } = {
  [CoinFace.HEADS]: "앞면",
  [CoinFace.TAILS]: "뒷면",
};

const EnemyActionPanel: React.FC<EnemyActionPanelProps> = ({ enemy, intent }) => {
  if (!enemy || !intent) return null;

  const patterns = enemy.detectedPatterns || [];
  const coins = enemy.coins || [];

  const usedSkillDefs = useMemo(() => {
    if (!intent) return [];
    return intent.sourcePatternKeys.map(key => monsterPatterns[key]).filter(Boolean);
  }, [intent]);

  return (
    <div className="bg-gray-800 p-3 rounded-lg border-2 border-red-900/50 mb-4">
      <h3 className="text-center font-bold text-red-400 mb-3 flex items-center justify-center gap-2">
        <Eye className="w-5 h-5" />
        적의 행동
      </h3>

      <div className="p-3 mb-4 bg-gray-900/50 rounded-md text-center border border-gray-700">
        <p className="font-bold text-lg text-white">{intent.description}</p>
        <div className="flex justify-center items-center gap-4 text-sm mt-2 text-gray-300">
          {intent.damage > 0 && (
            <span className="flex items-center gap-1">
              <Swords size={16} className="text-red-400" />
              피해: {intent.damage}
            </span>
          )}
          {intent.defense > 0 && (
            <span className="flex items-center gap-1">
              <Shield size={16} className="text-blue-400" />
              방어: {intent.defense}
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-center gap-3 mb-4">
        {coins.map((coin) => (
          <div key={coin.id} className="relative text-center">
            <div
              className={`relative w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-xl shadow-md transition-transform hover:scale-110 ${
                coin.face === CoinFace.HEADS
                  ? "bg-red-500 border-red-300 text-white"
                  : "bg-blue-500 border-blue-300 text-white"
              }`}
            >
              {coin.face === CoinFace.HEADS ? (
                <Swords size={20} />
              ) : (
                <Shield size={20} />
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-1 max-h-32 overflow-y-auto pr-2">
        <h4 className="text-xs font-bold text-gray-400 mb-2 text-center">감지된 족보</h4>
        {patterns.length > 0 ? (
          patterns.map((p) => {
            const isUsed = usedSkillDefs.some(
              (skillDef) =>
                skillDef.type === p.type &&
                (!skillDef.face || skillDef.face === p.face)
            );
            return (
              <div
                key={p.id}
                className={`p-1.5 rounded-md bg-gray-700/60 text-sm flex justify-between items-center transition-all ${
                  isUsed ? 'ring-2 ring-yellow-400 shadow-lg' : ''
                }`}
              >
                <span className="font-semibold text-gray-300">
                  {patternTypeNames[p.type]}
                </span>
                <span className="text-xs text-gray-400">
                  {p.face ? coinFaceNames[p.face] : '특수'} x{p.count}
                </span>
              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-500 text-sm py-4">
            족보 없음
          </p>
        )}
      </div>
    </div>
  );
};

export default EnemyActionPanel;