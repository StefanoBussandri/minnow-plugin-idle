import { homedir } from 'node:os';
import path from 'node:path';

export const DEFAULT_DB = path.join(homedir(), '.minnow', 'sessions', 'sessions.db');
export const CHARS_PER_TOKEN = 4;

function key(value) {
  const resolved = path.resolve(value || '');
  return process.platform === 'win32' ? resolved.toLowerCase() : resolved;
}

function ledgerTotal(metaJson) {
  try {
    const total = JSON.parse(metaJson)?.tokenLedger?.totals?.totalTokens;
    return Number.isFinite(total) && total > 0 ? Math.round(total) : 0;
  } catch {
    return 0;
  }
}

// Providers that report usage fill the chat ledger; for the rest, estimate from stored message text.
export async function workspaceChatTokens(workspaceRoot, dbPath = DEFAULT_DB) {
  let DatabaseSync;
  try {
    ({ DatabaseSync } = await import('node:sqlite'));
  } catch {
    throw new Error(`node:sqlite is unavailable in Node ${process.version}`);
  }
  const db = new DatabaseSync(dbPath, { readOnly: true });
  try {
    const target = key(workspaceRoot);
    const chats = db.prepare("SELECT id, workspace_path, meta_json FROM chats WHERE workspace_path <> ''").all()
      .filter((chat) => key(chat.workspace_path) === target);
    const chars = db.prepare('SELECT COALESCE(SUM(text_len), 0) AS n FROM messages WHERE chat_id = ?');
    let total = 0;
    let estimatedChats = 0;
    for (const chat of chats) {
      const reported = ledgerTotal(chat.meta_json);
      if (reported > 0) {
        total += reported;
        continue;
      }
      const length = Number(chars.get(chat.id).n) || 0;
      if (length > 0) estimatedChats += 1;
      total += Math.ceil(length / CHARS_PER_TOKEN);
    }
    return { total, chats: chats.length, estimatedChats };
  } finally {
    db.close();
  }
}
