import React from 'react';
import { motion } from 'framer-motion';
import { Swords } from 'lucide-react';

interface HealthBarProps {
  current: number;
  max: number;
  temporaryDefense?: number;
  predictedDamage?: number;
  isPlayer?: boolean;
}

const HealthBar = ({ current, max, temporaryDefense = 0, predictedDamage = 0, isPlayer = false }: HealthBarProps): React.JSX.Element => {
  const currentHp = Math.max(0, current);
  const healthPercentage = max > 0 ? (currentHp / max) * 100 : 0;
  
  const defensePercentage = max > 0 ? (Math.min(max, temporaryDefense) / max) * 100 : 0;
  
  // Calculate predicted health after damage
  const damageAfterDefense = Math.max(0, predictedDamage - temporaryDefense);
  const predictedHp = Math.max(0, currentHp - damageAfterDefense);
  const predictedPercentage = max > 0 ? (predictedHp / max) * 100 : 0;
  
  const getHealthColor = (percentage: number) => {
    if (percentage > 60) return isPlayer ? "bg-green-500" : "bg-green-600";
    if (percentage > 30) return isPlayer ? "bg-yellow-500" : "bg-yellow-600";
    return isPlayer ? "bg-red-500" : "bg-red-600";
  };
  
  const healthColor = getHealthColor(healthPercentage);

  return (
    <div className="w-full">
      <div className={`flex items-baseline justify-between mb-1 ${isPlayer ? 'text-blue-100' : 'text-red-100'}`}>
        <span className="text-xs font-medium">{isPlayer ? "체력" : "HP"}</span>
        <div className="text-right">
          <span className="text-sm font-bold font-orbitron tracking-wider">
            {currentHp}/{max}
          </span>
          {temporaryDefense > 0 && (
             <span className="text-xs text-blue-300 ml-1">(+{temporaryDefense})</span>
          )}
        </div>
      </div>
      <div className={`w-full ${isPlayer ? 'bg-blue-900/70' : 'bg-red-900/70'} rounded-full h-4 relative overflow-hidden shadow-inner border border-black/20`}>
        {/* Predicted Health Background */}
        <motion.div
            className="absolute top-0 left-0 h-full bg-red-500/50 rounded-l-full"
            initial={false}
            animate={{ width: `${predictedPercentage}%`}}
            transition={{ duration: 0.3, ease: "easeInOut" }}
        />
        
        {/* Current Health */}
        <motion.div
          className={`h-full ${healthColor} relative rounded-l-full`}
          animate={{ width: `${healthPercentage}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
           <div className="absolute inset-0 bg-white/10"></div>
        </motion.div>

        {/* Temporary Defense */}
        {defensePercentage > 0 && (
          <motion.div
            className="absolute top-0 left-0 h-full bg-blue-500/80 border-r-2 border-blue-300 rounded-l-full pointer-events-none"
            initial={false}
            animate={{ width: `${defensePercentage}%`}}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
             <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </motion.div>
        )}
        
        {/* Predicted Damage Indicator */}
        {damageAfterDefense > 0 && (
          <motion.div
            key={predictedDamage} // Re-trigger animation on change
            className="absolute top-1/2 -translate-y-1/2 right-2 flex items-center gap-1 text-sm font-bold"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Swords size={14} className={isPlayer ? 'text-red-300' : 'text-yellow-300'} />
            <span className={isPlayer ? 'text-red-300' : 'text-yellow-300'}>
              -{damageAfterDefense}
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default HealthBar;