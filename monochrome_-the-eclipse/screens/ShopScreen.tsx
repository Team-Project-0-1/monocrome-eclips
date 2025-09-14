import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { shopData } from '../dataShop';
import { patternUpgrades } from '../dataUpgrades';
import { playerSkillUnlocks } from '../dataSkills';
import ResourceDisplay from '../components/ResourceDisplay';
import { ShoppingBag } from 'lucide-react';
import { PatternUpgradeDefinition, SkillUpgradeDefinition } from '../types';
import SkillDescription from '../components/SkillDescription';

export const ShopScreen = () => {
    const player = useGameStore(state => state.player);
    const resources = useGameStore(state => state.resources);
    const unlockedPatterns = useGameStore(state => state.unlockedPatterns);
    const reserveCoins = useGameStore(state => state.reserveCoins);
    const reserveCoinShopCost = useGameStore(state => state.reserveCoinShopCost);
    const handlePurchase = useGameStore(state => state.handlePurchase);
    const handleSkillUpgradePurchase = useGameStore(state => state.handleSkillUpgradePurchase);
    const proceedToNextTurn = useGameStore(state => state.proceedToNextTurn);
    
    const [activeShopTab, setActiveShopTab] = useState<'items' | 'upgrades' | 'skills'>('items');

    if (!player) return <div>로딩 중...</div>;

    const classPatternUpgrades = patternUpgrades[player.class];
    const classSkillUpgrades = playerSkillUnlocks[player.class];
    
    const availableUpgrades = classPatternUpgrades 
        ? (Object.values(classPatternUpgrades) as PatternUpgradeDefinition[]).filter(u => !unlockedPatterns.includes(u.id)) 
        : [];
        
    const availableSkills = classSkillUpgrades 
        ? (Object.values(classSkillUpgrades) as SkillUpgradeDefinition[]).filter(s => !player.acquiredSkills.includes(s.id)) 
        : [];

    const leaveShop = () => {
        proceedToNextTurn();
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-purple-400 flex items-center gap-2"><ShoppingBag /> 상점</h2>
                    <button onClick={leaveShop} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors shadow-md">
                        나가기
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        <ResourceDisplay resources={resources} />
                    </div>
                    <div className="md:col-span-2 bg-gray-800 p-4 rounded-lg border border-gray-700">
                        <div className="flex border-b border-gray-600 mb-4">
                            <button onClick={() => setActiveShopTab('items')} className={`px-4 py-2 font-semibold ${activeShopTab === 'items' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400 hover:text-white'}`}>아이템</button>
                            <button onClick={() => setActiveShopTab('upgrades')} className={`px-4 py-2 font-semibold ${activeShopTab === 'upgrades' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}>족보 강화</button>
                            <button onClick={() => setActiveShopTab('skills')} className={`px-4 py-2 font-semibold ${activeShopTab === 'skills' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'}`}>기술 습득</button>
                        </div>
                        
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {activeShopTab === 'items' && shopData.basic.items.map(item => {
                                const isReserveCoin = item.id === 'reserve_coin';
                                const cost = isReserveCoin ? reserveCoinShopCost : item.cost;
                                const canAfford = resources.echoRemnants >= cost;
                                const isFull = isReserveCoin && reserveCoins.length >= 3;
                                const isDisabled = !canAfford || isFull;
                                let description = item.description;
                                if (isReserveCoin && isFull) {
                                    description = "소지 한도에 도달했습니다. (최대 3개)";
                                }


                                return (
                                <div key={item.id} className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold text-white">{item.name}</h4>
                                        <SkillDescription text={description} className="text-xs text-gray-400" />
                                    </div>
                                    <button onClick={() => handlePurchase(item)} disabled={isDisabled} className="px-3 py-1.5 bg-yellow-600 text-white rounded-md text-sm font-semibold hover:bg-yellow-500 disabled:bg-gray-500 disabled:cursor-not-allowed">
                                        {cost} 에코
                                    </button>
                                </div>
                                )
                            })}
                            {activeShopTab === 'upgrades' && availableUpgrades.map(item => (
                                <div key={item.id} className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold text-white">{item.name}</h4>
                                        <SkillDescription text={item.description} className="text-xs text-gray-400" />
                                    </div>
                                    <button onClick={() => handlePurchase({ ...item, type: "upgrade" })} disabled={resources.senseFragments < item.cost.senseFragments} className="px-3 py-1.5 bg-purple-600 text-white rounded-md text-sm font-semibold hover:bg-purple-500 disabled:bg-gray-500 disabled:cursor-not-allowed">
                                        {item.cost.senseFragments} 감각
                                    </button>
                                </div>
                            ))}
                            {activeShopTab === 'skills' && availableSkills.map(item => (
                                <div key={item.id} className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold text-white">{item.name}</h4>
                                        <SkillDescription text={item.description} className="text-xs text-gray-400" />
                                    </div>
                                    <button onClick={() => handleSkillUpgradePurchase(item)} disabled={resources.echoRemnants < item.cost.echoRemnants} className="px-3 py-1.5 bg-cyan-600 text-white rounded-md text-sm font-semibold hover:bg-cyan-500 disabled:bg-gray-500 disabled:cursor-not-allowed">
                                        {item.cost.echoRemnants} 에코
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};