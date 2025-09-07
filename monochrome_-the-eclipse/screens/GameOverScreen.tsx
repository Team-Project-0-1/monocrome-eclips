import React from 'react';
import { useGameStore } from '../store/gameStore';

export const GameOverScreen = () => {
    const resetGame = useGameStore(state => state.resetGame);

    return (
        <div className="min-h-screen bg-black text-white p-4 flex items-center justify-center text-center">
            <div>
                <h2 className="text-6xl font-bold text-red-500 mb-4">GAME OVER</h2>
                <p className="text-gray-400 mb-8">당신의 여정은 여기서 끝났습니다.</p>
                <button onClick={() => resetGame()} className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                    메인 메뉴로
                </button>
            </div>
        </div>
    );
};