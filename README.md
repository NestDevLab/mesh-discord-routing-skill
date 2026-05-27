# Mesh Discord Routing Skill

A small, portable skill for Discord-based mesh conversations.

The model chooses semantic recipient labels, such as `facilitator` or `reviewer`.
It must not hand-write raw Discord mentions. The included hydrator script resolves
those labels from local configuration and emits a Discord-ready message with:

- a visible `cc-mesh:` trigger line
- hydrated Discord mentions
- the human-readable message body

## Files

- `SKILL.md` - runtime instructions for mesh-mode routing.
- `scripts/mesh-hydrate.mjs` - label-to-mention hydrator.
- `participants.example.json` - example participant config with fake IDs.

Local participant mappings belong in `participants.local.json`, or in one of the
external config paths supported by the script. Do not commit real mappings.

## Usage

```bash
node scripts/mesh-hydrate.mjs --to facilitator --body "Is it commonly found in a home?"
```

With a configured `facilitator` participant, the script emits:

```text
cc-mesh: facilitator
<@111111111111111111> Is it commonly found in a home?
```

## Configuration

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
