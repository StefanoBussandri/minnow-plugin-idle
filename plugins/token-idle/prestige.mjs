import { prestige } from './economy.mjs';
import { load, save } from './store.mjs';

export default async function retrain(args, ctx) {
  if (ctx.signal?.aborted) throw new Error('aborted');
  const now = Date.now();
  const bag = await load(ctx, now);
  const result = prestige(bag.state, now);
  await save(ctx, bag);
  return { gained: result.gained, ...result.state };
}
