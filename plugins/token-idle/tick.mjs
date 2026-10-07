import { applyTick } from './economy.mjs';
import { workspaceChatTokens } from './chat-usage.mjs';
import { load, save } from './store.mjs';

export default async function tick(args, ctx) {
  if (ctx.signal?.aborted) throw new Error('aborted');
  let observed = args?.observed_tokens;
  let usageSource = observed === undefined ? 'none' : 'ledger';
  let usageError = null;
  try {
    const chat = await workspaceChatTokens(ctx.workspaceRoot, ctx.sessionsDb);
    if (observed === undefined || chat.total > observed) {
      observed = chat.total;
      usageSource = chat.estimatedChats > 0 ? 'estimated' : 'ledger';
    }
  } catch (error) {
    usageError = error.message;
  }
  const now = Date.now();
  const bag = await load(ctx, now);
  const result = applyTick(bag.state, { now, observedTokens: observed });
  await save(ctx, bag);
  return { elapsedMs: result.elapsedMs, idleAdded: result.idleAdded, usageAdded: result.usageAdded, usageSource, usageError, ...result.state };
}
