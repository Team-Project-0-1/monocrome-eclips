import React from 'react';
import { motion } from 'framer-motion';
import { PlayerCharacter, EnemyCharacter } from '../../types';

interface CombatPortraitProps {
  character: PlayerCharacter | EnemyCharacter;
  isPlayer?: boolean;
  subdued?: boolean;
}

const frameGradients = {
  player: 'from-cyan-500/30 via-blue-500/20 to-transparent',
  enemy: 'from-red-500/30 via-rose-500/10 to-transparent',
};

const CombatPortrait: React.FC<CombatPortraitProps> = ({ character, isPlayer = false, subdued = false }) => {
  if (!character.sprite) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: subdued ? 0.4 : 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative flex justify-center w-full"
    >
      <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 shadow-2xl shadow-black/40 p-4 w-full aspect-square flex items-center justify-center`}>
        <div className={`absolute inset-0 bg-gradient-to-tr ${isPlayer ? frameGradients.player : frameGradients.enemy}`} />

        {/* Character Image - Player faces right, Enemy faces left */}
        <img
          src={character.sprite}
          alt={`${character.name} portrait`}
          className={`relative z-10 max-w-full max-h-full object-contain drop-shadow-[0_15px_35px_rgba(15,23,42,0.65)] ${!isPlayer ? 'scale-x-[-1]' : ''}`}
        />

        {/* Character Name and Type */}
        <div className="absolute top-3 left-3 text-[0.6rem] uppercase tracking-[0.3em] text-slate-300/80">
          {isPlayer ? 'PLAYER' : 'ENEMY'}
        </div>

        {/* Character Name */}
        <div className="absolute bottom-3 left-3 right-3 text-center">
          <div className="text-xs font-semibold text-white bg-black/50 rounded px-2 py-1 backdrop-blur-sm">
            {character.name}
          </div>
        </div>

        {/* Battle stance indicator */}
        {isPlayer && (
          <div className="absolute top-1/2 right-2 transform -translate-y-1/2">
            <div className="w-2 h-8 bg-cyan-400/60 rounded-full animate-pulse"></div>
          </div>
        )}
        {!isPlayer && (
          <div className="absolute top-1/2 left-2 transform -translate-y-1/2">
            <div className="w-2 h-8 bg-red-400/60 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CombatPortrait;
