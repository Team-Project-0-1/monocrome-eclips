import React from 'react';
import { useGameStore } from '../store/gameStore';
import { effectConfig } from '../dataEffects';
import { StatusEffectType } from '../types';

const keywordStyles: { [key: string]: string } = {
  '피해': 'text-red-400', '공격력': 'text-red-400', '공격': 'text-red-400',
  '방어': 'text-blue-400', '방어력': 'text-blue-400',
  '회복': 'text-green-400', '체력': 'text-green-400',
  '증폭': 'text-yellow-400 font-semibold',
  '공명': 'text-purple-400 font-semibold',
  '표식': 'text-orange-400 font-semibold',
  '출혈': 'text-red-500 font-semibold',
  '반격': 'text-blue-500 font-semibold',
  '분쇄': 'text-gray-300 font-semibold',
  '저주': 'text-indigo-400 font-semibold',
  '봉인': 'text-slate-400 font-semibold',
  '추적': 'text-orange-500 font-semibold',
  '앞면': 'text-red-300', '뒷면': 'text-blue-300',
  '동전': 'text-gray-300', '족보': 'text-cyan-400', '턴': 'text-gray-300',
};

const numberStyle = 'text-yellow-400 font-bold';

const SkillDescription: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
    const showTooltip = useGameStore(state => state.showTooltip);

    const handleClickKeyword = (event: React.MouseEvent<HTMLButtonElement>, effectKey: StatusEffectType) => {
        event.stopPropagation();
        const config = effectConfig[effectKey];
        if (config) {
            const rect = event.currentTarget.getBoundingClientRect();
            showTooltip(config, rect);
        }
    };

    const keywords = Object.keys(keywordStyles).sort((a, b) => b.length - a.length);
    const regex = new RegExp(`(${keywords.join('|')}|\\d+)`, 'g');
    
    const effectNameMap = new Map<string, StatusEffectType>(
        Object.entries(effectConfig)
              .filter(([, value]) => value)
              .map(([key, value]) => [value!.name, key as StatusEffectType])
    );

    const parseAndRender = (text: string) => {
        const parts = text.split(regex);
        return parts.filter(part => part).map((part, index) => {
            const effectKey = effectNameMap.get(part);
            if (effectKey) {
                return (
                    <button 
                        key={index} 
                        onClick={(e) => handleClickKeyword(e, effectKey)} 
                        className={`${keywordStyles[part]} cursor-help underline decoration-dotted decoration-gray-500 hover:decoration-white transition-colors focus:outline-none`}
                    >
                        {part}
                    </button>
                );
            }
            if (/^\d+$/.test(part)) {
                return <span key={index} className={numberStyle}>{part}</span>;
            }
            return <React.Fragment key={index}>{part}</React.Fragment>;
        });
    };
    
    const sentences = text.match(/[^.!?]+[.!?]?/g) || [text];

    return (
        <div className={`leading-relaxed space-y-1 ${className}`}>
            {sentences.map((sentence, i) => (
                <p key={i}>
                    {parseAndRender(sentence.trim())}
                </p>
            ))}
        </div>
    );
};

export default SkillDescription;