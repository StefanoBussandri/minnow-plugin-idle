import { findPowerup, POWERUPS } from './powerups.mjs';
import { findUpgrade, UPGRADES } from './upgrades.mjs';

export { POWERUPS, UPGRADES };
export const MAX_OFFLINE_MS = 8 * 60 * 60 * 1000;
export const RESET_RATIO = 0.5;
// Each generator doubles its output when owned copies reach these counts.
export const MILESTONES = [10, 25, 50, 100, 150, 200, 300, 400, 500];
// Prestige: insight = floor(sqrt(lifetime this run / PRESTIGE_UNIT)); each point is +INSIGHT_BONUS income.
export const PRESTIGE_UNIT = 100_000_000;
export const INSIGHT_BONUS = 0.05;

export function milestoneMultiplier(owned) {
  return 2 ** MILESTONES.filter((at) => owned >= at).length;
}

export function nextMilestone(owned) {
  return MILESTONES.find((at) => owned < at) ?? null;
}

const pct = (value) => Math.round(value * 100);

// Each effect type folds per-copy values into production totals and describes itself for the UI.
export const EFFECTS = {
  rate: { apply: (t, value, count) => { t.rate += value * count; }, label: (value) => `+${value.toLocaleString('en-US')}/s` },
  multiplier: { apply: (t, value, count) => { t.bonus += value * count; }, label: (value) => `+${pct(value)}% idle` },
  click: { apply: (t, value, count) => { t.click += value * count; }, label: (value) => `+${value} per mint` },
  chatBonus: { apply: (t, value, count) => { t.chatBonus += value * count; }, label: (value) => `+${pct(value)}% chat tokens` },
  offlineHours: { apply: (t, value, count) => { t.offlineHours += value * count; }, label: (value) => `+${value}h offline catch-up` },
  buffDuration: { apply: (t, value, count) => { t.buffDuration += value * count; }, label: (value) => `+${pct(value)}% power-up duration` },
  buffStrength: { apply: (t, value, count) => { t.buffStrength += value * count; }, label: (value) => `+${pct(value)}% power-up strength` },
  spawnRate: { apply: (t, value, count) => { t.spawnRate += value * count; }, label: (value) => `+${pct(value)}% sprite spawns` },
};

function round(value) {
  return Math.round(value * 1000) / 1000;
}

export function freshState(now = Date.now()) {
  return {
    balance: 0,
    lifetime: 0,
    spent: 0,
    observedTokens: 0,
    usagePeak: 0,
    usageInBalance: 0,
    gainedFromUsage: 0,
    gainedFromIdle: 0,
    gainedFromMint: 0,
    gainedFromPowerups: 0,
    powerupsClaimed: 0,
    insight: 0,
    runLifetime: 0,
    prestiges: 0,
    careerFromUsage: 0,
    careerFromIdle: 0,
    careerSpent: 0,
    owned: {},
    buffs: [],
    lastTick: now,
  };
}

function ownedCount(state, id) {
  const count = state.owned?.[id] ?? 0;
  return Number.isInteger(count) && count > 0 ? count : 0;
}

export function production(state) {
  const t = { rate: 0, bonus: 0, click: 1, chatBonus: 0, offlineHours: 0, buffDuration: 0, buffStrength: 0, spawnRate: 0 };
  for (const upgrade of UPGRADES) {
    const count = ownedCount(state, upgrade.id);
    if (!count) continue;
    const boost = (upgrade.kind ?? 'generator') === 'generator' ? milestoneMultiplier(count) : 1;
    for (const [type, value] of Object.entries(upgrade.effects ?? {})) {
      EFFECTS[type]?.apply(t, type === 'rate' ? value * boost : value, count);
    }
  }
  const insight = 1 + (state.insight ?? 0) * INSIGHT_BONUS;
  return { ...t, insight, ratePerSecond: t.rate * (1 + t.bonus) * insight, clickValue: t.click, multiplier: 1 + t.bonus };
}

function activeBuffs(state, at) {
  return (state.buffs ?? []).filter((buff) => buff.expiresAt > at);
}

function idleMultiplierAt(state, at) {
  return activeBuffs(state, at).reduce((m, buff) => m * (buff.idleMultiplier || 1), 1);
}

function chatMultiplierAt(state, at) {
  return activeBuffs(state, at).reduce((m, buff) => m * (buff.chatMultiplier || 1), 1);
}

function discountAt(state, at) {
  return activeBuffs(state, at).reduce((d, buff) => Math.max(d, buff.discount || 0), 0);
}

function idleBetween(state, from, to, baseRate) {
  if (to <= from || baseRate <= 0) return 0;
  const points = [from, to, ...(state.buffs ?? []).map((buff) => buff.expiresAt).filter((at) => at > from && at < to)]
    .sort((a, b) => a - b);
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    total += baseRate * idleMultiplierAt(state, points[i]) * ((points[i + 1] - points[i]) / 1000);
  }
  return total;
}

export function costOf(upgrade, owned, discount = 0) {
  return Math.floor(upgrade.baseCost * upgrade.growth ** owned * (1 - discount));
}

export function bulkCost(upgrade, owned, count, discount = 0) {
  if (count <= 0) return 0;
  const g = upgrade.growth;
  return Math.floor(upgrade.baseCost * g ** owned * ((g ** count - 1) / (g - 1)) * (1 - discount));
}

export function maxAffordable(upgrade, owned, balance, discount = 0) {
  const cap = upgrade.maxOwned !== undefined ? Math.max(0, upgrade.maxOwned - owned) : Infinity;
  const first = upgrade.baseCost * upgrade.growth ** owned * (1 - discount);
  if (first <= 0 || balance < first) return 0;
  let n = Math.floor(Math.log(1 + (balance * (upgrade.growth - 1)) / first) / Math.log(upgrade.growth));
  n = Math.min(n, cap);
  while (n > 0 && bulkCost(upgrade, owned, n, discount) > balance) n -= 1;
  return n;
}

export function insightAvailable(state) {
  return Math.floor(Math.sqrt((state.runLifetime ?? 0) / PRESTIGE_UNIT));
}

function effectLabel(upgrade) {
  return Object.entries(upgrade.effects ?? {})
    .map(([type, value]) => EFFECTS[type]?.label(value))
    .filter(Boolean)
    .join(', ');
}

export function view(state, now = Date.now()) {
  const produced = production(state);
  const discount = discountAt(state, now);
  return {
    balance: round(state.balance),
    lifetime: round(state.lifetime),
    spent: round(state.spent),
    baseRatePerSecond: round(produced.ratePerSecond),
    ratePerSecond: round(produced.ratePerSecond * idleMultiplierAt(state, now)),
    clickValue: produced.clickValue,
    multiplier: round(produced.multiplier),
    chatMultiplier: round(chatMultiplierAt(state, now) * (1 + produced.chatBonus)),
    discount,
    observedTokens: state.observedTokens,
    gainedFromUsage: round(state.gainedFromUsage),
    gainedFromIdle: round(state.gainedFromIdle),
    gainedFromMint: round(state.gainedFromMint),
    gainedFromPowerups: round(state.gainedFromPowerups),
    powerupsClaimed: state.powerupsClaimed,
    careerFromUsage: round(state.careerFromUsage ?? state.gainedFromUsage),
    careerFromIdle: round(state.careerFromIdle ?? state.gainedFromIdle),
    careerSpent: round(state.careerSpent ?? state.spent),
    insight: state.insight ?? 0,
    insightMultiplier: round(produced.insight),
    insightOnReset: insightAvailable(state),
    prestigeUnit: PRESTIGE_UNIT,
    runLifetime: round(state.runLifetime ?? 0),
    prestiges: state.prestiges ?? 0,
    milestones: MILESTONES,
    lastTick: state.lastTick,
    perks: {
      chatBonus: produced.chatBonus,
      offlineHours: produced.offlineHours,
      buffDuration: produced.buffDuration,
      buffStrength: produced.buffStrength,
      spawnRate: produced.spawnRate,
    },
    buffs: activeBuffs(state, now).map((buff) => ({
      ...buff,
      name: findPowerup(buff.id)?.name ?? buff.id,
      remainingMs: buff.expiresAt - now,
    })),
    powerups: POWERUPS.map(({ id, name, blurb, weight }) => ({ id, name, blurb, weight })),
    upgrades: UPGRADES.filter((upgrade) => !upgrade.retired).map((upgrade) => {
      const owned = ownedCount(state, upgrade.id);
      const cost = costOf(upgrade, owned, discount);
      const unlockAt = upgrade.unlockAt ?? 0;
      const locked = state.lifetime < unlockAt;
      const maxed = upgrade.maxOwned !== undefined && owned >= upgrade.maxOwned;
      const max = maxAffordable(upgrade, owned, state.balance, discount);
      return {
        id: upgrade.id,
        kind: upgrade.kind ?? 'generator',
        name: upgrade.name,
        blurb: upgrade.blurb,
        owned,
        maxOwned: upgrade.maxOwned ?? null,
        maxed,
        cost,
        cost10: bulkCost(upgrade, owned, Math.min(10, upgrade.maxOwned !== undefined ? upgrade.maxOwned - owned : 10), discount),
        cost100: bulkCost(upgrade, owned, Math.min(100, upgrade.maxOwned !== undefined ? upgrade.maxOwned - owned : 100), discount),
        maxCount: max,
        maxCost: bulkCost(upgrade, owned, max, discount),
        growth: upgrade.growth,
        baseCost: upgrade.baseCost,
        discount,
        milestoneMultiplier: (upgrade.kind ?? 'generator') === 'generator' ? milestoneMultiplier(owned) : 1,
        nextMilestone: (upgrade.kind ?? 'generator') === 'generator' ? nextMilestone(owned) : null,
        effects: { ...upgrade.effects },
        effect: effectLabel(upgrade),
        unlockAt,
        locked,
        affordable: !locked && !maxed && state.balance >= cost,
      };
    }),
  };
}

function grant(state, amount, fromUsage) {
  if (amount <= 0) return;
  state.balance = round(state.balance + amount);
  state.lifetime = round(state.lifetime + amount);
  state.runLifetime = round((state.runLifetime ?? 0) + amount);
  if (fromUsage) state.usageInBalance = round(state.usageInBalance + amount);
}

function clawback(state, drop) {
  const take = Math.min(drop, state.usageInBalance);
  state.balance = round(Math.max(0, state.balance - take));
  state.usageInBalance = round(state.usageInBalance - take);
}

export function applyTick(state, { now, observedTokens }) {
  if (!Number.isFinite(now)) throw new Error('now must be a finite number');
  state.buffs ??= [];
  const produced = production(state);
  const cap = MAX_OFFLINE_MS + produced.offlineHours * 60 * 60 * 1000;
  const elapsed = Math.min(cap, Math.max(0, now - (state.lastTick ?? now)));
  const idle = idleBetween(state, now - elapsed, now, produced.ratePerSecond);
  grant(state, idle, false);
  state.gainedFromIdle = round(state.gainedFromIdle + idle);
  state.careerFromIdle = round((state.careerFromIdle ?? 0) + idle);
  let usageAdded = 0;
  if (observedTokens !== undefined && observedTokens !== null) {
    if (!Number.isInteger(observedTokens) || observedTokens < 0) {
      throw new Error('observed_tokens must be a non-negative integer');
    }
    state.usagePeak = Math.max(state.usagePeak ?? 0, state.observedTokens);
    if (observedTokens > state.usagePeak) {
      const raw = observedTokens - state.usagePeak;
      const extra = raw * (chatMultiplierAt(state, now) * (1 + produced.chatBonus) - 1);
      grant(state, raw, true);
      grant(state, extra, false);
      usageAdded = round(raw + Math.max(0, extra));
      state.gainedFromUsage = round(state.gainedFromUsage + usageAdded);
      state.careerFromUsage = round((state.careerFromUsage ?? 0) + usageAdded);
      state.usagePeak = observedTokens;
    } else if (observedTokens < state.usagePeak * RESET_RATIO) {
      // Only a large drop is a cleared history; small dips are streaming rewrites.
      clawback(state, state.usagePeak - observedTokens);
      state.usagePeak = observedTokens;
    }
    state.observedTokens = observedTokens;
  }
  state.buffs = activeBuffs(state, now);
  state.lastTick = now;
  return { elapsedMs: elapsed, idleAdded: round(idle), usageAdded, state: view(state, now) };
}

export function buyUpgrade(state, id, now, quantity = 1) {
  const upgrade = findUpgrade(id);
  if (!upgrade || upgrade.retired) throw new Error(`unknown upgrade: ${id}`);
  applyTick(state, { now });
  if (state.lifetime < (upgrade.unlockAt ?? 0)) throw new Error(`${upgrade.name} unlocks at ${upgrade.unlockAt} lifetime tokens`);
  const owned = ownedCount(state, id);
  if (upgrade.maxOwned !== undefined && owned >= upgrade.maxOwned) throw new Error(`${upgrade.name} is already maxed`);
  const discount = discountAt(state, now);
  let count;
  if (quantity === 'max') {
    count = maxAffordable(upgrade, owned, state.balance, discount);
    if (count === 0) throw new Error(`not enough tokens: need ${costOf(upgrade, owned, discount)}`);
  } else {
    if (!Number.isInteger(quantity) || quantity < 1) throw new Error('quantity must be a positive integer or "max"');
    count = upgrade.maxOwned !== undefined ? Math.min(quantity, upgrade.maxOwned - owned) : quantity;
  }
  const cost = bulkCost(upgrade, owned, count, discount);
  if (state.balance < cost) throw new Error(`not enough tokens: need ${cost}`);
  state.balance = round(state.balance - cost);
  state.spent = round(state.spent + cost);
  state.careerSpent = round((state.careerSpent ?? 0) + cost);
  state.usageInBalance = round(Math.max(0, state.usageInBalance - cost));
  state.owned[id] = owned + count;
  return { bought: id, count, cost, state: view(state, now) };
}

// Resets the run (balance, generators, perks, buffs) for permanent insight. Chat tracking is kept so usage is never re-credited.
export function prestige(state, now) {
  applyTick(state, { now });
  const gain = insightAvailable(state);
  if (gain < 1) throw new Error(`need ${PRESTIGE_UNIT.toLocaleString('en-US')} tokens this run to retrain`);
  state.insight = (state.insight ?? 0) + gain;
  state.prestiges = (state.prestiges ?? 0) + 1;
  state.balance = 0;
  state.usageInBalance = 0;
  state.runLifetime = 0;
  state.gainedFromUsage = 0;
  state.gainedFromIdle = 0;
  state.spent = 0;
  state.owned = {};
  state.buffs = [];
  return { gained: gain, state: view(state, now) };
}

export function claimPowerup(state, id, now) {
  const powerup = findPowerup(id);
  if (!powerup) throw new Error(`unknown power-up: ${id}`);
  applyTick(state, { now });
  const produced = production(state);
  const strength = 1 + produced.buffStrength;
  state.powerupsClaimed = (state.powerupsClaimed ?? 0) + 1;
  if (powerup.combo) {
    let amount = 0;
    for (const other of POWERUPS) {
      if (other.combo || other.rain) continue;
      amount += claimPowerup(state, other.id, now).claimed.amount ?? 0;
      state.powerupsClaimed -= 1;
    }
    const buff = { id, chaos: true, expiresAt: now + Math.round(powerup.durationMs * (1 + produced.buffDuration)) };
    state.buffs = activeBuffs(state, now).filter((existing) => existing.id !== id).concat(buff);
    return { claimed: { id, name: powerup.name, amount, expiresAt: buff.expiresAt, message: powerup.blurb }, state: view(state, now) };
  }
  if (powerup.rain) {
    const durationMs = Math.round(powerup.durationMs * (1 + produced.buffDuration));
    return {
      claimed: { id, name: powerup.name, rain: true, durationMs, message: powerup.blurb },
      state: view(state, now),
    };
  }
  if (powerup.instant) {
    const amount = round(Math.max(powerup.instant.minimum, produced.ratePerSecond * powerup.instant.idleSeconds) * strength);
    grant(state, amount, false);
    state.gainedFromPowerups = round((state.gainedFromPowerups ?? 0) + amount);
    return { claimed: { id, name: powerup.name, amount, message: `Minted ${Math.round(amount).toLocaleString('en-US')} tokens` }, state: view(state, now) };
  }
  const buff = { id, expiresAt: now + Math.round(powerup.durationMs * (1 + produced.buffDuration)) };
  if (powerup.buff.idleMultiplier) buff.idleMultiplier = round(1 + (powerup.buff.idleMultiplier - 1) * strength);
  if (powerup.buff.chatMultiplier) buff.chatMultiplier = round(1 + (powerup.buff.chatMultiplier - 1) * strength);
  if (powerup.buff.discount) buff.discount = Math.min(0.9, round(powerup.buff.discount * strength));
  state.buffs = activeBuffs(state, now).filter((existing) => existing.id !== id).concat(buff);
  return { claimed: { id, name: powerup.name, expiresAt: buff.expiresAt, message: powerup.blurb }, state: view(state, now) };
}

export function mintTokens(state, now) {
  applyTick(state, { now });
  const amount = production(state).clickValue;
  grant(state, amount, false);
  state.gainedFromMint = round(state.gainedFromMint + amount);
  return { minted: amount, state: view(state, now) };
}
