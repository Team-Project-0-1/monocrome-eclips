# Prototype Product Brief

Version: Prototype v0.1
Last updated: 2026-05-09

## Positioning

`Monochrome: The Eclipse` is a portfolio-ready browser prototype for a turn-based roguelite RPG where coin faces become combat patterns. The release is meant to prove the core combat loop, visual direction, and production discipline, not to claim a finished commercial campaign.

## Player Promise

The player should understand this within the first few minutes:
- Flip and read five coins.
- Select matching patterns.
- Compare expected damage, defense, and enemy intent.
- Choose route nodes and rewards that change the next fight.
- Finish the available prototype scope and see that deeper content is still planned.

## Release Scope

Included:
- Playable lobby, character select, exploration, combat, reward, event, shop, rest, game over, and stage clear flows.
- Stage 1 and Stage 2 combat content connected through the current route system.
- Character-specific combat tools and passive validation coverage.
- Responsive desktop and mobile portrait smoke-tested layout.
- Release metadata, web app manifest, icons, cache/security headers, and dist budget checks.

Explicitly not included:
- Finished Stage 3 content.
- Playable Stage 3 route nodes, boss data, or ending flow.
- Final paid-release asset provenance approval.
- Production analytics dashboard.
- Full automated browser E2E suite.

## Portfolio Narrative

Use this when presenting the project:

> I built a React/Vite browser game prototype with a custom coin-pattern combat system, Zustand state slices, data-driven monsters/events, persistent run recovery, asset optimization, release checks, and a documented operations path. The current build is positioned as Prototype v0.1 because the planned third stage is still in design.

## Quality Bar

The prototype is shippable when:
- `npm run prototype:check` passes.
- The first screen clearly labels the build as `Prototype v0.1`.
- The public copy does not imply a finished paid game.
- Stage 3 stays locked in code; its current repo docs describe only the next design target.
- A reviewer can find the product brief, release criteria, user-required actions, and operations playbook without asking the developer.

## Demo Script

Recommended 3-5 minute portfolio walkthrough:
1. Show the menu label and accessibility/audio options.
2. Start a new run and pick a character.
3. Choose a route node and enter combat.
4. Explain coin faces, pattern selection, enemy intent, and combat prediction.
5. Claim a reward and show how the run branches through event/shop/rest states.
6. End by showing the release/operations docs and verification command.

## Next Product Gates

Before calling it Early Access:
- Stage 3 monster table, boss identity, event table, and reward pressure expand beyond the structural PRD.
- At least 10 external playtest notes exist.
- Two or more characters have clear replay appeal.
- Asset/audio commercial rights are approved.
- A committed browser smoke suite replaces ad hoc manual smoke checks.

## Stage 3 Planning Docs

- [stage-3-prd.md](./stage-3-prd.md) records the source-derived gate, boss, and reward requirements.
- [stage-3-content-brief.md](./stage-3-content-brief.md) keeps public wording inside the Stage 1-2 playable prototype scope.
