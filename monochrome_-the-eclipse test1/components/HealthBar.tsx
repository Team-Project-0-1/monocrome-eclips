
import React from 'react';

interface HealthBarProps {
  current: number;
  max: number;
  isPlayer?: boolean;
}

const HealthBar: React.FC<HealthBarProps> = ({ current, max, isPlayer = false }) => {
  const percentage = max > 0 ? (current / max) * 100 : 0;
  
  const getHealthColor = () => {
    if (percentage > 60) return isPlayer ? "bg-green-500" : "bg-green-600";
    if (percentage > 30) return isPlayer ? "bg-yellow-500" : "bg-yellow-600";
    return isPlayer ? "bg-red-500" : "bg-red-600";
  };

  return (
    <div className="w-full">
      <div className={`flex items-center justify-between mb-1 ${isPlayer ? 'text-blue-100' : 'text-red-100'}`}>
        <span className="text-xs font-medium">{isPlayer ? "체력" : "HP"}</span>
        <span className="text-xs font-bold">
          {Math.max(0, current)}/{max}
        </span>
      </div>
      <div className={`w-full ${isPlayer ? 'bg-blue-900' : 'bg-red-900'} rounded-full h-3.5 relative overflow-hidden shadow-inner`}>
        <div
          className={`h-full ${getHealthColor()} transition-all duration-500 ease-out relative rounded-full`}
          style={{ width: `${Math.max(0, percentage)}%` }}
        >
          {percentage > 0 && <div className="absolute inset-0 bg-white bg-opacity-10 animate-pulse rounded-full" />}
        </div>
        {percentage <= 25 && percentage > 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-xs font-bold text-white drop-shadow animate-ping-slow opacity-75">
              위험!
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// Add custom animation for HealthBar, ensuring it doesn't crash on hot-reload
try {
  const styleSheet = document.styleSheets[0];
  let ruleExists = false;
  // A simple check to see if a similar rule already exists.
  for (let i = 0; i < styleSheet.cssRules.length; i++) {
    if (styleSheet.cssRules[i].cssText.includes('ping-slow')) {
      ruleExists = true;
      break;
    }
  }

  if (!ruleExists) {
    styleSheet.insertRule(`
      @keyframes ping-slow {
        75%, 100% {
          transform: scale(1.2);
          opacity: 0;
        }
      }
    `, styleSheet.cssRules.length);
    styleSheet.insertRule(`
      .animate-ping-slow {
        animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
      }
    `, styleSheet.cssRules.length);
  }
} catch (e) {
    console.warn("Could not insert HealthBar CSS rules, likely because they already exist.");
}


export default HealthBar;