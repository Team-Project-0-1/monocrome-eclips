# Stage 3 PRD

Last updated: 2026-05-09
Source: Google Drive `기획서` (`1Ta50Zudk34_6qBi4sP3TjQVoPq7Su8cnQpqUBsXRbf8`, viewed 2026-05-08)

## Status

Stage 3 is a planned, locked content area for the current prototype. This document captures only the gate, boss, and reward structure that is needed before production content is authored. It does not unlock Stage 3 in `dataStages.ts`, and it does not add new monsters, events, or named boss copy.

Public copy must continue to describe Prototype v0.1 as a Stage 1-2 playable prototype with Stage 3 in design.

## Product Goal

Stage 3 should prove that the run can support a third escalation layer without expanding the public prototype promise. The player should understand that the third gate is the next planned design target: a denser enemy set, a boss check, and a run-defining `비기` reward.

## Source-Derived Structure

| Area | Stage 3 requirement |
| --- | --- |
| Gate loop | One gate consists of two normal combats followed by a boss combat, then altar maintenance/growth. |
| Encounter pressure | Gate 3 target is total enemy count 8 with up to 3 enemies on the field. |
| Boss role | The boss is the gate check that validates the player's build before the altar reward. |
| Boss behavior rule | Boss actions must remain readable as one announced action bundle per enemy turn. |
| Reward | Gate 3 boss victory grants a `비기` choice: 3 options, choose 1. |
| Post-boss flow | After reward/rest resolution, the run advances toward later gates only in future full-scope builds. |

## Prototype Acceptance Criteria

- Stage 3 remains locked in code until a monster pool, boss identity, event pool, and reward table are authored.
- Prototype metadata and menu copy say Stage 1-2 is playable and Stage 3 is planned/in design.
- Any Stage 3 design copy avoids promising a playable ending, final campaign, or paid-release scope.
- The Stage 3 boss spec requires enemy intent UI to show icon, color, target/range label, and danger emphasis.
- The `비기` reward is documented as a future boss reward, not a current public build feature.

## Non-Goals

- No new Stage 3 monster names, boss names, event text, or skill tables are inferred here.
- No 8-gate full run claim is made for Prototype v0.1.
- No paid Early Access copy is approved by this document.

## Implementation Notes

- Keep `stageData[3].combatPool`, `miniboss`, `boss`, and `eventPool` empty until content tables exist.
- Treat this PRD as a gate for future data work: the next implementation pass needs concrete enemy, boss, event, and `비기` option IDs.
- Use [stage-3-content-brief.md](./stage-3-content-brief.md) as the companion content contract.
