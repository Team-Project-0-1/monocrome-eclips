import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CombatEffect as CombatEffectType, StatusEffectType } from '../../types';
import { effectConfig } from '../../dataEffects';
import { Shield, Heart, Swords } from 'lucide-react';

interface CombatEffectProps {
  effect: CombatEffectType;
  onComplete: (id: number) => void;
}

// FIX: Changed component from React.FC to a standard function component to resolve framer-motion prop type errors.
const CombatEffect = ({ effect, onComplete }: CombatEffectProps): React.JSX.Element => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete(effect.id);
    }, 1500); // Effect lifespan
    return () => clearTimeout(timer);
  }, [effect.id, onComplete]);

  const renderEffect = (): React.JSX.Element | null => {
    switch (effect.type) {
      case 'damage':
        return (
          <motion.div
            className="text-3xl font-bold text-red-400 font-orbitron"
            style={{ textShadow: '1px 1px 2px black' }}
            initial={{ y: 0, opacity: 1, scale: 1.5 }}
            animate={{ y: -60, opacity: 0, scale: 0.8 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          >
            -{effect.data.amount}
          </motion.div>
        );
      case 'heal':
        return (
          <motion.div
            className="flex items-center gap-1 text-2xl font-bold text-green-400"
            style={{ textShadow: '1px 1px 2px black' }}
            initial={{ y: 0, opacity: 1, scale: 1.2 }}
            animate={{ y: -50, opacity: 0, scale: 0.7 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          >
            <Heart size={20} /> +{effect.data.amount}
          </motion.div>
        );
      case 'defense':
        return (
          <motion.div
            className="flex items-center gap-1 text-2xl font-bold text-blue-400"
            style={{ textShadow: '1px 1px 2px black' }}
            initial={{ y: 0, opacity: 1, scale: 1.2 }}
            animate={{ y: -50, opacity: 0, scale: 0.7 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          >
            <Shield size={20} /> +{effect.data.amount}
          </motion.div>
        );
      case 'status':
        const config = effectConfig[effect.data.statusType as StatusEffectType];
        if (!config) return null;
        const value = effect.data.value;
        const isBuff = value > 0;
        return (
          <motion.div
            className={`flex items-center gap-1.5 p-2 rounded-lg text-sm font-semibold border ${isBuff ? 'bg-blue-900/80 border-blue-600 text-blue-200' : 'bg-red-900/80 border-red-600 text-red-200'}`}
            initial={{ y: -20, opacity: 1, scale: 1 }}
            animate={{ y: -70, opacity: 0, scale: 0.8 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          >
            <span className="text-xl">{config.icon}</span>
            <span>{config.name} {isBuff ? '+' : ''}{value}</span>
          </motion.div>
        );
      case 'temp_stat':
        const { stat, value: statValue, duration } = effect.data;
        const isStatBuff = statValue > 0;
        const statColor = stat === 'attack' 
            ? (isStatBuff ? 'text-red-300 border-red-500 bg-red-900/80' : 'text-red-500 border-red-700 bg-red-900/50')
            : (isStatBuff ? 'text-blue-300 border-blue-500 bg-blue-900/80' : 'text-blue-500 border-blue-700 bg-blue-900/50');
        const Icon = stat === 'attack' ? Swords : Shield;
        return (
            <motion.div
                className={`flex items-center gap-1.5 p-2 rounded-lg text-sm font-semibold border ${statColor}`}
                initial={{ y: 20, opacity: 1, scale: 1 }}
                animate={{ y: -50, opacity: 0, scale: 0.8 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
            >
                <Icon size={16} />
                <span>{stat === 'attack' ? '공격력' : '방어력'} {isStatBuff ? '+' : ''}{statValue} ({duration}턴)</span>
            </motion.div>
        );
      case 'skill':
        return (
          <>
            <motion.div
              className="absolute inset-0 rounded-lg border-8 border-yellow-300"
              style={{ boxShadow: '0 0 30px 10px rgba(253, 224, 71, 0.6)' }}
              initial={{ scale: 1, opacity: 0 }}
              animate={{ scale: 1.25, opacity: [1, 0] }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.div
              className="text-2xl font-black font-orbitron text-white"
              style={{ textShadow: '0 3px 5px rgba(0,0,0,0.9)' }}
              initial={{ y: 20, scale: 0.5, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.3, ease: "easeOut", times: [0, 0.2, 0.8, 1] }}
            >
              {effect.data.name}
            </motion.div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="absolute">
      {renderEffect()}
    </div>
  );
};

export default CombatEffect;
