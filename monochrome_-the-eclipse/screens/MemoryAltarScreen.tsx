import React from 'react';
import { useGameStore } from '../store/gameStore';
import { MemoryUpgradeType } from '../types';
import { MEMORY_UPGRADE_DATA } from '../constants';
import ResourceDisplay from '../components/ResourceDisplay';

export const MemoryAltarScreen = () => {
    const player = useGameStore(state => state.player);
    const resources = useGameStore(state => state.resources);
    const handleMemoryUpgrade = useGameStore(state => state.handleMemoryUpgrade);
    const proceedToNextTurn = useGameStore(state => state.proceedToNextTurn);

    if (!player) return <div>로딩 중...</div>;
    
    const goBack = () => {
        proceedToNextTurn();
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-blue-400">기억의 제단</h2>
                    <p className="text-gray-400 mt-2">기억 조각을 사용하여 영구적인 능력을 각인합니다.</p>
                </div>
                <div className="mb-6">
                    <ResourceDisplay resources={resources} />
                </div>
                <div className="space-y-4">
                    {Object.entries(MEMORY_UPGRADE_DATA).map(([key, data]) => {
                        const upgradeKey = key as MemoryUpgradeType;
                        const currentLevel = player.memoryUpgrades[upgradeKey];
                        const cost = data.cost(currentLevel);
                        return (
                            <div key={key} className="bg-gray-800 p-4 rounded-lg flex justify-between items-center border border-gray-700">
                                <div>
                                    <h4 className="font-bold text-lg">{data.name} <span className="text-sm text-gray-400">(Lv. {currentLevel})</span></h4>
                                    <p className="text-xs text-gray-400">{data.description}</p>
                                </div>
                                <button onClick={() => handleMemoryUpgrade(upgradeKey)} disabled={resources.memoryPieces < cost} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed">
                                    {cost} 기억
                                </button>
                            </div>
                        );
                    })}
                </div>
                <div className="text-center mt-8">
                    <button onClick={goBack} className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors">
                        돌아가기
                    </button>
                </div>
            </div>
        </div>
    );
};
