# pi-magic-docs

Living documents that update themselves from your conversation.

## How it works

Start a file with this header (must be the first non-empty line):

```markdown
# MAGIC DOC: Auth System Design
*Focus on the auth flow and error handling*
```

The title after `# MAGIC DOC:` is required. The italicized instruction line is optional — it tells the agent what to focus on when updating.

When the agent reads, edits, or writes a magic doc during a session, it starts tracking it. After an idle stretch (2+ turns), if any tracked doc was modified on disk since last seen, a follow-up message asks the agent to re-read and update those docs with anything new from the conversation.

A 2-minute cooldown prevents rapid-fire updates when multiple edits happen in quick succession.

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
