import { mintTokens } from './economy.mjs';
import { load, save } from './store.mjs';

export default async function mint(_args, ctx) {
  if (ctx.signal?.aborted) throw new Error('aborted');
  const now = Date.now();
  const bag = await load(ctx, now);
  const result = mintTokens(bag.state, now);
  await save(ctx, bag);
  return { minted: result.minted, ...result.state };
}
