
import React from 'react';
import { Coin, CoinFace } from '../types';
import { Swords, Shield, Lock } from 'lucide-react';

interface CoinDisplayProps {
  coin: Coin;
  index: number;
  onFlip: ((index: number) => void) | null;
  isUsed?: boolean;
}

const CoinDisplay: React.FC<CoinDisplayProps> = ({ coin, index, onFlip, isUsed = false }) => {
  const isHeads = coin.face === CoinFace.HEADS;

  const faceStyle = isHeads
    ? "bg-red-500 border-red-300 text-white"
    : "bg-blue-500 border-blue-300 text-white";

  const icon = isHeads ? <Swords size={28} /> : <Shield size={28} />;

  return (
    <div className="relative text-center">
      <div
        className={`relative w-16 h-16 rounded-full border-4 flex items-center justify-center font-bold text-2xl shadow-lg transition-all duration-200
          ${faceStyle}
          ${coin.locked ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:scale-110 active:scale-100"}
          ${isUsed ? "ring-4 ring-yellow-400 ring-offset-2 ring-offset-gray-800" : ""}`}
        onClick={() => onFlip && !coin.locked && onFlip(index)}
        title={coin.locked ? "잠김" : `동전 #${index + 1} - ${isHeads ? "앞면" : "뒷면"}`}
      >
        {icon}
        {coin.locked && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-700 border-2 border-white rounded-full flex items-center justify-center" title="잠김">
            <Lock size={10} className="text-white" />
          </div>
        )}
      </div>
      <span className="text-xs text-gray-400 mt-1">#{index + 1}</span>
    </div>
  );
};

export default CoinDisplay;
