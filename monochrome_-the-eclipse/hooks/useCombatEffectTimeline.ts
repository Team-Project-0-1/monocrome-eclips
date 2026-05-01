import { useEffect, useRef, useState } from 'react';
import type { AnimationControls } from 'framer-motion';
import { CombatEffect as CombatEffectData } from '../types';
import {
  CombatResultBanner,
  getEffectAmount,
  getEffectBanner,
  isPositiveDamage,
} from '../utils/combatPresentation';

interface UseCombatEffectTimelineArgs {
  combatEffects: CombatEffectData[];
  screenShakeControls: AnimationControls;
  screenFlashControls: AnimationControls;
}

export const useCombatEffectTimeline = ({
  combatEffects,
  screenShakeControls,
  screenFlashControls,
}: UseCombatEffectTimelineArgs) => {
  const [presentedEffects, setPresentedEffects] = useState<CombatEffectData[]>([]);
  const [resultBanner, setResultBanner] = useState<CombatResultBanner | null>(null);
  const processedEffectIds = useRef<Set<number>>(new Set());
  const effectTimers = useRef<number[]>([]);

  useEffect(() => () => {
    effectTimers.current.forEach(timer => window.clearTimeout(timer));
    effectTimers.current = [];
  }, []);

  useEffect(() => {
    const liveEffectIds = new Set(combatEffects.map(effect => effect.id));
    setPresentedEffects(current => current.filter(effect => liveEffectIds.has(effect.id)));

    if (combatEffects.length === 0) {
      setResultBanner(null);
    }
  }, [combatEffects]);

  const playCameraBeat = (effect: CombatEffectData) => {
    if (isPositiveDamage(effect)) {
      const heavyPlayerHit = effect.target === 'player' && getEffectAmount(effect) > 10;
      screenShakeControls.start({
        x: heavyPlayerHit ? [0, -5, 5, -4, 4, -2, 2, 0] : [0, -2, 2, -1, 1, 0],
        scale: [1, heavyPlayerHit ? 1.018 : 1.01, 1],
        transition: { duration: heavyPlayerHit ? 0.38 : 0.28, ease: 'easeOut' },
      });
      return;
    }

    if (effect.type === 'skill') {
      screenShakeControls.start({
        scale: [1, 1.016, 1],
        transition: { duration: 0.5, ease: 'easeOut' },
      });
      screenFlashControls.start({
        opacity: [0, 0.28, 0],
        transition: { duration: 0.5, ease: 'easeOut' },
      });
    }
  };

  useEffect(() => {
    const newEffects = combatEffects.filter(effect => !processedEffectIds.current.has(effect.id));

    if (newEffects.length === 0) return;

    newEffects.forEach(effect => processedEffectIds.current.add(effect.id));

    newEffects.forEach((effect, index) => {
      const timer = window.setTimeout(() => {
        setPresentedEffects(current => (
          current.some(presentedEffect => presentedEffect.id === effect.id)
            ? current
            : [...current, effect]
        ));

        const banner = getEffectBanner(effect);
        if (banner) {
          setResultBanner(banner);

          const bannerTimer = window.setTimeout(() => {
            setResultBanner(current => (current?.id === banner.id ? null : current));
          }, 1200);
          effectTimers.current.push(bannerTimer);
        }

        playCameraBeat(effect);
      }, index * 260);

      effectTimers.current.push(timer);
    });
  }, [combatEffects, screenFlashControls, screenShakeControls]);

  return { presentedEffects, resultBanner };
};
