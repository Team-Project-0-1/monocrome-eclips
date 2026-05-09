import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { playerSkillUnlocks } from '../../dataSkills';
import EffectSummary from '../EffectSummary';
import { summarizeDescription } from '../../utils/effectSummary';
import SkillDescription from '../SkillDescription';

const SkillReplacementModal: React.FC = () => {
    const player = useGameStore(state => state.player);
    const skillReplacementState = useGameStore(state => state.skillReplacementState);
    const setSkillReplacementState = useGameStore(state => state.setSkillReplacementState);
    const executeSkillReplacement = useGameStore(state => state.executeSkillReplacement);

    if (!skillReplacementState?.isModalOpen || !player) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[101] p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-yellow-500">
                <h3 className="text-xl font-bold text-yellow-400 mb-4">기술 슬롯 가득 참</h3>
                <p className="text-gray-300 mb-4">새로운 기술 '{skillReplacementState.newSkill.name}'을(를) 배우려면 기존 기술 하나를 잊어야 합니다.</p>
                <div className="space-y-2 max-h-60 overflow-y-auto mb-4 pr-2">
                    {player.acquiredSkills.map(skillId => {
                        const skillDef = playerSkillUnlocks[player.class]?.[skillId];
                        if (!skillDef) return null;
                        return (
                            <div key={skillId} className="rounded-md bg-gray-700 transition-colors hover:bg-red-800">
                                <button onClick={() => executeSkillReplacement(skillId)} className="w-full text-left p-2">
                                    <p className="font-semibold">{skillDef.name}</p>
                                    <EffectSummary
                                      summary={summarizeDescription(skillDef.description)}
                                      compact
                                      hideHeadline
                                      chipLimit={4}
                                      className="skill-replacement-summary"
                                    />
                                </button>
                                <details className="px-2 pb-2 text-xs text-gray-300">
                                    <summary className="cursor-pointer font-bold text-gray-400">상세</summary>
                                    <SkillDescription text={skillDef.description} className="mt-1 text-gray-300" />
                                </details>
                            </div>
                        )
                    })}
                </div>
                <div className="text-center">
                    <button onClick={() => setSkillReplacementState(null)} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md">취소</button>
                </div>
            </div>
        </div>
    );
};

export default SkillReplacementModal;
