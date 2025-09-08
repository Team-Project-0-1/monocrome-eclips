import React from 'react';
import { useGameStore } from '../store/gameStore';

export const VictoryScreen = () => {
    const resetGame = useGameStore(state => state.resetGame);

    return (
        <div className="min-h-screen bg-yellow-900 text-white p-4 flex items-center justify-center text-center">
            <div>
                <h2 className="text-6xl font-bold text-yellow-300 mb-4">VICTORY</h2>
                <p className="text-yellow-200 mb-8">일식의 비밀을 파헤치고 세상에 빛을 되찾았습니다.</p>
                <button onClick={() => resetGame()} className="px-6 py-3 bg-yellow-700 text-white rounded-lg hover:bg-yellow-600 transition-colors">
                    메인 메뉴로
                </button>
            </div>
        </div>
    );
};