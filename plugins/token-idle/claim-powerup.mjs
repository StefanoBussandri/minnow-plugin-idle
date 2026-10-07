import { claimPowerup } from './economy.mjs';
import { load, save } from './store.mjs';

export default async function claim(args, ctx) {
  if (ctx.signal?.aborted) throw new Error('aborted');
  const id = args?.powerup_id;
  if (typeof id !== 'string' || id.length === 0) throw new Error('powerup_id must be a non-empty string');
  const now = Date.now();
  const bag = await load(ctx, now);
  const result = claimPowerup(bag.state, id, now);
  await save(ctx, bag);
  return { claimed: result.claimed, ...result.state };
}
