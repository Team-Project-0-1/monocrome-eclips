# Stage 3 Content Brief

Last updated: 2026-05-09
Source: Google Drive `기획서` (`1Ta50Zudk34_6qBi4sP3TjQVoPq7Su8cnQpqUBsXRbf8`, viewed 2026-05-08)

## Current Prototype Boundary

Prototype v0.1 publicly covers Stage 1 and Stage 2. Stage 3 content is documented for planning only and remains locked until concrete encounter data exists.

Approved public copy:

```text
1-2층 공개 / 3층 기획 중
```

Avoid public copy that says or implies:

```text
3스테이지 플레이 가능
완성된 3막
최종 보스 구현
엔딩 포함
```

## Gate Contract

| Beat | Content contract | Current repo action |
| --- | --- | --- |
| Normal combat 1 | Introduce Stage 3 enemy pressure. | Not implemented. Requires monster table. |
| Normal combat 2 | Increase pressure before boss. | Not implemented. Requires encounter table. |
| Boss combat | Validate build and survival plan. | Not implemented. Requires boss identity and action table. |
| Altar/reward | Offer growth or rest after boss. | Existing reward/rest systems can host this later. |

Gate 3 should target 8 total enemies and a field maximum of 3 when encounter data is authored.

## Boss Contract

The Stage 3 boss needs a concrete identity before implementation. Until then, the only locked requirements are structural:

- It appears after two normal combat beats in the gate.
- It uses the same one-turn, one-action-bundle enemy rule.
- Its next action must be readable before the player commits.
- Its HUD presentation must expose action icon, action color, target/range label, and danger emphasis.
- It should be strong enough to justify the `비기` reward, but not described publicly as implemented.

## Reward Contract

The source document assigns Gate 3 boss victory to `비기` selection.

| Reward | Rule |
| --- | --- |
| `비기` draft | Show 3 options and let the player choose 1. |
| Role | Utility tool that helps solve crisis turns. |
| Timing | Granted after boss victory at the altar/growth step. |
| Prototype status | Documented only. Do not show as a current public Stage 3 feature. |

## Data Needed Before Implementation

- Stage 3 normal monster IDs, stats, patterns, and passives.
- Stage 3 boss ID, phase rules, patterns, passives, and danger intent thresholds.
- Stage 3 event pool if the route system continues to use event nodes.
- `비기` option IDs, effects, one-per-combat or passive usage rules, and reward copy.
- Balance targets for enemy HP/attack growth from Stage 2 into Stage 3.
