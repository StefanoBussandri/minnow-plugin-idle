// Power-up catalog. The foundry sprite spawns with a random entry, picked by weight; clicking it claims the power-up.
// To add one, append an entry here; the economy, claim_powerup tool, and test buttons read from this list.
//
// Fields:
//   id/name/blurb  stable key and display text
//   weight         relative chance of being picked for a random spawn
//   durationMs     how long a timed buff lasts (Long Fuse extends it)
//   buff           timed effect: { idleMultiplier, chatMultiplier, discount }
//   instant        one-shot payout: { idleSeconds: seconds of current idle income, minimum: floor in tokens }
// Golden Hammer scales every buff and payout.

export const POWERUPS = [
  {
    id: 'overclock',
    name: 'Overclock',
    blurb: 'Idle income x7 for 30 seconds.',
    weight: 40,
    durationMs: 30_000,
    buff: { idleMultiplier: 7 },
  },
  {
    id: 'surge',
    name: 'Token Surge',
    blurb: 'Instantly mints 10 minutes of idle income.',
    weight: 22,
    instant: { idleSeconds: 600, minimum: 5_000 },
  },
  {
    id: 'frenzy',
    name: 'Chat Frenzy',
    blurb: 'Chat tokens mint x3 for 5 minutes.',
    weight: 18,
    durationMs: 300_000,
    buff: { chatMultiplier: 3 },
  },
  {
    id: 'sale',
    name: 'Clearance Sale',
    blurb: 'Upgrades cost 25% less for 60 seconds.',
    weight: 14,
    durationMs: 60_000,
    buff: { discount: 0.25 },
  },
  {
    id: 'jackpot',
    name: 'Jackpot',
    blurb: 'Instantly mints an hour of idle income.',
    weight: 6,
    instant: { idleSeconds: 3_600, minimum: 50_000 },
  },
  {
    // 1.010102 / (100.0001 + 1.010102) is 1% of sprite rolls.
    id: 'rain',
    name: 'Token Rain',
    blurb: 'Tokens fall for 10 seconds. Each one is a Token Surge.',
    weight: 1.010102,
    durationMs: 10_000,
    rain: true,
  },
  {
    // Weight 0.0001 against the ~100 total above is a 0.0001% spawn chance.
    id: 'chaos',
    name: 'Token Chaos',
    blurb: 'Every power-up at once, and the app cannot pick a theme.',
    weight: 0.0001,
    durationMs: 5_000,
    combo: true,
    buff: { chaos: true },
  },
];

export function findPowerup(id) {
  return POWERUPS.find((powerup) => powerup.id === id);
}
