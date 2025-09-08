import React from 'react';
import { useGameStore } from '../store/gameStore';

export const StageClearScreen = () => {
    const { startStage, currentStage } = useGameStore(state => ({
        startStage: state.startStage,
        currentStage: state.currentStage
    }));

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 flex items-center justify-center text-center">
            <div>
                <h2 className="text-4xl font-bold text-green-400 mb-4">스테이지 클리어!</h2>
                <p className="text-gray-300 mb-8">다음 스테이지로 진행할 준비가 되었습니다.</p>
                <button onClick={() => startStage(currentStage + 1)} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    다음 스테이지로
                </button>
            </div>
        </div>
    );
};