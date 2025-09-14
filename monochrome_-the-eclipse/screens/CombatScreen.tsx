import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import CharacterStatus from '../components/CharacterStatus';
import CoinDisplay from '../components/CoinDisplay';
import PatternDisplay from '../components/PatternDisplay';
import CombatPredictionPanel from '../components/CombatPredictionPanel';
import EnemyActionPanel from '../components/EnemyActionPanel';
import CombatLog from '../components/CombatLog';
import { ArrowRight, Dices, Info, Swords, Shield } from 'lucide-react';
import CombatEffect from '../components/combat/CombatEffect';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { ReserveCoinArea } from '../components/ReserveCoinArea';
import ActiveSkillButton from '../components/ActiveSkillButton';
import { CoinFace } from '../types';

export const CombatScreen: React.FC = () => {
    const player = useGameStore(state => state.player);
    const enemy = useGameStore(state => state.enemy);
    const playerCoins = useGameStore(state => state.playerCoins);
    const reserveCoins = useGameStore(state => state.reserveCoins);
    const detectedPatterns = useGameStore(state => state.detectedPatterns);
    const selectedPatterns = useGameStore(state => state.selectedPatterns);
    const usedCoinIndices = useGameStore(state => state.usedCoinIndices);
    const combatPrediction = useGameStore(state => state.combatPrediction);
    const enemyIntent = useGameStore(state => state.enemyIntent);
    const combatLog = useGameStore(state => state.combatLog);
    const combatEffects = useGameStore(state => state.combatEffects);
    const removeCombatEffect = useGameStore(state => state.removeCombatEffect);
    const flipAllCoins = useGameStore(state => state.flipAllCoins);
    const flipCoin = useGameStore(state => state.flipCoin);
    const togglePattern = useGameStore(state => state.togglePattern);
    const executeTurn = useGameStore(state => state.executeTurn);
    const swapState = useGameStore(state => state.swapState);
    const initiateSwap = useGameStore(state => state.initiateSwap);
    const cancelSwap = useGameStore(state => state.cancelSwap);
    const completeSwap = useGameStore(state => state.completeSwap);
    const testMode = useGameStore(state => state.testMode);
    const activeSkillState = useGameStore(state => state.activeSkillState);
    const useActiveSkill = useGameStore(state => state.useActiveSkill);
    const handleActiveSkillCoinClick = useGameStore(state => state.handleActiveSkillCoinClick);
    const cancelActiveSkill = useGameStore(state => state.cancelActiveSkill);
    
    const screenShakeControls = useAnimation();
    const screenFlashControls = useAnimation();
    const lastProcessedEffectId = useRef(0);

    useEffect(() => {
        const latestEffectId = combatEffects.length > 0 ? Math.max(...combatEffects.map(e => e.id)) : 0;
        const newEffects = combatEffects.filter(e => e.id > lastProcessedEffectId.current);

        if (newEffects.length > 0) {
            lastProcessedEffectId.current = latestEffectId;

            newEffects.forEach(effect => {
                if (effect.type === 'damage' && effect.target === 'player' && effect.data.amount > 10) {
                    screenShakeControls.start({
                        x: [0, -4, 4, -4, 4, -2, 2, 0],
                        transition: { type: "spring", stiffness: 800, damping: 10, duration: 0.3 }
                    });
                }
                if (effect.type === 'skill' && effect.target === 'enemy') {
                    screenFlashControls.start({
                        opacity: [0, 0.4, 0],
                        transition: { duration: 0.5, ease: "easeOut" }
                    });
                }
            });
        }
    }, [combatEffects, screenShakeControls, screenFlashControls]);

    if (!player || !enemy) return <div>Loading Combat...</div>;
    
    const isSkillTargetingMode = activeSkillState.phase !== 'idle';
    const isFocusMode = isSkillTargetingMode || swapState.phase !== 'idle';
    const canExecute = selectedPatterns.length > 0 && !isFocusMode;
    
    const nonTargetClasses = isFocusMode ? 'blur-sm brightness-50 pointer-events-none' : '';
    const transitionClasses = 'transition-all duration-300';

    const onCoinClick = (index: number) => {
        if (swapState.phase === 'revealed') {
            completeSwap(index);
        } else if (isSkillTargetingMode) {
            handleActiveSkillCoinClick(index);
        } else if (testMode) {
            flipCoin(index);
        }
    };
    
    const getFocusPrompt = () => {
        if (swapState.phase === 'revealed') {
            const faceName = swapState.revealedFace === CoinFace.HEADS ? '앞면' : '뒷면';
            return `결과는 [${faceName}]! 교체할 동전을 선택하세요.`;
        }
        switch (activeSkillState.phase) {
            case 'rogue_flip': return '뒤집을 동전을 선택하세요';
            case 'tank_swap_1': return '첫 번째 교환할 동전을 선택하세요';
            case 'tank_swap_2': return '두 번째 교환할 동전을 선택하세요';
            case 'mage_lock': return '고정할 동전을 선택하세요';
            default: return null;
        }
    };

    return (
        <div className="h-screen bg-gray-900 text-white p-2 sm:p-4 overflow-hidden relative">
            <motion.div
                className="absolute inset-0 bg-red-600 pointer-events-none z-[100]"
                animate={screenFlashControls}
                initial={{ opacity: 0 }}
            />
            
            <AnimatePresence>
                {isFocusMode && (
                    <motion.div
                        className="absolute top-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <div className="bg-cyan-800/90 text-white p-3 rounded-lg shadow-lg text-center font-semibold border border-cyan-500 flex flex-col items-center justify-center gap-2">
                             {swapState.phase === 'revealed' && swapState.revealedFace && (
                                <div className="flex items-center gap-4 mb-2">
                                    <span className="text-sm">뒤집기 결과:</span>
                                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                                        swapState.revealedFace === CoinFace.HEADS
                                        ? "bg-red-500 border-red-300"
                                        : "bg-blue-500 border-blue-300"
                                    }`}>
                                        {swapState.revealedFace === CoinFace.HEADS ? <Swords size={24} /> : <Shield size={24} />}
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Info className="w-5 h-5" />
                                <p>{getFocusPrompt()}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div 
                className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full"
                animate={screenShakeControls}
            >
                {/* Left Column: Player Info & Actions */}
                <div className="flex flex-col gap-4 min-h-0">
                    <div className={`relative ${transitionClasses} ${nonTargetClasses}`}>
                        <CharacterStatus character={player} isPlayer={true} prediction={combatPrediction} />
                        <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center overflow-hidden">
                            {combatEffects.filter(e => e.target === 'player').map(effect => (
                                <CombatEffect key={effect.id} effect={effect} onComplete={removeCombatEffect} />
                            ))}
                        </div>
                    </div>
                    <div className={`bg-gray-800 p-4 rounded-lg ${transitionClasses} ${isFocusMode ? 'shadow-2xl shadow-cyan-500/30 ring-2 ring-cyan-500' : ''}`}>
                        <div className="flex justify-center gap-3">
                            {playerCoins.map((coin, index) => (
                                <CoinDisplay 
                                    key={coin.id} 
                                    coin={coin} 
                                    index={index} 
                                    onClick={isFocusMode || testMode ? () => onCoinClick(index) : null}
                                    isUsed={usedCoinIndices.includes(index)}
                                    isSwapTarget={swapState.phase === 'revealed'}
                                    isSkillTarget={isSkillTargetingMode && !activeSkillState.selection.includes(index)}
                                    isSelectedForSkill={activeSkillState.selection.includes(index)}
                                />
                            ))}
                        </div>
                        <ActiveSkillButton
                            player={player}
                            onClick={useActiveSkill}
                            isDisabled={isFocusMode}
                        />
                        <ReserveCoinArea 
                            reserveCoins={reserveCoins}
                            onInitiateSwap={initiateSwap}
                        />
                        {isFocusMode && (
                             <div className="text-center mt-4">
                                <button 
                                    onClick={swapState.phase !== 'idle' ? cancelSwap : cancelActiveSkill} 
                                    className="px-4 py-2 bg-red-600/80 text-white rounded-lg text-sm hover:bg-red-500 transition-colors shadow-md border border-red-400"
                                >
                                    취소
                                </button>
                            </div>
                        )}
                    </div>
                    <div className={`bg-gray-800 p-4 rounded-lg flex-grow min-h-0 ${transitionClasses} ${nonTargetClasses}`}>
                        <PatternDisplay
                            patterns={detectedPatterns}
                            onPatternGroupClick={togglePattern}
                            selectedPatterns={selectedPatterns}
                            playerClass={player.class}
                            usedCoinIndices={usedCoinIndices}
                            acquiredSkills={player.acquiredSkills}
                        />
                    </div>
                </div>

                {/* Middle Column: Prediction & Log */}
                <div className={`flex flex-col gap-4 min-h-0 ${transitionClasses} ${nonTargetClasses}`}>
                    <CombatPredictionPanel prediction={combatPrediction} />
                    <div className="flex gap-2">
                        {testMode && (
                            <button
                                onClick={flipAllCoins}
                                className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors shadow-md flex items-center justify-center gap-2"
                            >
                                <Dices size={20} />
                                다시 굴리기
                            </button>
                        )}
                        <button
                            onClick={executeTurn}
                            disabled={!canExecute}
                            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors shadow-md flex items-center justify-center gap-2 font-bold"
                        >
                            실행
                            <ArrowRight size={20} />
                        </button>
                    </div>
                    <div className="bg-gray-800 rounded-lg flex-grow min-h-0">
                        <CombatLog messages={combatLog} />
                    </div>
                </div>

                {/* Right Column: Enemy Info */}
                <div className={`flex flex-col gap-4 min-h-0 ${transitionClasses} ${nonTargetClasses}`}>
                    <div className="relative">
                        <CharacterStatus character={enemy} prediction={combatPrediction} />
                         <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center overflow-hidden">
                            {combatEffects.filter(e => e.target === 'enemy').map(effect => (
                                <CombatEffect key={effect.id} effect={effect} onComplete={removeCombatEffect} />
                            ))}
                        </div>
                    </div>
                    <div className="bg-gray-800 rounded-lg flex-grow min-h-0">
                      <EnemyActionPanel enemy={enemy} intent={enemyIntent} />
                    </div>
                </div>
            </motion.div>
        </div>
    );
};