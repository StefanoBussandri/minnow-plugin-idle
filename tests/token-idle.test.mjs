import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';
import { applyTick, buyUpgrade, claimPowerup as claimState, EFFECTS, freshState, MAX_OFFLINE_MS, mintTokens, POWERUPS, UPGRADES } from '../plugins/token-idle/economy.mjs';
import claimPowerup from '../plugins/token-idle/claim-powerup.mjs';
import getState from '../plugins/token-idle/get-state.mjs';
import tick from '../plugins/token-idle/tick.mjs';
import buy from '../plugins/token-idle/buy.mjs';
import mint from '../plugins/token-idle/mint.mjs';

const dataDir = await mkdtemp(path.join(tmpdir(), 'token-idle-'));
const noSessions = path.join(dataDir, 'no-sessions.db');
const ctxA = { dataDir, workspaceRoot: path.join(dataDir, 'Project-A'), sessionsDb: noSessions };
const ctxB = { dataDir, workspaceRoot: path.join(dataDir, 'project-b'), sessionsDb: noSessions };

after(() => rm(dataDir, { recursive: true, force: true }));

test('starts at zero without creating income', async () => {
  const state = await getState({}, ctxA);
  assert.equal(state.balance, 0);
  assert.equal(state.ratePerSecond, 0);
  assert.equal(state.upgrades.length, UPGRADES.filter((upgrade) => !upgrade.retired).length);
  assert.ok(state.upgrades.every((upgrade) => upgrade.effect.length > 0));
});

test('catalog entries are well formed', () => {
  assert.equal(new Set(UPGRADES.map((upgrade) => upgrade.id)).size, UPGRADES.length);
  for (const upgrade of UPGRADES) {
    assert.ok(upgrade.baseCost > 0 && upgrade.growth > 1, upgrade.id);
    for (const type of Object.keys(upgrade.effects)) assert.ok(EFFECTS[type], `${upgrade.id}: ${type}`);
  }
});

test('credits a ledger increase once and keeps projects apart', async () => {
  const first = await tick({ observed_tokens: 2000 }, ctxA);
  assert.equal(first.usageAdded, 2000);
  assert.equal(first.balance, 2000);
  const again = await tick({ observed_tokens: 2000 }, ctxA);
  assert.equal(again.usageAdded, 0);
  assert.equal(again.balance, 2000);
  assert.equal((await tick({ observed_tokens: 40 }, ctxB)).balance, 40);
  assert.equal((await getState({}, ctxA)).balance, 2000);
});

test('buys, mints, and drops only unspent usage when the ledger shrinks', async () => {
  await tick({ observed_tokens: 2000 }, ctxB);
  const bought = await buy({ upgrade_id: 'inkwell' }, ctxB);
  assert.equal(bought.cost, 1500);
  assert.ok(bought.balance >= 500 && bought.balance < 510);
  assert.equal(bought.upgrades.find((item) => item.id === 'inkwell').owned, 1);

  const dropped = await tick({ observed_tokens: 0 }, ctxB);
  assert.ok(dropped.balance < 10, 'only idle income survives the clawback');
  assert.equal(dropped.upgrades.find((item) => item.id === 'inkwell').owned, 1);

  const minted = await mint({}, ctxB);
  assert.equal(minted.minted, 1);
  const persisted = JSON.parse(await readFile(path.join(dataDir, 'foundry.json'), 'utf8'));
  assert.equal(persisted.projects[Object.keys(persisted.projects).find((key) => key.endsWith('project-b'))].owned.inkwell, 1);
});

test('rejects invalid ticks and unaffordable, locked, retired, or unknown buys', async () => {
  await assert.rejects(tick({ observed_tokens: -1 }, ctxA), /non-negative integer/);
  await assert.rejects(tick({ observed_tokens: 1.5 }, ctxA), /non-negative integer/);
  await assert.rejects(buy({ upgrade_id: 'press' }, ctxA), /not enough tokens/);
  await assert.rejects(buy({ upgrade_id: 'forge' }, ctxA), /unlocks at/);
  await assert.rejects(buy({ upgrade_id: 'stamp' }, ctxA), /unknown upgrade/);
  await assert.rejects(buy({ upgrade_id: 'nope' }, ctxA), /unknown upgrade/);
  await assert.rejects(buy({}, ctxA), /upgrade_id/);
  assert.equal((await getState({}, ctxA)).balance, 2000);
});

test('aborted calls and corrupt saves do not invent a wallet', async () => {
  await assert.rejects(tick({ observed_tokens: 5 }, { ...ctxA, signal: AbortSignal.abort() }), /aborted/);
  const file = path.join(dataDir, 'foundry.json');
  const intact = await readFile(file, 'utf8');
  await writeFile(file, '{');
  await assert.rejects(getState({}, ctxA), SyntaxError);
  await writeFile(file, intact);
  assert.equal((await getState({}, ctxA)).balance, 2000);
});

test('idle income respects the offline cap and the spec cache', () => {
  const state = freshState(1_000);
  state.owned.press = 1;
  state.owned.cache = 1;
  const hour = applyTick(state, { now: 1_000 + 10_000 });
  assert.equal(hour.idleAdded, 165);
  const capped = applyTick(state, { now: state.lastTick + MAX_OFFLINE_MS + 60_000 });
  assert.equal(capped.elapsedMs, MAX_OFFLINE_MS);
  assert.equal(capped.idleAdded, 475200);
});

test('spending usage first keeps later idle income on clawback', () => {
  const state = freshState(0);
  applyTick(state, { now: 0, observedTokens: 2000 });
  state.owned.press = 1;
  applyTick(state, { now: 10_000 });
  buyUpgrade(state, 'inkwell', 10_000);
  applyTick(state, { now: 10_000, observedTokens: 0 });
  assert.equal(state.balance, 150);
  assert.equal(mintTokens(state, 10_000).minted, 1);
});

test('tick mints chat tokens from any provider, using the ledger or a text estimate', async () => {
  const { DatabaseSync } = await import('node:sqlite');
  const dir = await mkdtemp(path.join(tmpdir(), 'token-idle-chat-'));
  const sessionsDb = path.join(dir, 'sessions.db');
  const workspace = path.join(dir, 'Work');
  const db = new DatabaseSync(sessionsDb);
  db.exec("CREATE TABLE chats (id TEXT PRIMARY KEY, workspace_path TEXT NOT NULL DEFAULT '', meta_json TEXT NOT NULL DEFAULT '{}')");
  db.exec('CREATE TABLE messages (chat_id TEXT, seq INTEGER, text_len INTEGER)');
  const ledger = (n) => JSON.stringify({ tokenLedger: { totals: { totalTokens: n } } });
  const addChat = db.prepare('INSERT OR REPLACE INTO chats VALUES (?, ?, ?)');
  const addMsg = db.prepare('INSERT INTO messages VALUES (?, ?, ?)');
  const ctx = { dataDir: dir, workspaceRoot: workspace, sessionsDb };
  try {
    addChat.run('reported', workspace.replaceAll('\\', '/'), ledger(500));
    addMsg.run('reported', 1, 99999);
    addChat.run('cursor', workspace, ledger(0));
    addMsg.run('cursor', 1, 400);
    addMsg.run('cursor', 2, 3);
    addChat.run('elsewhere', path.join(dir, 'Other'), ledger(9000));

    let state = await tick({ observed_tokens: 0 }, ctx);
    assert.equal(state.usageError, null);
    assert.equal(state.usageSource, 'estimated');
    assert.equal(state.gainedFromUsage, 601);
    assert.equal(state.balance, 601);

    state = await tick({}, ctx);
    assert.equal(state.usageAdded, 0, 'unchanged chats are not counted twice');

    addMsg.run('cursor', 3, 40);
    state = await tick({}, ctx);
    assert.equal(state.usageAdded, 10);
    assert.equal(state.gainedFromUsage, 611);
  } finally {
    db.close();
    await rm(dir, { recursive: true, force: true });
  }
});

test('overclock boosts idle income only until it expires', () => {
  const state = freshState(0);
  state.owned.press = 1;
  claimState(state, 'overclock', 0);
  const result = applyTick(state, { now: 60_000 });
  assert.equal(result.idleAdded, 3600);
  assert.equal(result.state.buffs.length, 0);
});

test('chat frenzy bonus survives clawback and sales discount upgrades', () => {
  const state = freshState(0);
  claimState(state, 'frenzy', 0);
  assert.equal(applyTick(state, { now: 1000, observedTokens: 100 }).usageAdded, 300);
  assert.equal(applyTick(state, { now: 1000, observedTokens: 0 }).state.balance, 200);
  claimState(state, 'sale', 1000);
  const inkwell = applyTick(state, { now: 2000 }).state.upgrades.find((u) => u.id === 'inkwell');
  assert.equal(inkwell.cost, 1125);
  assert.equal(applyTick(state, { now: 70_000 }).state.discount, 0);
});

test('instant power-ups pay out and perks cap at one copy', () => {
  const state = freshState(0);
  assert.equal(claimState(state, 'surge', 0).state.balance, 5000);
  assert.throws(() => claimState(state, 'nope', 0), /unknown power-up/);
  assert.ok(POWERUPS.every((p) => p.weight > 0 && (p.instant || p.durationMs > 0)));
  state.balance = 1e9;
  state.lifetime = 1e9;
  buyUpgrade(state, 'nightshift', 0);
  assert.throws(() => buyUpgrade(state, 'nightshift', 0), /already maxed/);
  state.owned.press = 1;
  assert.equal(applyTick(state, { now: 20 * 3600_000 }).elapsedMs, 16 * 3600_000);
});

test('claim_powerup tool validates and saves', async () => {
  await assert.rejects(claimPowerup({ powerup_id: 'nope' }, ctxB), /unknown power-up/);
  await assert.rejects(claimPowerup({}, ctxB), /non-empty string/);
  const result = await claimPowerup({ powerup_id: 'overclock' }, ctxB);
  assert.equal(result.claimed.id, 'overclock');
  assert.equal((await getState({}, ctxB)).buffs[0].id, 'overclock');
});

test('streaming dips during a frenzy neither claw back nor double-credit', () => {
  const state = freshState(0);
  claimState(state, 'frenzy', 0);
  const seen = [1000, 1200, 1150, 1300, 1250, 1300, 1400];
  let added = 0;
  for (const [i, observedTokens] of seen.entries()) added += applyTick(state, { now: i, observedTokens }).usageAdded;
  assert.equal(added, 1400 * 3);
  assert.equal(state.balance, 1400 * 3);
  assert.equal(applyTick(state, { now: 10, observedTokens: 100 }).state.balance, 1400 * 2 + 100);
});

test('saves without a usage peak resume from the last observed total', () => {
  const state = freshState(0);
  state.observedTokens = 5000;
  delete state.usagePeak;
  assert.equal(applyTick(state, { now: 0, observedTokens: 4900 }).usageAdded, 0);
  assert.equal(applyTick(state, { now: 0, observedTokens: 5100 }).usageAdded, 100);
});

test('offline catch-up pays the gap through the tick tool', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'token-idle-offline-'));
  const ctx = { dataDir: dir, workspaceRoot: path.join(dir, 'Away'), sessionsDb: noSessions };
  try {
    await tick({}, ctx);
    const file = path.join(dir, 'foundry.json');
    const saved = JSON.parse(await readFile(file, 'utf8'));
    const key = Object.keys(saved.projects)[0];
    saved.projects[key].owned = { press: 1 };
    saved.projects[key].lastTick = Date.now() - 2 * 3600_000;
    await writeFile(file, JSON.stringify(saved));
    const back = await tick({}, ctx);
    assert.ok(Math.abs(back.idleAdded - 2 * 3600 * 15) < 100, `idleAdded ${back.idleAdded}`);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('chaos grants every power-up at once and is ultra rare', () => {
  const state = freshState(0);
  const result = claimState(state, 'chaos', 0);
  assert.equal(result.claimed.amount, 55_000);
  assert.deepEqual(result.state.buffs.map((b) => b.id).sort(), ['chaos', 'frenzy', 'overclock', 'sale']);
  assert.equal(state.powerupsClaimed, 1);
  const total = POWERUPS.reduce((sum, p) => sum + p.weight, 0);
  assert.equal(POWERUPS.find((p) => p.id === 'chaos').weight, 0.0001);
  assert.ok(POWERUPS.find((p) => p.id === 'chaos').weight / total < 2e-6);
});

test('token rain is a 1% roll and pays nothing until each surge is caught', () => {
  const state = freshState(0);
  const result = claimState(state, 'rain', 0);
  assert.equal(result.claimed.rain, true);
  assert.equal(result.claimed.durationMs, 10_000);
  assert.equal(state.balance, 0);
  assert.equal(claimState(state, 'surge', 0).claimed.amount, 5_000);
  const total = POWERUPS.reduce((sum, p) => sum + p.weight, 0);
  assert.ok(Math.abs(POWERUPS.find((p) => p.id === 'rain').weight / total - 0.01) < 1e-6);
});

test('bulk buy charges the geometric sum and max buys all it can afford', async () => {
  const { bulkCost, costOf, maxAffordable, findUpgradeForTest } = await import('../plugins/token-idle/economy.mjs').then((m) => ({ ...m, findUpgradeForTest: (id) => UPGRADES.find((u) => u.id === id) }));
  const ink = findUpgradeForTest('inkwell');
  let sum = 0;
  for (let i = 0; i < 10; i += 1) sum += ink.baseCost * ink.growth ** i;
  assert.ok(Math.abs(bulkCost(ink, 0, 10) - Math.floor(sum)) <= 1);
  const state = freshState(0);
  state.balance = bulkCost(ink, 0, 10) + costOf(ink, 10) - 1;
  state.lifetime = state.balance;
  assert.equal(maxAffordable(ink, 0, state.balance), 10);
  const tenResult = buyUpgrade(state, 'inkwell', 0, 10);
  assert.equal(tenResult.count, 10);
  assert.equal(state.owned.inkwell, 10);
  assert.throws(() => buyUpgrade(state, 'inkwell', 0, 'max'), /not enough/);
  state.balance += 1e9;
  const maxResult = buyUpgrade(state, 'inkwell', 0, 'max');
  assert.ok(maxResult.count > 1);
  assert.ok(state.balance < costOf(ink, state.owned.inkwell));
});

test('milestones double generator output', async () => {
  const { production } = await import('../plugins/token-idle/economy.mjs');
  const state = freshState(0);
  state.owned.inkwell = 9;
  const before = production(state).ratePerSecond / 9;
  state.owned.inkwell = 10;
  assert.ok(Math.abs(production(state).ratePerSecond / 10 - before * 2) < 1e-9);
});

test('retraining resets the run and grants insight', async () => {
  const { prestige, production } = await import('../plugins/token-idle/economy.mjs');
  const state = freshState(0);
  assert.throws(() => prestige(state, 0), /retrain/);
  state.runLifetime = 400_000_000;
  state.balance = 500;
  state.owned.inkwell = 5;
  state.observedTokens = 1234;
  state.gainedFromUsage = 80;
  state.gainedFromIdle = 20;
  state.spent = 40;
  state.careerFromUsage = 80;
  state.careerFromIdle = 20;
  state.careerSpent = 40;
  const result = prestige(state, 0);
  assert.equal(result.gained, 2);
  assert.equal(state.balance, 0);
  assert.equal(state.gainedFromUsage, 0);
  assert.equal(state.gainedFromIdle, 0);
  assert.equal(state.spent, 0);
  assert.equal(state.careerFromUsage, 80);
  assert.equal(state.careerFromIdle, 20);
  assert.equal(state.careerSpent, 40);
  assert.deepEqual(state.owned, {});
  assert.equal(state.observedTokens, 1234);
  state.owned.inkwell = 1;
  const boosted = production(state).ratePerSecond;
  state.insight = 0;
  assert.ok(Math.abs(boosted / production(state).ratePerSecond - 1.1) < 1e-9);
});

test('old foundry saves rebuild run and career ledgers from lifetime', async () => {
  const { repairLedgers } = await import('../plugins/token-idle/store.mjs');
  const stale = freshState(0);
  stale.lifetime = 10_000;
  stale.balance = 8_000;
  stale.gainedFromUsage = 2_500;
  stale.spent = 2_000;
  repairLedgers(stale);
  assert.equal(stale.gainedFromIdle, 7_500);
  assert.equal(stale.runLifetime, 10_000);
  assert.equal(stale.careerFromUsage, 2_500);
  assert.equal(stale.careerFromIdle, 7_500);
  assert.equal(stale.careerSpent, 2_000);
  repairLedgers(stale);
  assert.equal(stale.gainedFromIdle, 7_500);

  const retrained = freshState(0);
  retrained.prestiges = 1;
  retrained.lifetime = 10_000;
  retrained.balance = 40;
  retrained.gainedFromUsage = 100;
  retrained.gainedFromIdle = 50;
  retrained.runLifetime = 150;
  retrained.spent = 10;
  repairLedgers(retrained);
  assert.equal(retrained.gainedFromUsage, 100);
  assert.equal(retrained.gainedFromIdle, 50);
  assert.equal(retrained.runLifetime, 150);
  assert.equal(retrained.careerFromUsage, 100);
  assert.equal(retrained.careerFromIdle, 9_900);
  assert.equal(retrained.careerSpent, 10);

  const healthy = freshState(0);
  healthy.prestiges = 2;
  healthy.lifetime = 500;
  healthy.balance = 4;
  healthy.gainedFromUsage = 10;
  healthy.gainedFromIdle = 5;
  healthy.runLifetime = 15;
  healthy.careerFromUsage = 200;
  healthy.careerFromIdle = 300;
  healthy.spent = 1;
  healthy.careerSpent = 40;
  repairLedgers(healthy);
  assert.equal(healthy.gainedFromIdle, 5);
  assert.equal(healthy.runLifetime, 15);
  assert.equal(healthy.careerFromUsage, 200);
  assert.equal(healthy.careerFromIdle, 300);
  assert.equal(healthy.careerSpent, 40);

  const inflated = freshState(0);
  inflated.prestiges = 2;
  inflated.balance = 7_000;
  inflated.gainedFromUsage = 7_000;
  inflated.gainedFromPowerups = 1_600_000_000_000;
  inflated.runLifetime = 1_600_000_000_000;
  inflated.lifetime = 1_600_000_000_000;
  repairLedgers(inflated);
  assert.equal(inflated.runLifetime, 14_000);
  assert.equal(inflated.balance, 7_000);
  repairLedgers(inflated);
  assert.equal(inflated.runLifetime, 14_000);
});
