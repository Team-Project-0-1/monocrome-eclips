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
    const stageNodes = useGameStore(state => state.stageNodes);
    const currentTurn = useGameStore(state => state.currentTurn);
    const visitedNodes = useGameStore(state => state.visitedNodes);
    const setInventoryOpen = useGameStore(state => state.setInventoryOpen);
    const setGameState = useGameStore(state => state.setGameState);
    const selectNode = useGameStore(state => state.selectNode);

    const currentNodes = stageNodes[currentTurn - 1] || [];

    if (!player) return <div>로딩 중...</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 flex flex-col">
            <header className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                <div className="md:col-span-1">
                    <CharacterStatus character={player} isPlayer={true} />
                </div>
                <div className="md:col-span-1">
                    <ResourceDisplay resources={resources} />
                </div>
                <div className="md:col-span-1 flex flex-col gap-2">
                    <button onClick={() => setInventoryOpen(true)} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                        <Package className="w-5 h-5" /> 능력 목록
                    </button>
                    <button onClick={() => setGameState(GameState.MENU)} className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                        메인 메뉴로
                    </button>
                </div>
            </header>
            <main className="flex-grow flex flex-col">
                <div className="mb-4">
                    <MiniMap nodes={stageNodes} currentTurn={currentTurn} visitedNodes={visitedNodes} />
                </div>
                <div className="flex-grow flex items-center justify-center">
                    <NodeSelection nodes={currentNodes} onSelect={(node) => selectNode(node)} currentTurn={currentTurn} />
                </div>
            </main>
        </div>
    );
};
