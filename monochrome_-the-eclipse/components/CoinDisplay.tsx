import React from 'react';
import { Coin, CoinFace } from '../types';
import { HelpCircle, Swords, Shield, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface CoinDisplayProps {
  coin: Coin;
  index: number;
  onClick: ((index: number) => void) | null;
  isUsed?: boolean;
  isSwapTarget?: boolean;
  isSkillTarget?: boolean;
  isSelectedForSkill?: boolean;
}

const CoinDisplay: React.FC<CoinDisplayProps> = ({ coin, index, onClick, isUsed = false, isSwapTarget = false, isSkillTarget = false, isSelectedForSkill = false }) => {
  const isHeads = coin.face === CoinFace.HEADS;
  const isTails = coin.face === CoinFace.TAILS;
  const faceLabel = isHeads ? '앞면' : isTails ? '뒷면' : '미확인';
  const faceClass = isHeads
    ? 'bg-red-500 border-red-300'
    : isTails
      ? 'bg-blue-500 border-blue-300'
      : 'bg-slate-600 border-slate-300';

  const titleText = coin.locked
    ? "잠김"
    : !onClick
    ? "전투 중에는 동전을 직접 뒤집을 수 없습니다. 액티브 스킬, 행운 동전 교체 등을 활용하여 결과를 바꾸세요."
    : `동전 #${index + 1} - ${faceLabel}`;

  const targetEffectClass = isSkillTarget && !isSelectedForSkill ? "animate-pulse-shadow" : "";

  const ringClasses = [
    isUsed ? "ring-4 ring-yellow-400" : "",
    isSwapTarget ? "ring-4 ring-cyan-400 animate-pulse" : "",
    isSelectedForSkill ? "ring-4 ring-green-500 ring-offset-4 ring-offset-green-900" : "",
  ].filter(Boolean).join(" ");

  const slotClasses = [
    "coin-display-slot relative text-center flex flex-col items-center",
    isUsed ? "is-used" : "",
    isSwapTarget ? "is-swap-target" : "",
    isSkillTarget ? "is-skill-target" : "",
    isSelectedForSkill ? "is-selected-for-skill" : "",
  ].filter(Boolean).join(" ");

  return (
    <div className={slotClasses}>
      <div className="relative w-16 h-16">
        <div className="w-16 h-16">
          <motion.div
            key={`${coin.id}-${coin.face ?? 'unknown'}`}
            onClick={() => onClick && !coin.locked && onClick(index)}
            className={`coin-face-current relative w-full h-full rounded-full border-4 flex items-center justify-center text-white ${faceClass} ${targetEffectClass}
              ${!onClick || coin.locked ? "cursor-help" : "cursor-pointer hover:scale-110 active:scale-100 transition-transform duration-200"}
              ${ringClasses ? `${ringClasses} ring-offset-gray-800` : ""}`}
            initial={{ rotateY: 0, scale: 0.96 }}
            animate={{ rotateY: 0, scale: 1 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            title={titleText}
          >
            {isHeads ? <Swords size={28} /> : isTails ? <Shield size={28} /> : <HelpCircle size={28} />}
          </motion.div>
        </div>
        <span className="coin-slot-badge" aria-hidden="true">{index + 1}</span>
        {coin.locked && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-700 border-2 border-white rounded-full flex items-center justify-center z-10" title="잠김">
            <Lock size={10} className="text-white" />
          </div>
        )}
      </div>
    </div>
  );
};

export default CoinDisplay;
