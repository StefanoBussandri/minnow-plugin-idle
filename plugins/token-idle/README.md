# Token Foundry

An idle game inside Minnow. The currency is tokens: the workspace usage ledger, plus tokens the foundry mints on its own.

A slim button on the right edge, from under the menu bar to the bottom of the window, shows the balance and stays visible on every page. The rest of the window is inset so it does not cover that button. Activate it to open a side panel of upgrades. The panel and the rail stay under Minnow's memory toast. A small smith walks along the bottom, between the left sidebar and that foundry edge. Most of the time he stays on the floor and only hops now and then. He squashes into an oval along the way he is traveling, then returns to a circle a little faster than before, still slower than the squash. Click him to open or close the panel. Drag and release to fling him; light friction slows a throw down to his usual walking speed and does not drag a normal walk any slower. He stays in that lane when the panel is open and when it is closed, including while you hold him. After a quiet minute the walker sleeps in place and sinks into the floor. The portrait on the on-hand card stays put. Press Rave and he bounces off every side of that lane while another copy shoots out of him about once a second. Those copies are flat circles on one canvas, and the lane is measured a few times a second instead of every frame. Rave and Token Chaos recolor the whole Minnow window, then put the previous colors back when they stop. Stop the rave and they fall onto the same floor he walks on; he eats one when he walks over it. A throw in the air barely slows down. He cycles three faces (grin, wow, focus). A chat mint makes him say one of ten lines. Tokens this workspace spends in chat are minted into the balance; there is no mint button. The direct command `/plugin-token-idle--foundry` (alias `/foundry`) and **Toggle Token Foundry** open the panel without a model.

Set this plugin's tool permission to **Full**. The chip syncs about every two seconds; **Ask** would prompt on every sync.

## How the wallet works

- Chat tokens come from every chat in this workspace, whatever the provider. A chat whose provider reports usage counts its ledger `totalTokens`; a chat without reported usage (for example the Cursor agent CLI) is estimated from its stored message length at about 4 characters per token. `tick` reads this from Minnow's `sessions.db` read-only and returns `usageSource` (`ledger` or `estimated`).
- New workspace `totalTokens` are added once. The same ledger value is never counted twice.
- If history is cleared and the ledger drops, only unspent usage still in the wallet is removed. Idle income, manual mints, and upgrades stay.
- Generators accrue while the chip is running, and catch up for at most 8 hours when the drawer next syncs.
- Each workspace has its own wallet in `foundry.json` under the plugin data directory.

## Upgrades

Prices assume one agent chat costs roughly 20k–80k tokens.

| Upgrade | Effect | First cost | Unlocks at (lifetime) |
| --- | --- | ---: | ---: |
| Ink Well | +2 tokens/s | 1,500 | — |
| Token Press | +15/s | 12,000 | — |
| Context Loom | +100/s | 90,000 | 30,000 |
| Spec Cache | +10% to all idle income | 250,000 | 100,000 |
| Batch Foundry | +600/s | 650,000 | 250,000 |
| Prompt Refinery | +3,500/s | 4,000,000 | 1,500,000 |
| Model Forge | +20,000/s | 25,000,000 | 10,000,000 |

To add an upgrade, append an entry to `upgrades.mjs`. Supported effects are `rate`, `multiplier`, and `click`; new effect types go in `EFFECTS` in `economy.mjs`. Set `retired: true` to stop selling an upgrade without taking away copies people already own.

Costs rise with each copy already owned. A mint starts at 1 token.

## Perks and power-ups

Perks are one-time upgrades: Night Shift (+8h offline catch-up), Prompt Compressor (+50% chat tokens), Sprite Beacon (sprites spawn twice as often), Long Fuse (+50% power-up duration) and Golden Hammer (+50% power-up strength).

Every 4 to 10 minutes a golden foundry sprite pops out of the smith and drifts to a nearby spot for 14 seconds. Click it to claim a random power-up: Overclock (idle x7 for 30s), Token Surge (10 minutes of idle income), Chat Frenzy (chat tokens x3 for 5 minutes), Clearance Sale (upgrades 25% off for 60s) the rare Jackpot (an hour of idle income), the 1% Token Rain (clickable tokens fall for 10 seconds, and each one is a Token Surge), or the 0.0001% Token Chaos, which grants every other rewarding power-up and cycles the app's theme every 0.2 seconds for 5 seconds. A Rave button hides behind the on-hand sprite. Click him and he steps aside for 8 seconds. Click him again and he steps back. Every 20 seconds there is also a 10% chance he steps aside on his own. The Settings tab can turn off that move, power-up sprites, and theme changes. That only cycles the theme, with no power-up rewards. Press Stop to restore the colours. Chat Frenzy bonus tokens are not clawed back. Chat usage is credited against a high-water mark, so totals that wobble while a reply streams are never re-credited; only a drop below half the peak (cleared history) claws back. Power-ups live in `powerups.mjs`.

The panel has three tabs: Build (generators), Perks, and Settings. Upgrades show as icon tiles from Minnow's bundled Flaticon set; each tab shows a count of what you can afford right now.

## Tools

- `tick { observed_tokens? }` — apply idle income and, when given, sync the ledger.
- `buy { upgrade_id }` — buy one copy. Ids are listed by `get_state`.
- `mint` — add one manual mint.
- `get_state` — read the wallet without advancing time.

`observed_tokens` must be a non-negative integer. Unknown upgrades and unaffordable buys throw. An aborted call throws `aborted` and does not write. Corrupt `foundry.json` throws instead of resetting the wallet.

## Install and remove

Give someone the whole project folder. They install the `plugins/token-idle` directory (the one that contains `plugin.json`) from Minnow’s Settings → Plugins. Set this plugin’s tool permission to **Full** before leaving it enabled. Disable or remove revokes the rail, panel, command, and slash action. Removal keeps `foundry.json` in Minnow’s plugin data directory, which is not inside this project, so sending the folder does not send a wallet.

## Tests

From the project root, with Node 20 or newer:

```sh
npm test
```
