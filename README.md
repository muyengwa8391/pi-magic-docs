# pi-magic-docs

Self-updating markdown docs for [pi](https://github.com/badlogic/pi-mono).

Mark a doc with `# MAGIC DOC:`, work normally, and pi will periodically nudge itself to keep that file current with what happened in the conversation.

## Install

```bash
pi install npm:pi-magic-docs
```


## What it does

Magic Docs are markdown files that pi keeps fresh as you work.

Good fits:
- architecture notes
- subsystem overviews
- onboarding docs
- entry-point maps for large codebases
- docs that should explain **why** things exist, not mirror the code

When pi sees a magic doc, it starts tracking it for the session. After the conversation goes idle, Haiku reviews the recent conversation and decides whether the docs actually need updating. If yes, it pushes a message into chat telling the agent to update. You see everything — nothing happens behind your back.

## Magic doc format

A magic doc must start with this header as the first non-empty line:

```md
# MAGIC DOC: Auth System Design
*Focus on auth flow, permission model, and error handling*
```

Rules:
- `# MAGIC DOC: ...` is required
- the title is everything after the colon
- the italic line is optional
- the header must be the first non-empty line in the file

## How it works

1. pi reads, edits, or writes a magic doc
2. the extension starts tracking that file for the current session
3. after **2 consecutive idle agent runs** (no tool calls in either), Haiku checks the recent conversation
4. if Haiku decides the conversation has relevant new info, it pushes a visible update message into chat
5. the agent re-reads the tracked docs and updates them in place
6. a 5-minute cooldown prevents rapid-fire reminders

Haiku acts as a gate — no silent background agents, no surprise edits. If there's nothing worth updating, it skips quietly.

## Update behavior

Magic Docs are for high-signal documentation:

- terse
- current-state only
- architecture and rationale over code walkthroughs
- no changelog-style "previously..." notes
- stale sections should be replaced or deleted

If nothing meaningful changed, the agent should skip the update.

## Why this exists

Most docs rot because updating them is a separate task.

Magic Docs turns documentation maintenance into a background habit:
- work on the code
- talk through decisions
- let pi notice the idle moment
- refresh the important docs before context disappears

## License

MIT
