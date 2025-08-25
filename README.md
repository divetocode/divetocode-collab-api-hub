# collab-api-hub

Unified collaboration API adapters for **Slack**, **Telegram**, and **Notion** — organized as an npm workspaces monorepo.

> ⚙️ Target runtime: **Node 18+** (native `fetch`)  
> 🔤 Language: **TypeScript**  
> 📦 Packages are published under your org scope, e.g. `@divetocode/adapter-slack`

---

## Packages

- `@yourorg/adapter-core` — shared **types**, error/retry utilities, adapter interface
- `@yourorg/adapter-slack` — Slack Web API adapter (messages, channels, users, webhook verify)
- `@yourorg/adapter-telegram` — Telegram Bot API adapter (sendMessage)
- `@yourorg/adapter-notion` — Notion client adapter (creates a page per message; sample mapping)

> These adapters are **unofficial**. “Slack”, “Telegram”, and “Notion” are trademarks of their respective owners.
