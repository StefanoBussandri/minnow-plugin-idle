import assert from 'node:assert/strict';
import { test } from 'node:test';
import { eatCorpses, easeStretch, EMOTES, SAYINGS, SPRITE_CHIME, stepCorpse, stepRave, stepWalker, WALKER_CRUISE, walkerBounds, walkerStretch } from '../plugins/token-idle/ui.mjs';

const lane = { minX: 80, maxX: 400, minY: 50, maxY: 500 };

test('closed and open lanes stop at the foundry edge', () => {
  const closed = walkerBounds({ width: 1200, height: 800, left: 220, right: 1156, top: 46 });
  const open = walkerBounds({ width: 1200, height: 800, left: 220, right: 816, top: 46 });
  assert.equal(closed.minX, 226);
  assert.equal(closed.maxX, 1156 - 32 - 6);
  assert.ok(open.maxX < closed.maxX);
  assert.equal(open.maxY, 800 - 40 - 6);
  const pinched = walkerBounds({ width: 200, height: 100, left: 180, right: 40, top: 90 });
  assert.equal(pinched.maxX, pinched.minX);
  assert.equal(pinched.maxY, pinched.minY);
});

test('a held smith stays inside the lane and keeps the fling', () => {
  const next = stepWalker({ x: -40, y: 900, vx: 1400, vy: -800 }, lane, 0.016, true);
  assert.equal(next.x, lane.minX);
  assert.equal(next.y, lane.maxY);
  assert.equal(next.vx, 1400);
  assert.equal(next.vy, -800);
});

test('a walk stays on the floor and a hard landing still bounces', () => {
  const walk = stepWalker({ x: 200, y: lane.maxY, vx: 36, vy: 20, gait: 'walk', decideAt: 999 }, lane, 0.016, false);
  assert.equal(walk.y, lane.maxY);
  assert.equal(walk.vy, 0);
  const bounce = stepWalker({ x: 200, y: lane.maxY, vx: 36, vy: 400, decideAt: 999 }, lane, 0.016, false);
  assert.equal(bounce.y, lane.maxY);
  assert.ok(bounce.vy < 0);
  const left = stepWalker({ x: lane.minX - 10, y: 200, vx: -400, vy: 0 }, lane, 0.016, false);
  assert.equal(left.x, lane.minX);
  assert.ok(left.vx > 0);
  const right = stepWalker({ x: lane.maxX + 30, y: 200, vx: 500, vy: 0 }, lane, 0.016, false);
  assert.equal(right.x, lane.maxX);
  assert.ok(right.vx < 0);
});

test('a fling cannot leave the lane or run away on a bad timestep', () => {
  let body = { x: 200, y: 480, vx: 5000, vy: -5000 };
  for (let i = 0; i < 180; i += 1) body = stepWalker(body, lane, 1, false);
  assert.ok(body.x >= lane.minX && body.x <= lane.maxX);
  assert.ok(body.y >= lane.minY && body.y <= lane.maxY);
  assert.ok(Math.abs(body.vx) <= 1600);
  assert.ok(Math.abs(body.vy) <= 1600);
  const stalled = stepWalker({ x: 200, y: 300, vx: 0, vy: 0 }, lane, Number.NaN, false);
  assert.equal(stalled.x, 200);
  assert.equal(stalled.y, 300);
  assert.equal(stalled.vx, 0);
  assert.equal(stalled.vy, 0);
});

test('a throw coasts along the floor before it settles into a walk', () => {
  const rink = { minX: -20000, maxX: 20000, minY: 0, maxY: 500 };
  let body = { x: 200, y: rink.maxY, vx: 1200, vy: 0, decideAt: 999, targetVx: 0, gait: 'walk' };
  for (let i = 0; i < 40; i += 1) body = stepWalker(body, rink, 0.05, false);
  assert.ok(Math.abs(body.vx) > 600, `died on release: ${body.vx}`);
  for (let i = 0; i < 220; i += 1) body = stepWalker(body, rink, 0.05, false);
  assert.ok(Math.abs(body.vx) < 140, `never settled: ${body.vx}`);
  assert.ok(Math.abs(body.vx) >= WALKER_CRUISE - 0.01, `below the usual pace: ${body.vx}`);
});

test('a normal walk stays at the default speed', () => {
  let body = { x: 200, y: lane.maxY, vx: WALKER_CRUISE, vy: 0, decideAt: 999, targetVx: WALKER_CRUISE, heading: 1 };
  for (let i = 0; i < 80; i += 1) body = stepWalker(body, lane, 0.05, false);
  assert.ok(Math.abs(body.vx) >= WALKER_CRUISE - 0.01, body.vx);
  const lifted = stepWalker({ x: 200, y: lane.maxY, vx: 4, vy: 0, decideAt: 999, targetVx: 0, heading: 1 }, lane, 0.05, false);
  assert.ok(Math.abs(lifted.vx) >= WALKER_CRUISE - 0.01, lifted.vx);
});

test('sleep pins him to the floor and later steps do not move him', () => {
  let body = { x: 220, y: 200, vx: 80, vy: 40 };
  for (let i = 0; i < 80; i += 1) body = stepWalker(body, lane, 0.05, false, { asleep: true });
  assert.equal(body.y, lane.maxY);
  assert.equal(body.vx, 0);
  assert.equal(body.vy, 0);
  const parked = stepWalker(body, lane, 0.05, false, { asleep: true });
  assert.equal(parked.x, body.x);
  assert.equal(parked.y, body.y);
});

test('speed stretches him along the way he is moving', () => {
  const wide = walkerStretch(500, 0);
  const tall = walkerStretch(0, 500);
  const still = walkerStretch(0, 0);
  assert.ok(wide.scaleX > wide.scaleY && wide.scaleX > 1);
  assert.ok(tall.scaleY > tall.scaleX && tall.scaleY > 1);
  assert.ok(Math.abs(still.scaleX - 1) < 0.02 && Math.abs(still.scaleY - 1) < 0.02);
});

test('floor choices can dawdle, hop, or turn around', () => {
  const scripted = (values) => {
    let i = 0;
    return () => values[Math.min(i++, values.length - 1)];
  };
  const start = { x: 200, y: lane.maxY, vx: 20, vy: 0, decideAt: 0, age: 0 };
  const turned = stepWalker(start, lane, 0.05, false, { rng: scripted([0.1, 0.1, 0.2, 0.1, 0.1, 0.1]) });
  const paused = stepWalker(start, lane, 0.05, false, { rng: scripted([0.9, 0.9, 0.9, 0.9, 0.9, 0.9]) });
  assert.ok(turned.targetVx < 0);
  assert.equal(turned.y, lane.maxY);
  assert.equal(turned.vy, 0);
  assert.ok(paused.y < lane.maxY);
  assert.ok(paused.vy < 0);
});

test('he has ten sayings and three emotes', () => {
  assert.equal(SAYINGS.length, 10);
  assert.equal(new Set(SAYINGS).size, 10);
  assert.deepEqual(EMOTES, ['grin', 'wow', 'focus']);
  assert.ok(SAYINGS.includes('Nice!'));
});

test('ordinary walking does not add little hops', () => {
  let body = { x: 200, y: lane.maxY, vx: WALKER_CRUISE, vy: 0, decideAt: 0, age: 0, gait: 'walk' };
  for (let i = 0; i < 80; i += 1) body = stepWalker(body, lane, 0.05, false, { rng: () => 0.5 });
  assert.equal(body.y, lane.maxY);
  assert.equal(body.vy, 0);
  assert.ok(Math.abs(body.vx) >= WALKER_CRUISE - 0.01);
});

test('rave bounces off every side', () => {
  const hit = stepRave({ x: lane.minX, y: lane.minY, vx: -500, vy: -500 }, lane, 0.05, () => 0.5);
  assert.equal(hit.x, lane.minX);
  assert.equal(hit.y, lane.minY);
  assert.ok(hit.vx > 0 && hit.vy > 0);
  let body = { x: 200, y: 200, vx: 500, vy: 400 };
  for (let i = 0; i < 80; i += 1) body = stepRave(body, lane, 0.05, () => 0.5);
  assert.ok(body.x >= lane.minX && body.x <= lane.maxX);
  assert.ok(body.y >= lane.minY && body.y <= lane.maxY);
});

test('rave copies fall and are eaten only on the ground', () => {
  let corpse = { x: 200, y: 200, vx: 30, vy: 0, phase: 'falling' };
  for (let i = 0; i < 40; i += 1) corpse = stepCorpse(corpse, lane, 0.05);
  assert.equal(corpse.phase, 'down');
  assert.equal(corpse.y, lane.maxY);
  const stuck = stepCorpse(corpse, lane, 0.05);
  assert.equal(stuck.x, corpse.x);
  assert.equal(stuck.vx, 0);
  const hero = { x: 100, y: lane.maxY };
  const { eaten, kept } = eatCorpses(hero, [
    { x: 110, y: lane.maxY, phase: 'down' },
    { x: 300, y: lane.maxY, phase: 'down' },
    { x: 100, y: lane.maxY, phase: 'falling' },
  ]);
  assert.equal(eaten.length, 1);
  assert.equal(kept.length, 2);
  const nested = eatCorpses(hero, [
    { phase: 'down', body: { x: 108, y: lane.maxY } },
    { phase: 'down', body: { x: 108, y: lane.maxY + 80 } },
    { phase: 'down', body: { x: 320, y: lane.maxY } },
  ]);
  assert.equal(nested.eaten.length, 1);
  assert.equal(nested.kept.length, 2);
  assert.equal(nested.eaten[0].body.y, lane.maxY);
});

test('air drag barely slows a throw that is still in the air', () => {
  let body = { x: 200, y: 80, vx: 800, vy: 0, decideAt: 999, gait: 'walk' };
  for (let i = 0; i < 3; i += 1) body = stepWalker(body, lane, 0.05, false);
  assert.ok(body.y < lane.maxY, body.y);
  assert.ok(body.vx > 780, body.vx);
});

test('he returns to a circle slower than he stretches', () => {
  const back = easeStretch(1.4, 1, 0.05);
  const out = easeStretch(1, 1.4, 0.05);
  assert.ok(Math.abs(1.4 - back) < Math.abs(out - 1));
  assert.ok(back > 1 && back < 1.31);
  assert.ok(out > 1 && out < 1.4);
});

test('the sprite chime is a short rising tune', () => {
  assert.equal(SPRITE_CHIME.length, 4);
  assert.ok(SPRITE_CHIME[0].hz < SPRITE_CHIME[1].hz && SPRITE_CHIME[1].hz < SPRITE_CHIME[2].hz);
  assert.ok(SPRITE_CHIME[3].hz > SPRITE_CHIME[2].hz);
  const end = Math.max(...SPRITE_CHIME.map((note) => note.at + note.dur));
  assert.ok(end < 0.5, end);
  assert.ok(SPRITE_CHIME.every((note) => note.hz >= 700 && note.hz <= 2200 && note.dur <= 0.22));
});
