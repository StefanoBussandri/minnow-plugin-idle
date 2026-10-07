# Token Foundry

A Minnow plugin. Tokens you spend in a workspace become the currency for a small idle foundry: a balance rail, a side panel of upgrades, and a smith who walks along the bottom of the window.

The game rules, tools, and smith behavior are in [plugins/token-idle/README.md](plugins/token-idle/README.md).

## What you need

- Minnow, with plugin API v1
- Node.js 20 or newer, only if you want to run the tests

There is no install step for libraries. The plugin is plain ESM and does not ship credentials.

## Give this to someone else

Zip this folder, or send the git repository. Do not put a `foundry.json` wallet in the zip. Wallets live in Minnow’s plugin data directory, one per workspace, and they are not part of this project.

Your friend installs it inside Minnow:

1. Unzip the project somewhere permanent. Moving the folder later means installing it again from the new path.
2. Open **Settings → Plugins**.
3. Install the `plugins/token-idle` folder. That is the folder with `plugin.json`, not the project root.
4. Set the plugin’s tool permission to **Full**.

**Full** is required. The foundry syncs the workspace token ledger about every two seconds. **Ask** would prompt on every sync.

After it loads, the balance sits on a slim rail at the right edge and the smith walks along the bottom. `/foundry` or **Toggle Token Foundry** opens the panel. Click the smith to open it too.

## Tests

```sh
npm test
```

That runs `tests/token-idle.test.mjs` and `tests/walker.test.mjs`. The tests use a temporary directory and do not touch a real Minnow wallet.

## Remove

Disable or remove the plugin from Settings → Plugins. That takes away the rail, the panel, and the slash command. The wallet file stays, so installing it again in the same workspace keeps the balance.
