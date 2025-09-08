import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Coffee } from 'lucide-react';

export const RestScreen = () => {
    const handleRestChoice = useGameStore(state => state.handleRestChoice);
    const proceedToNextTurn = useGameStore(state => state.proceedToNextTurn);

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 flex items-center justify-center">
            <div className="w-full max-w-2xl text-center">
                <h2 className="text-3xl font-bold mb-2 text-green-400 flex items-center justify-center gap-2">
                    <Coffee /> 휴식처
                </h2>
                <p className="text-gray-400 mb-8">잠시 숨을 고르며 재정비합니다.</p>
                <div className="space-y-4">
                    <button onClick={() => handleRestChoice("heal")} className="w-full p-4 bg-green-700 hover:bg-green-600 rounded-lg text-lg font-semibold transition-colors">
                        체력 40% 회복
                    </button>
                    <button onClick={() => handleRestChoice("memory_altar")} className="w-full p-4 bg-blue-700 hover:bg-blue-600 rounded-lg text-lg font-semibold transition-colors">
                        기억의 제단 (능력 각인)
                    </button>
                    <button onClick={() => proceedToNextTurn()} className="w-full p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-lg font-semibold transition-colors mt-8">
                        그냥 지나가기
                    </button>
                </div>
            </div>
        </div>
    );
};
