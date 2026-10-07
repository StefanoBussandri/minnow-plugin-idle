// Upgrade catalog. To add an upgrade, append an entry; economy, tools, and UI read everything from here.
//
// Fields:
//   id         stable key stored in foundry.json (never rename once shipped)
//   name/blurb display text
//   baseCost   price of the first copy, in tokens
//   growth     price multiplier per copy already owned
//   effects    { rate: tokens/s per copy, multiplier: +fraction of idle income per copy, click: +tokens per manual mint }
//   unlockAt   lifetime tokens earned before it can be bought (default 0)
//   retired    keep owned copies working but stop selling it
//   kind       'generator' (default) or 'perk'; perks are listed separately in the panel
//   maxOwned   cap on copies; perks use 1
//
// Effect types (see EFFECTS in economy.mjs): rate, multiplier, click, chatBonus,
// offlineHours, buffDuration, buffStrength, spawnRate.
//
// Prices assume an agent chat costs roughly 20k-80k tokens, so the first generator
// takes a turn or two and each tier is about a day of normal use beyond the last.

export const UPGRADES = [
  {
    id: 'inkwell',
    name: 'Ink Well',
    blurb: 'A slow drip of spare tokens.',
    baseCost: 1_500,
    growth: 1.15,
    effects: { rate: 2 },
  },
  {
    id: 'press',
    name: 'Token Press',
    blurb: 'Stamps out tokens around the clock.',
    baseCost: 12_000,
    growth: 1.15,
    effects: { rate: 15 },
  },
  {
    id: 'loom',
    name: 'Context Loom',
    blurb: 'Weaves leftover context into currency.',
    baseCost: 90_000,
    growth: 1.16,
    effects: { rate: 100 },
    unlockAt: 30_000,
  },
  {
    id: 'cache',
    name: 'Spec Cache',
    blurb: 'Speculative decoding for your whole foundry.',
    baseCost: 250_000,
    growth: 1.6,
    effects: { multiplier: 0.1 },
    unlockAt: 100_000,
  },
  {
    id: 'foundry',
    name: 'Batch Foundry',
    blurb: 'Smelts finished requests into a steady stream.',
    baseCost: 650_000,
    growth: 1.17,
    effects: { rate: 600 },
    unlockAt: 250_000,
  },
  {
    id: 'refinery',
    name: 'Prompt Refinery',
    blurb: 'Distills long prompts down to pure yield.',
    baseCost: 4_000_000,
    growth: 1.18,
    effects: { rate: 3_500 },
    unlockAt: 1_500_000,
  },
  {
    id: 'forge',
    name: 'Model Forge',
    blurb: 'Hammers out fresh weights that print tokens.',
    baseCost: 25_000_000,
    growth: 1.19,
    effects: { rate: 20_000 },
    unlockAt: 10_000_000,
  },
  {
    id: 'quant',
    name: 'Quantized Weights',
    blurb: 'Smaller numbers, same output. Every generator runs faster.',
    baseCost: 3_000_000,
    growth: 2.2,
    effects: { multiplier: 0.25 },
    unlockAt: 1_000_000,
  },
  {
    id: 'cluster',
    name: 'Inference Cluster',
    blurb: 'Racks of accelerators humming in the back room.',
    baseCost: 160_000_000,
    growth: 1.2,
    effects: { rate: 120_000 },
    unlockAt: 60_000_000,
  },
  {
    id: 'core',
    name: 'Singularity Core',
    blurb: 'Nobody is sure where the tokens come from anymore.',
    baseCost: 1_100_000_000,
    growth: 1.21,
    effects: { rate: 800_000 },
    unlockAt: 400_000_000,
  },
  {
    id: 'nightshift',
    kind: 'perk',
    name: 'Night Shift',
    blurb: 'The foundry keeps working longer while you are away.',
    baseCost: 600_000,
    growth: 2,
    maxOwned: 1,
    effects: { offlineHours: 8 },
    unlockAt: 200_000,
  },
  {
    id: 'compressor',
    kind: 'perk',
    name: 'Prompt Compressor',
    blurb: 'Squeezes extra value out of every chat.',
    baseCost: 1_500_000,
    growth: 2,
    maxOwned: 1,
    effects: { chatBonus: 0.5 },
    unlockAt: 600_000,
  },
  {
    id: 'beacon',
    kind: 'perk',
    name: 'Sprite Beacon',
    blurb: 'Foundry sprites show up twice as often.',
    baseCost: 3_000_000,
    growth: 2,
    maxOwned: 1,
    effects: { spawnRate: 1 },
    unlockAt: 1_200_000,
  },
  {
    id: 'fuse',
    kind: 'perk',
    name: 'Long Fuse',
    blurb: 'Power-ups last half again as long.',
    baseCost: 8_000_000,
    growth: 2,
    maxOwned: 1,
    effects: { buffDuration: 0.5 },
    unlockAt: 3_000_000,
  },
  {
    id: 'hammer',
    kind: 'perk',
    name: 'Golden Hammer',
    blurb: 'Power-ups hit harder.',
    baseCost: 20_000_000,
    growth: 2,
    maxOwned: 1,
    effects: { buffStrength: 0.5 },
    unlockAt: 8_000_000,
  },
  {
    id: 'stamp',
    name: 'Hand Stamp',
    blurb: 'Adds tokens to a manual mint.',
    baseCost: 40,
    growth: 1.18,
    effects: { click: 1 },
    retired: true,
  },
];

export function findUpgrade(id) {
  return UPGRADES.find((upgrade) => upgrade.id === id);
}
