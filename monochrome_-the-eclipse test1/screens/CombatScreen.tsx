
import React from 'react';
import { useGameStore } from '../store/gameStore';
import CharacterStatus from '../components/CharacterStatus';
import CoinDisplay from '../components/CoinDisplay';
import PatternDisplay from '../components/PatternDisplay';
import CombatPredictionPanel from '../components/CombatPredictionPanel';
import EnemyActionPanel from '../components/EnemyActionPanel';
import CombatLog from '../components/CombatLog';
import { ArrowRight, Dices } from 'lucide-react';

export const CombatScreen: React.FC = () => {
    const player = useGameStore(state => state.player);
    const enemy = useGameStore(state => state.enemy);
    const playerCoins = useGameStore(state => state.playerCoins);
    const detectedPatterns = useGameStore(state => state.detectedPatterns);
    const selectedPatterns = useGameStore(state => state.selectedPatterns);
    const usedCoinIndices = useGameStore(state => state.usedCoinIndices);
    const combatPrediction = useGameStore(state => state.combatPrediction);
    const enemyIntent = useGameStore(state => state.enemyIntent);
    const combatLog = useGameStore(state => state.combatLog);
    const flipAllCoins = useGameStore(state => state.flipAllCoins);
    const flipCoin = useGameStore(state => state.flipCoin);
    const togglePattern = useGameStore(state => state.togglePattern);
    const executeTurn = useGameStore(state => state.executeTurn);

    if (!player || !enemy) return <div>Loading Combat...</div>;
    
    const canExecute = selectedPatterns.length > 0;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CharacterStatus character={player} isPlayer={true} />
                <CharacterStatus character={enemy} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-grow">
                <div className="lg:col-span-1 bg-gray-800 p-4 rounded-lg flex flex-col gap-4">
                    <EnemyActionPanel enemy={enemy} intent={enemyIntent} />
                    <CombatLog messages={combatLog} />
                </div>

                <div className="lg:col-span-2 bg-gray-800 p-4 rounded-lg flex flex-col justify-between gap-4">
                    <div className="flex justify-center gap-3">
                        {playerCoins.map((coin, index) => (
                            <CoinDisplay key={coin.id} coin={coin} index={index} onFlip={flipCoin} isUsed={usedCoinIndices.includes(index)} />
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <PatternDisplay
                            patterns={detectedPatterns}
                            onPatternGroupClick={togglePattern}
                            selectedPatterns={selectedPatterns}
                            playerClass={player.class}
                            usedCoinIndices={usedCoinIndices}
                            acquiredSkills={player.acquiredSkills}
                        />
                        <div className="flex flex-col gap-4">
                            <CombatPredictionPanel prediction={combatPrediction} />
                            <div className="flex gap-2">
                                <button
                                    onClick={flipAllCoins}
                                    className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors shadow-md flex items-center justify-center gap-2"
                                >
                                    <Dices size={20} />
                                    다시 굴리기
                                </button>
                                <button
                                    onClick={executeTurn}
                                    disabled={!canExecute}
                                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors shadow-md flex items-center justify-center gap-2 font-bold"
                                >
                                    실행
                                    <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
