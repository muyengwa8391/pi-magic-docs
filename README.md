# pi-magic-docs

Living documents that update themselves from your conversation.

## How it works

Create a file with this header:

```markdown
# MAGIC DOC: Auth System Design
*Focus on the auth flow and error handling*
```

The title after `# MAGIC DOC:` is required. The italicized instruction line is optional — it tells the agent what to focus on when updating.

When the agent reads a magic doc during a session, it starts tracking it. After every idle stretch (2+ turns), a follow-up message asks the agent to re-read and update the doc with anything new from the conversation.

Updates are:
- **Terse** — high signal only
- **In-place** — no changelogs, no "Previously..." notes
- **Architectural** — document WHY things exist, not what's obvious from code
- **Current** — outdated sections get deleted, not annotated

## Install

```bash
pi install pi-magic-docs
```

Or add to your `~/.pi/agent/settings.json`:

```json
{
  "packages": ["pi-magic-docs"]
}
```
