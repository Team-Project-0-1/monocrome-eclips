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
      className={`relative flex ${isPlayer ? 'justify-center' : 'justify-center'} w-full`}
    >
      <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 shadow-2xl shadow-black/40 p-6 w-full max-w-[280px] aspect-square flex items-center justify-center`}>
        <div className={`absolute inset-0 bg-gradient-to-tr ${isPlayer ? frameGradients.player : frameGradients.enemy}`} />
        <img
          src={character.sprite}
          alt={`${character.name} portrait`}
          className={`relative z-10 max-w-full max-h-full object-contain drop-shadow-[0_15px_35px_rgba(15,23,42,0.65)] ${isPlayer ? '' : 'scale-x-[-1]'}`}
        />
        <div className="absolute top-4 left-4 text-[0.65rem] uppercase tracking-[0.4em] text-slate-300/70">
          {isPlayer ? 'PLAYER' : 'ENEMY'}
        </div>
      </div>
    </motion.div>
  );
};

export default CombatPortrait;
