import React from 'react';
import { useGameStore } from '../store/gameStore';
import EventCoinFlip from '../components/EventCoinFlip';
import { characterData } from '../dataCharacters';

export const EventScreen = () => {
    const currentEvent = useGameStore(state => state.currentEvent);
    const player = useGameStore(state => state.player);
    const eventPhase = useGameStore(state => state.eventPhase);
    const eventResultData = useGameStore(state => state.eventResultData);
    const eventDisplayItems = useGameStore(state => state.eventDisplayItems);
    const handleEventChoice = useGameStore(state => state.handleEventChoice);
    const proceedToNextTurn = useGameStore(state => state.proceedToNextTurn);

    if (!currentEvent || !player) return <div>이벤트 로딩 중...</div>;
    
    const proceed = () => {
        proceedToNextTurn();
    };
    
    const renderResult = () => {
        if (eventPhase !== 'result' || !eventResultData?.payload) {
            return null;
        }

        const { payload } = eventResultData;
        const message = String(payload.baseMessage || '결과가 도착했습니다.');

        return (
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-4 text-yellow-400">결과</h2>
                <p className="text-gray-300 mb-6 whitespace-pre-wrap">{message}</p>
                
                {eventDisplayItems.length > 0 && (
                    <div className="space-y-1 text-sm mb-6 bg-gray-900/50 p-4 rounded-md">
                        {eventDisplayItems.map(({ label, value }) => {
                            const isNum = typeof value === 'number';
                            const isString = typeof value === 'string';

                            // Absolute safeguard: Only render if the value is a displayable primitive.
                            if (!isNum && !isString) {
                                return null;
                            }

                            const valueColor = isNum ? (value > 0 ? 'text-green-400' : 'text-red-400') : 'text-gray-300';
                            const isPositive = isNum && value > 0;
                            
                            return (
                                <div key={label} className={`flex justify-between items-center`}>
                                    <span className="text-gray-300">{label}:</span>
                                    <span className={`font-bold ${valueColor}`}>
                                        {isPositive ? '+' : ''}{String(value)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}

                <button onClick={proceed} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">계속</button>
            </div>
        );
    };


    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 flex items-center justify-center">
            <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-lg shadow-xl border border-yellow-700/50">
                {eventPhase === 'choice' && (
                    <>
                        <h2 className="text-2xl font-bold mb-4 text-yellow-400">{currentEvent.title}</h2>
                        <p className="text-gray-300 mb-6">{currentEvent.description}</p>
                        <div className="space-y-3">
                            {currentEvent.choices.map((choice, index) => {
                                const isDisabled = choice.requiredSense && choice.requiredSense !== player.class;
                                return (
                                    <button key={index} onClick={() => handleEventChoice(choice)} disabled={isDisabled}
                                        className={`w-full p-3 text-left rounded-lg transition-colors
                                            ${isDisabled ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                        : 'bg-gray-700 hover:bg-gray-600'}`}>
                                        {choice.text}
                                        {choice.requiredSense && <span className="text-xs text-yellow-400 ml-2">[{characterData[choice.requiredSense].name} 필요]</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </>
                )}
                {eventPhase === 'coinFlip' && eventResultData?.type === 'coinFlipSetup' && (
                    <EventCoinFlip targetHeads={eventResultData.payload.targetHeads} onComplete={eventResultData.payload.onComplete} />
                )}
                {renderResult()}
            </div>
        </div>
    );
};
