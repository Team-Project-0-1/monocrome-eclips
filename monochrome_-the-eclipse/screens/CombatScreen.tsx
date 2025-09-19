import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import CharacterStatus from '../components/CharacterStatus';
import CoinDisplay from '../components/CoinDisplay';
import PatternDisplay from '../components/PatternDisplay';
import CombatPredictionPanel from '../components/CombatPredictionPanel';
import EnemyActionPanel from '../components/EnemyActionPanel';
import CombatLog from '../components/CombatLog';
import HealthBar from '../components/HealthBar';
import EnhancedStatusEffectDisplay from '../components/EnhancedStatusEffectDisplay';
import { ArrowRight, Dices, Info, Swords, Shield } from 'lucide-react';
import CombatEffect from '../components/combat/CombatEffect';
import CombatPortrait, { PortraitAnimationState } from '../components/combat/CombatPortrait';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { ReserveCoinArea } from '../components/ReserveCoinArea';
import ActiveSkillButton from '../components/ActiveSkillButton';
import { CoinFace, PatternType } from '../types';
import { monsterData, monsterPatterns } from '../dataMonsters';

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

    // 캐릭터 애니메이션 상태 관리
    const [playerAnimationState, setPlayerAnimationState] = React.useState<PortraitAnimationState>('idle');
    const [enemyAnimationState, setEnemyAnimationState] = React.useState<PortraitAnimationState>('idle');

    useEffect(() => {
        const latestEffectId = combatEffects.length > 0 ? Math.max(...combatEffects.map(e => e.id)) : 0;
        const newEffects = combatEffects.filter(e => e.id > lastProcessedEffectId.current);

        if (newEffects.length > 0) {
            lastProcessedEffectId.current = latestEffectId;

            newEffects.forEach(effect => {
                // 기존 화면 효과
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

                // 새로운 캐릭터 애니메이션
                if (effect.type === 'damage') {
                    if (effect.target === 'player') {
                        setPlayerAnimationState('hurt');
                        setTimeout(() => setPlayerAnimationState('idle'), 500);
                    } else {
                        setEnemyAnimationState('hurt');
                        setTimeout(() => setEnemyAnimationState('idle'), 500);
                    }
                }

                if (effect.type === 'skill') {
                    if (effect.target === 'enemy') {
                        setPlayerAnimationState('attack');
                        setTimeout(() => setPlayerAnimationState('idle'), 300);
                    } else {
                        setEnemyAnimationState('attack');
                        setTimeout(() => setEnemyAnimationState('idle'), 300);
                    }
                }
            });
        }
    }, [combatEffects, screenShakeControls, screenFlashControls]);

    // 캐릭터 사망 상태 체크
    useEffect(() => {
        if (player && player.currentHp <= 0 && playerAnimationState !== 'death') {
            setPlayerAnimationState('death');
        }
        if (enemy && enemy.currentHp <= 0 && enemyAnimationState !== 'death') {
            setEnemyAnimationState('death');
        }
    }, [player?.currentHp, enemy?.currentHp, playerAnimationState, enemyAnimationState]);

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
                className="flex flex-col h-full gap-3"
                animate={screenShakeControls}
            >
                {/* Top Section: 배틀 영역 - Character Face-off */}
                <div className={`flex justify-center items-center px-6 py-4 ${transitionClasses} ${nonTargetClasses}`}>
                    {/* Player Portrait - Left */}
                    <div className="relative">
                        <div className="w-32 h-32 sm:w-40 sm:h-40">
                            <CombatPortrait
                                character={player}
                                isPlayer
                                subdued={isFocusMode}
                                animationState={playerAnimationState}
                                healthPercentage={player.currentHp / player.maxHp}
                            />
                        </div>
                        <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center overflow-hidden">
                            {combatEffects.filter(e => e.target === 'player').map(effect => (
                                <CombatEffect key={effect.id} effect={effect} onComplete={removeCombatEffect} />
                            ))}
                        </div>
                    </div>

                    {/* Center VS */}
                    <div className="flex flex-col items-center mx-6 sm:mx-8">
                        <div className="text-3xl sm:text-4xl font-bold text-gray-300 animate-pulse">VS</div>
                    </div>

                    {/* Enemy Portrait - Right */}
                    <div className="relative">
                        <div className="w-32 h-32 sm:w-40 sm:h-40">
                            <CombatPortrait
                                character={enemy}
                                subdued={isFocusMode}
                                animationState={enemyAnimationState}
                                healthPercentage={enemy.currentHp / enemy.maxHp}
                            />
                        </div>
                        <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center overflow-hidden">
                            {combatEffects.filter(e => e.target === 'enemy').map(effect => (
                                <CombatEffect key={effect.id} effect={effect} onComplete={removeCombatEffect} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Middle Section: 스테이터스 영역 (이름/아이콘 제외, HP와 스탯만) */}
                <div className={`grid grid-cols-3 gap-4 px-3 ${transitionClasses} ${nonTargetClasses}`}>
                    {/* Player Status - Minimal */}
                    <div className="bg-gray-800 p-3 rounded-lg">
                        <div className="relative">
                            <div className="mb-2">
                                <HealthBar
                                    current={player.currentHp}
                                    max={player.maxHp}
                                    temporaryDefense={Number(player.temporaryDefense) || 0}
                                    predictedDamage={combatPrediction?.damageToPlayer}
                                    isPlayer={true}
                                />
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex gap-2">
                                    <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-black/20">
                                        <Swords size={10} className="text-red-300"/>
                                        <span className="text-xs font-bold">{player.baseAtk}</span>
                                    </div>
                                    <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-black/20">
                                        <Shield size={10} className="text-blue-300"/>
                                        <span className="text-xs font-bold">{player.baseDef}</span>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <EnhancedStatusEffectDisplay effects={player.statusEffects} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Combat Prediction */}
                    <div className="bg-gray-800 p-3 rounded-lg">
                        <CombatPredictionPanel prediction={combatPrediction} />
                    </div>

                    {/* Enemy Status - Minimal */}
                    <div className="bg-gray-800 p-3 rounded-lg">
                        <div className="relative">
                            <div className="mb-2">
                                <HealthBar
                                    current={enemy.currentHp}
                                    max={enemy.maxHp}
                                    temporaryDefense={Number(enemy.temporaryDefense) || 0}
                                    predictedDamage={combatPrediction?.damageToEnemy}
                                    isPlayer={false}
                                />
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex gap-2">
                                    <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-black/20">
                                        <Swords size={10} className="text-red-300"/>
                                        <span className="text-xs font-bold">{enemy.baseAtk}</span>
                                    </div>
                                    <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-black/20">
                                        <Shield size={10} className="text-blue-300"/>
                                        <span className="text-xs font-bold">{enemy.baseDef}</span>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <EnhancedStatusEffectDisplay effects={enemy.statusEffects} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: 플레이어/적 대칭 구조 */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-3 px-3 pb-3 min-h-0 overflow-hidden">
                    {/* Left: Player Section */}
                    <div className="flex flex-col gap-2 min-h-0">
                        {/* Player Coins */}
                        <div className={`bg-gray-800 p-3 rounded-lg ${transitionClasses} ${isFocusMode ? 'shadow-2xl shadow-cyan-500/30 ring-2 ring-cyan-500' : ''}`}>
                            <h4 className="text-center text-xs font-bold text-cyan-400 mb-2">플레이어 동전</h4>
                            <div className="flex justify-center gap-2">
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
                        </div>

                        {/* Player Actions */}
                        <div className={`bg-gray-800 p-3 rounded-lg ${transitionClasses}`}>
                            <h4 className="text-center text-xs font-bold text-cyan-400 mb-2">플레이어 행동</h4>

                            {/* 고유 기술과 실행 버튼을 나란히 배치 */}
                            <div className="flex gap-3 mb-3">
                                {/* 좌측: 고유 기술 (축소) */}
                                <div className="flex-1">
                                    <ActiveSkillButton
                                        player={player}
                                        onClick={useActiveSkill}
                                        isDisabled={isFocusMode}
                                    />
                                </div>

                                {/* 우측: 실행/재굴림 버튼 */}
                                <div className="flex flex-col gap-2 min-w-[120px]">
                                    <button
                                        onClick={executeTurn}
                                        disabled={!canExecute}
                                        className="px-3 py-3 bg-green-600 text-white rounded-md hover:bg-green-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-bold text-sm"
                                    >
                                        실행
                                        <ArrowRight size={16} />
                                    </button>
                                    {testMode && (
                                        <button
                                            onClick={flipAllCoins}
                                            className="px-3 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors flex items-center justify-center gap-2 text-sm font-bold"
                                        >
                                            <Dices size={16} />
                                            재굴림
                                        </button>
                                    )}
                                </div>
                            </div>

                            <ReserveCoinArea
                                reserveCoins={reserveCoins}
                                onInitiateSwap={initiateSwap}
                            />
                            {isFocusMode && (
                                 <div className="text-center mt-2">
                                    <button
                                        onClick={swapState.phase !== 'idle' ? cancelSwap : cancelActiveSkill}
                                        className="px-3 py-1.5 bg-red-600/80 text-white rounded-md text-sm hover:bg-red-500 transition-colors shadow-sm border border-red-400"
                                    >
                                        취소
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Player Patterns */}
                        <div className={`bg-gray-800 p-3 rounded-lg flex-grow min-h-0 overflow-hidden ${transitionClasses} ${nonTargetClasses ? 'opacity-50' : ''}`}>
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <h4 className="text-xs font-bold text-cyan-400">플레이어 보유 기술</h4>
                                <span className="text-xs text-gray-400">
                                    ({Array.from(new Set(detectedPatterns.map(p => `${p.type}-${p.face || 'special'}`))).length} 종류)
                                </span>
                            </div>
                            <div className="h-full overflow-y-auto">
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
                    </div>

                    {/* Center: Combat Log */}
                    <div className={`flex flex-col min-h-0 ${transitionClasses} ${nonTargetClasses}`}>
                        <div className="bg-gray-800 rounded-lg flex-grow min-h-0 overflow-hidden">
                            <div className="h-full">
                                <CombatLog messages={combatLog} />
                            </div>
                        </div>
                    </div>

                    {/* Right: Enemy Section */}
                    <div className={`flex flex-col gap-2 min-h-0 ${transitionClasses} ${nonTargetClasses}`}>
                        {/* Enemy Coins */}
                        <div className="bg-gray-800 p-3 rounded-lg">
                            <h4 className="text-center text-xs font-bold text-red-400 mb-2">적 동전</h4>
                            <div className="flex justify-center gap-2">
                                {enemy.coins?.map((coin, index) => {
                                    const isUsed = enemyIntent?.sourceCoinIndices?.includes(index) || false;
                                    return (
                                        <div key={coin.id} className="relative text-center flex flex-col items-center">
                                            <div className="relative w-12 h-12">
                                                <div
                                                    className={`relative w-full h-full rounded-full border-4 flex items-center justify-center font-bold text-xl shadow-md transition-transform ${
                                                    coin.face === CoinFace.HEADS
                                                        ? "bg-red-500 border-red-300 text-white"
                                                        : "bg-blue-500 border-blue-300 text-white"
                                                    } ${isUsed ? "ring-4 ring-yellow-400 ring-offset-2 ring-offset-gray-800" : ""}`}
                                                >
                                                    {coin.face === CoinFace.HEADS ? (
                                                    <Swords size={20} />
                                                    ) : (
                                                    <Shield size={20} />
                                                    )}
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-400 mt-1">#{index + 1}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Enemy Actions */}
                        <div className="bg-gray-800 p-3 rounded-lg">
                            <h4 className="text-center text-xs font-bold text-red-400 mb-2">적 행동</h4>
                            {enemyIntent && (
                                <div className="p-3 bg-gray-900/50 rounded-md text-center border border-gray-700 animate-pulse">
                                    <p className="font-bold text-lg text-white mb-2">{enemyIntent.description}</p>
                                    <div className="flex justify-center items-center gap-4 text-sm text-gray-300">
                                        {enemyIntent.damage > 0 && (
                                            <span className="flex items-center gap-1">
                                                <Swords size={16} className="text-red-400" />
                                                피해: {enemyIntent.damage}
                                            </span>
                                        )}
                                        {enemyIntent.defense > 0 && (
                                            <span className="flex items-center gap-1">
                                                <Shield size={16} className="text-blue-400" />
                                                방어: {enemyIntent.defense}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Enemy Patterns */}
                        <div className="bg-gray-800 p-3 rounded-lg flex-grow min-h-0 overflow-hidden">
                            <h4 className="text-center text-xs font-bold text-red-400 mb-2">적 보유 기술</h4>
                            <div className="h-full overflow-y-auto">
                                {enemy && (
                                    <div className="space-y-2">
                                        {(monsterData[enemy.key]?.patterns || []).map((skillKey) => {
                                            const skillDef = monsterPatterns[skillKey];
                                            if (!skillDef) return null;

                                            const isUsed = enemyIntent?.sourcePatternKeys?.includes(skillKey) || false;
                                            const isDetected = enemy.detectedPatterns?.some(p => p.type === skillDef.type && (!skillDef.face || p.face === skillDef.face)) || false;

                                            const patternTypeNames = {
                                                [PatternType.PAIR]: "2연",
                                                [PatternType.TRIPLE]: "3연",
                                                [PatternType.QUAD]: "4연",
                                                [PatternType.PENTA]: "5연",
                                                [PatternType.UNIQUE]: "유일",
                                                [PatternType.AWAKENING]: "각성",
                                            };
                                            const coinFaceNames = {
                                                [CoinFace.HEADS]: "앞면",
                                                [CoinFace.TAILS]: "뒷면",
                                            };

                                            const patternTypeName = patternTypeNames[skillDef.type];
                                            const faceName = skillDef.face ? `(${coinFaceNames[skillDef.face]})` : '';

                                            return (
                                                <div
                                                    key={skillKey}
                                                    className={`p-3 rounded-lg border-2 transition-all ${
                                                    isUsed
                                                        ? 'bg-red-900/40 border-yellow-400 shadow-lg'
                                                        : isDetected
                                                        ? 'bg-gray-700/80 border-gray-600'
                                                        : 'bg-gray-800 border-gray-700 opacity-50'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className={`font-bold ${isDetected ? 'text-gray-100' : 'text-gray-500'}`}>
                                                        {skillDef.name}
                                                        </span>
                                                        <span className={`text-xs ${isDetected ? 'text-gray-400' : 'text-gray-600'}`}>
                                                        {patternTypeName} {faceName}
                                                        </span>
                                                    </div>
                                                    <div className={`text-xs ${isDetected ? 'text-gray-300' : 'text-gray-500'}`}>
                                                        {skillDef.description}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {(!enemy || !monsterData[enemy.key]?.patterns?.length) && (
                                            <p className="text-center text-gray-500 text-sm py-4">기술 없음</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};