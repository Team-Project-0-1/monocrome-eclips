import React, { useState } from 'react';
import { ArrowRight, Sparkles, UserRoundSearch } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import Panel from '../components/ui/Panel';
import ActionButton from '../components/ui/ActionButton';
import RunStatusModal from '../components/RunStatusModal';
import { assetCssUrl, assetPath } from '../utils/assetPath';
import { playGameSfx, playUiSound } from '../utils/sound';
import { playerSkillUnlocks } from '../dataSkills';
import { patternUpgrades } from '../dataUpgrades';
import { getRewardIconPath } from '../utils/resourceAssets';

export const CombatRewardScreen = () => {
  const pendingCombatReward = useGameStore(state => state.pendingCombatReward);
  const claimCombatReward = useGameStore(state => state.claimCombatReward);
  const gameOptions = useGameStore(state => state.gameOptions);
  const player = useGameStore(state => state.player);
  const [isRunStatusOpen, setIsRunStatusOpen] = useState(false);

  if (!pendingCombatReward) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
        보상 데이터를 불러오는 중...
      </main>
    );
  }

  const claimReward = (choiceId: string) => {
    playUiSound(gameOptions.soundEnabled, 'confirm');
    playGameSfx(gameOptions.soundEnabled, 'rewardItem');
    claimCombatReward(choiceId);
  };

  return (
    <main
      className="combat-reward-screen relative min-h-screen overflow-hidden bg-gray-950 p-4 text-white scanlines sm:p-6"
      style={{
        backgroundImage: `linear-gradient(180deg,rgba(2,6,23,0.18),rgba(2,6,23,0.90)),${assetCssUrl('assets/backgrounds/combat-reward-chest.png')}`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }}
    >
      <div className="absolute inset-0 bg-black/58" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_14%,rgba(250,204,21,0.14),transparent_24%),linear-gradient(180deg,transparent,rgba(0,0,0,0.78))]" />

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-2rem)] max-w-6xl flex-col justify-center gap-5">
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-md border border-yellow-200/30 bg-yellow-950/30 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-yellow-100">
              <Sparkles className="h-4 w-4" />
              Reward Choice
            </div>
            <ActionButton
              variant="ghost"
              className="min-h-10 border border-white/10 px-3 py-2 text-sm"
              onClick={() => {
                playUiSound(gameOptions.soundEnabled, 'select');
                setIsRunStatusOpen(true);
              }}
            >
              <UserRoundSearch className="h-4 w-4" />
              현재 상태
            </ActionButton>
          </div>
          <h1 className="font-orbitron text-4xl font-black text-white sm:text-6xl">전투 보상</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
            {pendingCombatReward.enemyName}의 신호가 무너졌습니다. 지금 고르는 보상은 다음 방의 선택지를 바꿉니다.
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          {pendingCombatReward.choices.map((choice) => {
            const rewardEntries = Object.entries(choice.rewards).filter(([, value]) => value);
            const skillReward = choice.skillId && player
              ? playerSkillUnlocks[player.class]?.[choice.skillId]
              : null;
            const passiveReward = choice.passiveId && player
              ? patternUpgrades[player.class]?.[choice.passiveId]
              : null;

            return (
              <button
                key={choice.id}
                type="button"
                onClick={() => claimReward(choice.id)}
                className="combat-reward-choice group min-h-[220px] rounded-lg border border-yellow-200/20 bg-black/52 p-4 text-left shadow-2xl shadow-black/30 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-yellow-200/55 hover:bg-yellow-950/26 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-200"
              >
                <div className="flex h-full flex-col">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-yellow-100/70">Pick One</div>
                      <h2 className="mt-1 text-2xl font-black text-white">{choice.label}</h2>
                    </div>
                    <ArrowRight className="h-5 w-5 text-yellow-100 transition-transform group-hover:translate-x-1" />
                  </div>

                  <p className="flex-1 text-sm leading-relaxed text-slate-300">{choice.description}</p>

                  <div className="mt-4 grid gap-2">
                    {skillReward && (
                      <span className="inline-flex items-center justify-between rounded-md border border-white/10 bg-white/7 px-3 py-2 text-sm font-bold text-white">
                        <span className="inline-flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-yellow-200" />
                          기술
                        </span>
                        <strong className="text-yellow-100">{skillReward.name}</strong>
                      </span>
                    )}
                    {passiveReward && (
                      <span className="inline-flex items-center justify-between rounded-md border border-white/10 bg-white/7 px-3 py-2 text-sm font-bold text-white">
                        <span className="inline-flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-cyan-200" />
                          패시브
                        </span>
                        <strong className="text-cyan-100">{passiveReward.name}</strong>
                      </span>
                    )}
                    {rewardEntries.map(([key, value]) => {
                      const rewardImagePath = getRewardIconPath(key);
                      const label = key === 'echoRemnants'
                        ? '에코'
                        : key === 'senseFragments'
                          ? '감각 조각'
                          : key === 'memoryPieces'
                            ? '기억 조각'
                            : '행운 동전';
                      const displayValue = typeof value === 'boolean' ? '+1' : `+${value}`;

                      return (
                        <span key={key} className="inline-flex items-center justify-between rounded-md border border-white/10 bg-white/7 px-3 py-2 text-sm font-bold text-white">
                          <span className="inline-flex items-center gap-2">
                            {rewardImagePath ? (
                              <img className="reward-entry-icon" src={assetPath(rewardImagePath)} alt="" loading="lazy" />
                            ) : (
                              <Sparkles className="h-4 w-4 text-yellow-200" />
                            )}
                            {label}
                          </span>
                          <strong className="text-yellow-100">{displayValue}</strong>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <Panel className="combat-reward-tip p-3 text-xs leading-relaxed text-slate-300" tone="gold">
          보상은 자동 지급되지 않습니다. 체력이 넉넉하면 성장 자원을, 다음 전투가 불안하면 즉시 전투력을 보강할 수 있는 선택을 우선하세요.
        </Panel>
      </section>

      <RunStatusModal isOpen={isRunStatusOpen} onClose={() => setIsRunStatusOpen(false)} />
    </main>
  );
};
