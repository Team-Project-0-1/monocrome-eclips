import React from 'react';
import { useGameStore } from '../store/gameStore';
import { CharacterClass, LucideIcon, GameState } from '../types';
import { characterData } from '../dataCharacters';
import { Zap, Target, ShieldCheck, Ghost, Layers, BrainCircuit } from "lucide-react";

const playerClassIcons: { [key in CharacterClass]: LucideIcon } = {
  [CharacterClass.WARRIOR]: Zap,
  [CharacterClass.ROGUE]: Target,
  [CharacterClass.TANK]: ShieldCheck,
  [CharacterClass.MAGE]: Ghost,
};

export const CharacterSelectScreen = () => {
    const selectCharacter = useGameStore(state => state.selectCharacter);
    const setGameState = useGameStore(state => state.setGameState);
    const metaProgress = useGameStore(state => state.metaProgress);
    const testMode = useGameStore(state => state.testMode);
    const setTestMode = useGameStore(state => state.setTestMode);

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-3xl sm:text-4xl font-bold">캐릭터 선택</h2>
                    <p className="text-gray-400 mt-2">플레이할 캐릭터를 선택하고, 영구 업그레이드를 확인하세요.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="flex justify-between items-center mb-4">
                            <label className="inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={testMode} onChange={(e) => setTestMode(e.target.checked)} className="sr-only peer" />
                                <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                <span className="ms-3 text-sm font-medium text-gray-300">테스트 모드</span>
                            </label>
                            <button onClick={() => setGameState(GameState.MENU)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors shadow-md text-sm">
                                메인 메뉴로
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
                            {Object.entries(characterData).map(([classType, data]) => {
                                const TypedIcon = playerClassIcons[classType as CharacterClass] as LucideIcon;
                                const isUnlocked = testMode || metaProgress.unlockedCharacters.includes(classType as CharacterClass);
                                const unlockHint: { [key: string]: string } = { [CharacterClass.ROGUE]: "3회 이상 플레이", [CharacterClass.TANK]: "스테이지 2 도달", [CharacterClass.MAGE]: "총 400 에코 수집", };
                                return (
                                    <button key={classType} onClick={() => isUnlocked && selectCharacter(classType as CharacterClass)} disabled={!isUnlocked}
                                        className={`p-5 rounded-lg shadow-lg transition-all relative group flex flex-col items-center text-center
                                            ${isUnlocked ? "bg-gray-800 hover:bg-gray-700 hover:shadow-blue-500/30 cursor-pointer border-2 border-gray-700 hover:border-blue-500"
                                                        : "bg-gray-700 cursor-not-allowed opacity-60 border-2 border-gray-600"}`}>
                                    {testMode && !metaProgress.unlockedCharacters.includes(classType as CharacterClass) && (<div className="absolute top-2 right-2 text-xs bg-yellow-500 text-black px-1.5 py-0.5 rounded-full font-semibold">TEST</div>)}
                                    <TypedIcon className={`w-12 h-12 mx-auto mb-3 ${isUnlocked ? 'text-blue-400 group-hover:text-blue-300' : 'text-gray-500'}`} />
                                    <h3 className="font-bold text-lg mb-1">{data.name}</h3>
                                    <p className="text-xs text-gray-400 mb-2">{data.title}</p>
                                    {isUnlocked ? (
                                        <div className="text-xs space-y-0.5 text-gray-300">
                                        <p>HP: {data.hp + metaProgress.memoryUpgrades.maxHp * 5}</p>
                                        <p>공격: {data.baseAtk + metaProgress.memoryUpgrades.baseAtk} / 방어: {data.baseDef + metaProgress.memoryUpgrades.baseDef}</p>
                                        </div>
                                    ) : (<p className="text-xs text-red-400 mt-2">{unlockHint[classType] || "잠김"}</p>)}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="lg:col-span-1 flex flex-col gap-6">
                        <div className="bg-gray-800/80 p-4 rounded-lg border border-gray-700">
                            <h3 className="font-bold text-lg text-gray-300 mb-3 border-b border-gray-600 pb-2 flex items-center gap-2"><Layers className="w-5 h-5 text-gray-400"/>진행 상황</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-gray-400">총 플레이:</span><span className="font-bold text-white">{metaProgress.totalRuns} 회</span></div>
                                <div className="flex justify-between"><span className="text-gray-400">최고 스테이지:</span><span className="font-bold text-white">{metaProgress.highestStage}</span></div>
                                <div className="flex justify-between"><span className="text-gray-400">총 수집 에코:</span><span className="font-bold text-white">{metaProgress.totalEchoCollected}</span></div>
                                <div className="flex justify-between"><span className="text-gray-400">해금된 캐릭터:</span><span className="font-bold text-white">{metaProgress.unlockedCharacters.length} / {Object.keys(characterData).length}</span></div>
                            </div>
                        </div>
                        <div className="bg-gray-800/80 p-4 rounded-lg border border-gray-700">
                            <h3 className="font-bold text-lg text-gray-300 mb-3 border-b border-gray-600 pb-2 flex items-center gap-2"><BrainCircuit className="w-5 h-5 text-gray-400"/>영구 업그레이드</h3>
                            <div className="space-y-3 text-sm">
                                <p className="text-xs text-gray-400 mb-2">메인 메뉴에서 '기억의 제단'을 통해 업그레이드할 수 있습니다.</p>
                                <div className="flex justify-between items-center bg-gray-700/50 p-2 rounded-md">
                                    <span className="text-gray-300">최대 체력 증가</span>
                                    <span className="font-bold text-green-400">+{metaProgress.memoryUpgrades.maxHp * 5} (Lv.{metaProgress.memoryUpgrades.maxHp})</span>
                                </div>
                                <div className="flex justify-between items-center bg-gray-700/50 p-2 rounded-md">
                                    <span className="text-gray-300">기본 공격력 증가</span>
                                    <span className="font-bold text-red-400">+{metaProgress.memoryUpgrades.baseAtk} (Lv.{metaProgress.memoryUpgrades.baseAtk})</span>
                                </div>
                                <div className="flex justify-between items-center bg-gray-700/50 p-2 rounded-md">
                                    <span className="text-gray-300">기본 방어력 증가</span>
                                    <span className="font-bold text-blue-400">+{metaProgress.memoryUpgrades.baseDef} (Lv.{metaProgress.memoryUpgrades.baseDef})</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
