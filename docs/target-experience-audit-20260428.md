# Target Experience Audit - 2026-04-28

## Target

The intended bar is:

- Slay-like run structure: route choice, visible risk/reward, combat reward choices, build continuity.
- Hades-like feel: fast transitions, strong hit/reward feedback, character-forward presentation, clear run result moments.
- Own identity: monochrome eclipse dark fantasy, coin combat, Korean UI, pixel character sprites.

## Current Gap Before This Pass

- Route selection showed nodes but did not make risk/reward sharp enough.
- Combat victory paid rewards automatically, so the player did not get a meaningful post-combat decision.
- Stage clear, victory, and defeat screens still felt like prototype placeholders.
- Some Korean copy in route/stage/memory surfaces was corrupted.
- Stage transition reset run resources and pattern growth, weakening build continuity.

## Changes Applied

- Added clear route presentation metadata in `utils/nodePresentation.ts`.
- Rebuilt route selection copy around danger, expected reward, and run pressure.
- Added `GameState.REWARD` and `CombatRewardScreen`.
- Combat victory now opens a pick-one reward screen instead of auto-paying resources.
- Added reward choices:
  - balanced cache
  - sense-focused reward
  - memory-focused reward
  - reserve coin reward for miniboss/boss tiers
- Stage transitions now preserve run resources and unlocked patterns.
- Rebuilt stage clear, victory, and defeat as cinematic run result screens.
- Cleaned Korean copy in stage data, minimap, memory altar, and route surfaces.
- Verified route -> combat -> reward -> route loop in browser.

## Remaining Gaps

- Combat reward choice needs deeper content variety: skill draft, relic-like passive, coin modifier, curse bargain.
- Lobby still needs a true run hub: character, weapon, permanent upgrades, last run history, next expedition prep.
- Enemy encounters need stronger per-monster mechanics and telegraphed counterplay.
- Hades-like feel still needs better animation timing, impact pauses, character barks, and reward stingers.
- Current audio is procedural placeholder; production audio assets are still needed.
- The run has only one stage data entry, so long-term pacing is not yet at commercial roguelike depth.

## Next High-Value Pass

Build a reward-draft system:

1. After combat, offer one of:
   - skill draft
   - pattern upgrade
   - coin modifier
   - relic/passive
   - resource cache
2. Make elite/boss reward tables different from normal fights.
3. Add a compact run build summary visible in route and shop screens.
