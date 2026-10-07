import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { freshState } from './economy.mjs';

const FILE = 'foundry.json';

export function projectKey(ctx) {
  const resolved = path.resolve(ctx.workspaceRoot || '');
  return process.platform === 'win32' ? resolved.toLowerCase() : resolved;
}

function normalize(raw, now) {
  const state = freshState(now);
  if (!raw || typeof raw !== 'object') return state;
  for (const key of ['balance', 'lifetime', 'spent', 'observedTokens', 'usagePeak', 'usageInBalance', 'gainedFromUsage', 'gainedFromIdle', 'gainedFromMint', 'gainedFromPowerups', 'powerupsClaimed', 'lastTick', 'insight', 'runLifetime', 'prestiges', 'careerFromUsage', 'careerFromIdle', 'careerSpent']) {
    if (typeof raw[key] === 'number' && Number.isFinite(raw[key]) && raw[key] >= 0) state[key] = raw[key];
  }
  if (typeof raw.runLifetime !== 'number') state.runLifetime = state.lifetime;
  if (typeof raw.careerFromUsage !== 'number') state.careerFromUsage = state.gainedFromUsage;
  if (typeof raw.careerFromIdle !== 'number') state.careerFromIdle = state.gainedFromIdle;
  if (typeof raw.careerSpent !== 'number') state.careerSpent = state.spent;
  repairLedgers(state);
  if (raw.owned && typeof raw.owned === 'object') {
    for (const [id, count] of Object.entries(raw.owned)) {
      if (Number.isInteger(count) && count > 0) state.owned[id] = count;
    }
  }
  if (Array.isArray(raw.buffs)) {
    for (const buff of raw.buffs) {
      if (!buff || typeof buff.id !== 'string' || !Number.isFinite(buff.expiresAt)) continue;
      const clean = { id: buff.id, expiresAt: buff.expiresAt };
      for (const key of ['idleMultiplier', 'chatMultiplier', 'discount']) {
        if (typeof buff[key] === 'number' && Number.isFinite(buff[key]) && buff[key] > 0) clean[key] = buff[key];
      }
      if (buff.chaos === true) clean.chaos = true;
      state.buffs.push(clean);
    }
  }
  return state;
}

function round(value) {
  return Math.round(value * 1000) / 1000;
}

// Saves written when these counters first appeared stored them as 0, so This run
// and Details disagreed with lifetime. Fold the unexplained remainder back in.
export function repairLedgers(state) {
  const neverReset = (state.prestiges ?? 0) === 0;
  if (neverReset) {
    const sources = (state.gainedFromUsage ?? 0) + (state.gainedFromIdle ?? 0) + (state.gainedFromMint ?? 0) + (state.gainedFromPowerups ?? 0);
    const gap = (state.lifetime ?? 0) - sources;
    if (gap > 0.0005) state.gainedFromIdle = round((state.gainedFromIdle ?? 0) + gap);
  }
  const runSources = (state.gainedFromUsage ?? 0) + (state.gainedFromIdle ?? 0) + (state.gainedFromMint ?? 0) + (state.gainedFromPowerups ?? 0);
  if ((state.runLifetime ?? 0) < runSources) state.runLifetime = round(runSources);
  if (neverReset && state.runLifetime < (state.lifetime ?? 0)) state.runLifetime = state.lifetime;
  state.careerFromUsage = round(Math.max(state.careerFromUsage ?? 0, state.gainedFromUsage ?? 0));
  state.careerFromIdle = round(Math.max(state.careerFromIdle ?? 0, state.gainedFromIdle ?? 0));
  state.careerSpent = round(Math.max(state.careerSpent ?? 0, state.spent ?? 0));
  if (!neverReset) {
    const explained = state.careerFromUsage + state.careerFromIdle + (state.gainedFromMint ?? 0) + (state.gainedFromPowerups ?? 0);
    const gap = (state.lifetime ?? 0) - explained;
    if (gap > 0.0005) state.careerFromIdle = round(state.careerFromIdle + gap);
  }
  // Grants raise balance and this-run earnings together. Spending moves balance into spent.
  // Only a chat clawback leaves earnings above balance + spent, and that clawback cannot
  // exceed chat tokens gained this run. Mint and power-up totals are not reset on retrain,
  // so they must not be copied back into runLifetime.
  const maxRun = round((state.balance ?? 0) + (state.spent ?? 0) + (state.gainedFromUsage ?? 0));
  if ((state.runLifetime ?? 0) > maxRun + 0.001) state.runLifetime = maxRun;
  return state;
}

export async function load(ctx, now = Date.now()) {
  const key = projectKey(ctx);
  let projects = {};
  try {
    const parsed = JSON.parse(await readFile(path.join(ctx.dataDir, FILE), 'utf8'));
    projects = parsed.projects ?? {};
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  return { projects, key, state: normalize(projects[key], now) };
}

export async function save(ctx, bag) {
  if (ctx.signal?.aborted) throw new Error('aborted');
  await mkdir(ctx.dataDir, { recursive: true });
  bag.projects[bag.key] = bag.state;
  const target = path.join(ctx.dataDir, FILE);
  const temp = `${target}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temp, JSON.stringify({ projects: bag.projects }, null, 2));
  await rename(temp, target);
}
