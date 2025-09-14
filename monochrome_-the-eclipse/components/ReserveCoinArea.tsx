import React from 'react';
import { Coin, CoinFace }from '../types';
import { Swords, Shield, HelpCircle } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

interface ReserveCoinAreaProps {
  reserveCoins: Coin[];
  onInitiateSwap: (index: number) => void;
}

export const ReserveCoinArea: React.FC<ReserveCoinAreaProps> = ({ reserveCoins, onInitiateSwap }) => {
    const testMode = useGameStore(state => state.testMode);
    const onFlip = useGameStore(state => state.flipReserveCoin);
    const swapState = useGameStore(state => state.swapState);
    const isSwapping = swapState.phase !== 'idle';
    
    if (!reserveCoins || reserveCoins.length === 0) return null;
    
    return (
        <div className="bg-gray-900/50 p-3 rounded-lg mt-4 border border-gray-700">
            <h4 className="text-center text-sm font-bold text-gray-300 mb-2">예비 동전 ({reserveCoins.length}/3)</h4>
            <div className="flex justify-center items-center gap-4">
                {reserveCoins.map((coin, index) => {
                    const isUnflipped = coin.face === null;
                    const isSelectedForSwap = isSwapping && swapState.reserveCoinIndex === index;
                    return (
                        <div key={coin.id} className="flex flex-col items-center gap-1.5">
                            <button 
                                onClick={() => onFlip(index)}
                                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-transform ${testMode ? 'hover:scale-110' : 'cursor-default'} ${
                                    isUnflipped 
                                    ? 'bg-gray-600 border-gray-400'
                                    : coin.face === CoinFace.HEADS 
                                    ? 'bg-red-500/80 border-red-300/80' 
                                    : 'bg-blue-500/80 border-blue-300/80'
                                } ${isSelectedForSwap ? 'ring-2 ring-cyan-400' : ''}`}
                                title={testMode ? "클릭하여 뒤집기 (테스트 모드)" : "교체 시 결정됩니다"}
                                disabled={!testMode}
                            >
                                {isUnflipped ? <HelpCircle size={20} /> : coin.face === CoinFace.HEADS ? <Swords size={20} /> : <Shield size={20} />}
                            </button>
                            <button 
                                onClick={() => onInitiateSwap(index)}
                                disabled={isSwapping}
                                className="px-2 py-0.5 bg-cyan-600 text-white rounded text-xs hover:bg-cyan-500 disabled:bg-gray-500"
                            >
                            교체
                            </button>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};