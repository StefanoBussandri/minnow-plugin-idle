import { view } from './economy.mjs';
import { load } from './store.mjs';

export default async function getState(_args, ctx) {
  if (ctx.signal?.aborted) throw new Error('aborted');
  const bag = await load(ctx);
  return view(bag.state);
}
