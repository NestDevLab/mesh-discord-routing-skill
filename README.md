# Mesh Discord Routing Skill

Mesh Discord Routing is a small, portable skill that lets agents of any runtime
communicate with each other through Discord using simple, explicit routing rules.

It is meant for mixed agent groups: framework-specific agents, custom bots,
hosted assistants, or any other runtime that can follow a skill and send
Discord messages.
The shared rule is:

- each agent decides who should receive its own reply
- agents use semantic recipient labels, not raw Discord mention strings
- a small hydrator script turns those labels into the `cc-mesh:` trigger and
  Discord mentions
- the human-readable message stays separate from routing metadata

This keeps the routing policy simple enough for language models to follow while
keeping mention formatting deterministic and runtime-independent.

## What It Does

The skill gives agents a common protocol for mesh-mode Discord conversations:

1. If a message contains `cc-mesh:`, treat it as a routed mesh message.
2. Decide who should receive the reply.
3. Default to notifying the sender when answering directly.
4. Add other recipients only when they should be involved.
5. Use no recipients only when no bot should be notified.
6. Never hand-write raw Discord mentions such as `<@...>`.
7. Use the hydrator script or an equivalent API to compose the final message.

The included hydrator resolves local recipient labels, such as `facilitator` or
`reviewer`, from configuration and emits a Discord-ready message with:

- a visible `cc-mesh:` trigger line
- hydrated Discord mentions
- the human-readable message body

## What It Does Not Do

- It does not orchestrate a workflow or decide turn order.
- It does not define game rules, task rules, or agent roles.
- It does not require every bot to use the same runtime.
- It does not publish local participant mappings.

The skill only defines the communication contract. Higher-level systems can
build games, reviews, meetings, task handoffs, or other workflows on top of it.

## Files

- `SKILL.md` - runtime instructions for mesh-mode routing.
- `scripts/mesh-hydrate.mjs` - label-to-mention hydrator.
- `participants.example.json` - example participant config with fake IDs.

Local participant mappings belong in `participants.local.json`, or in one of the
external config paths supported by the script. Do not commit real mappings.

## Usage

```bash
mesh-hydrate --to facilitator --body "Is it commonly found in a home?"
```

With a configured `facilitator` participant, the script emits:

```text
cc-mesh: facilitator
<@111111111111111111> Is it commonly found in a home?
```

## Configuration

Runtimes can expose the bundled script as a `mesh-hydrate` command, or call it
directly from the skill installation directory:

```bash
node /path/to/mesh-discord-routing/scripts/mesh-hydrate.mjs --to facilitator --body "Is it commonly found in a home?"
```

Do not assume `scripts/mesh-hydrate.mjs` is relative to the conversation working
directory.

The script loads the first existing config from:

1. `MESH_PARTICIPANTS_JSON`
2. `participants.local.json` next to the skill
3. `$HOME/.config/mesh-discord-routing/participants.json`
4. `/etc/mesh-discord-routing/participants.json`

Config shape:

```json
{
  "participants": {
    "facilitator": {
      "discordUserId": "111111111111111111",
      "aliases": ["host"]
    }
  }
}
```

## Privacy

This repository is intended to be publishable. It must not contain real Discord
IDs, private agent names, server names, internal paths, tokens, or local
participant mappings.
