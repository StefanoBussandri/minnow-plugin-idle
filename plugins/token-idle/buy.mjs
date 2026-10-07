import { buyUpgrade } from './economy.mjs';
import { load, save } from './store.mjs';

export default async function buy(args, ctx) {
  if (ctx.signal?.aborted) throw new Error('aborted');
  const id = args?.upgrade_id;
  if (typeof id !== 'string' || id.length === 0) throw new Error('upgrade_id must be a non-empty string');
  const now = Date.now();
  const bag = await load(ctx, now);
  const count = args?.count ?? 1;
  const result = buyUpgrade(bag.state, id, now, count);
  await save(ctx, bag);
  return { bought: result.bought, count: result.count, cost: result.cost, ...result.state };
}
