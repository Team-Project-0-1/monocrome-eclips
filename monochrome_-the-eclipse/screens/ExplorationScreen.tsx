import React from 'react';
import { useGameStore } from '../store/gameStore';
import CharacterStatus from '../components/CharacterStatus';
import ResourceDisplay from '../components/ResourceDisplay';
import MiniMap from '../components/MiniMap';
import NodeSelection from '../components/NodeSelection';
import { Package } from 'lucide-react';
import { GameState } from '../types';

export const ExplorationScreen = () => {
    const player = useGameStore(state => state.player);
    const resources = useGameStore(state => state.resources);
    const reserveCoins = useGameStore(state => state.reserveCoins);
    const stageNodes = useGameStore(state => state.stageNodes);
    const currentTurn = useGameStore(state => state.currentTurn);
    const path = useGameStore(state => state.path);
    const setInventoryOpen = useGameStore(state => state.setInventoryOpen);
    const setGameState = useGameStore(state => state.setGameState);
    const selectNode = useGameStore(state => state.selectNode);

    const currentNodes = stageNodes[currentTurn - 1] || [];

    if (!player) return <div>로딩 중...</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 scanlines relative overflow-hidden" style={{
            background: 'radial-gradient(ellipse at center, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 1) 70%)'
        }}>
             {/* Atmospheric Background Elements */}
             <div className="absolute inset-0 bg-black/30 z-0"></div>
             <div className="absolute inset-0 z-0">
                {/* Moving fog effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/10 to-transparent animate-pulse opacity-30"></div>
                {/* Dust particles effect */}
                <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-gray-400/20 rounded-full animate-bounce delay-1000"></div>
                <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-gray-400/20 rounded-full animate-bounce delay-2000"></div>
                <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-gray-400/20 rounded-full animate-bounce delay-500"></div>
                {/* Subtle grid pattern */}
                <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}></div>
             </div>
             <div className="relative z-10 grid grid-cols-1 lg:grid-cols-4 gap-6 h-full-minus-padding">

                {/* Left Panel */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    {/* Enhanced character status with border glow */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg blur-sm"></div>
                        <div className="relative">
                            <CharacterStatus character={player} isPlayer={true} />
                        </div>
                    </div>

                    {/* Enhanced resource display */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-yellow-500/10 rounded-lg blur-sm"></div>
                        <div className="relative">
                            <ResourceDisplay resources={resources} reserveCoins={reserveCoins} />
                        </div>
                    </div>

                    {/* Enhanced action buttons */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => setInventoryOpen(true)}
                            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-cyan-500/30 hover:scale-105 border border-cyan-500/30"
                        >
                            <Package className="w-5 h-5" /> 능력 목록
                        </button>
                        <button
                            onClick={() => setGameState(GameState.MENU)}
                            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-gray-500/30 hover:scale-105 border border-gray-500/30"
                        >
                            메인 메뉴로
                        </button>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="lg:col-span-3 flex flex-col gap-6">
                    <div className="flex-grow flex items-center justify-center">
                        <NodeSelection nodes={currentNodes} onSelect={(node, index) => selectNode(node, index)} currentTurn={currentTurn} />
                    </div>
                    <MiniMap nodes={stageNodes} currentTurn={currentTurn} path={path} />
                </div>
            </div>
        </div>
    );
};