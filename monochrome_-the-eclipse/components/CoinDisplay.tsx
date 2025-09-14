import React, { useEffect, useRef } from 'react';
import { Coin, CoinFace } from '../types';
import { Swords, Shield, Lock } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';

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
  const controls = useAnimation();
  const isInitialRender = useRef(true);

  useEffect(() => {
    const targetRotation = isHeads ? 0 : 180;
    
    if (isInitialRender.current) {
      // Snap to position without animation on first render
      controls.set({ rotateY: targetRotation });
      isInitialRender.current = false;
    } else {
      // Animate on subsequent renders
      controls.start({ rotateY: targetRotation, transition: { duration: 0.6, ease: 'easeInOut' } });
    }
  }, [isHeads, controls]);

  const titleText = coin.locked
    ? "잠김"
    : !onClick
    ? "전투 중에는 동전을 직접 뒤집을 수 없습니다. 액티브 스킬, 예비 동전 교체 등을 활용하여 결과를 바꾸세요."
    : `동전 #${index + 1} - ${isHeads ? "앞면" : "뒷면"}`;

  const targetEffectClass = isSkillTarget && !isSelectedForSkill ? "animate-pulse-shadow" : "";

  const ringClasses = [
    isUsed ? "ring-4 ring-yellow-400" : "",
    isSwapTarget ? "ring-4 ring-cyan-400 animate-pulse" : "",
    isSelectedForSkill ? "ring-4 ring-green-500 ring-offset-4 ring-offset-green-900" : "",
  ].filter(Boolean).join(" ");

  return (
    <div className="relative text-center flex flex-col items-center">
      <div className="relative w-16 h-16">
        <div className="w-16 h-16 perspective">
          <motion.div
            onClick={() => onClick && !coin.locked && onClick(index)}
            className={`relative w-full h-full preserve-3d rounded-full ${targetEffectClass}
              ${!onClick || coin.locked ? "cursor-help" : "cursor-pointer hover:scale-110 active:scale-100 transition-transform duration-200"}
              ${ringClasses ? `${ringClasses} ring-offset-gray-800` : ""}`}
            animate={controls}
            title={titleText}
          >
            {/* Heads Face */}
            <div className="absolute w-full h-full rounded-full border-4 flex items-center justify-center bg-red-500 border-red-300 text-white" style={{ backfaceVisibility: 'hidden' }}>
              <Swords size={28} />
            </div>
            {/* Tails Face */}
            <div className="absolute w-full h-full rounded-full border-4 flex items-center justify-center bg-blue-500 border-blue-300 text-white" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
              <Shield size={28} />
            </div>
          </motion.div>
        </div>
        {coin.locked && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-700 border-2 border-white rounded-full flex items-center justify-center z-10" title="잠김">
            <Lock size={10} className="text-white" />
          </div>
        )}
      </div>
      <span className="text-xs text-gray-400 mt-1">#{index + 1}</span>
    </div>
  );
};

export default CoinDisplay;