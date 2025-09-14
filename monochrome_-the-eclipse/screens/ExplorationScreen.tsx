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
        <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 scanlines relative" style={{
            background: 'radial-gradient(ellipse at center, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 1) 70%)'
        }}>
             <div className="absolute inset-0 bg-black/30 z-0"></div>
             <div className="relative z-10 grid grid-cols-1 lg:grid-cols-4 gap-6 h-full-minus-padding">

                {/* Left Panel */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    <CharacterStatus character={player} isPlayer={true} />
                    <ResourceDisplay resources={resources} reserveCoins={reserveCoins} />
                    <div className="flex flex-col gap-2">
                        <button onClick={() => setInventoryOpen(true)} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg">
                            <Package className="w-5 h-5" /> 능력 목록
                        </button>
                        <button onClick={() => setGameState(GameState.MENU)} className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg">
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