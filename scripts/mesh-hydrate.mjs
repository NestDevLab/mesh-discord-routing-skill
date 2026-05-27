#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const skillDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const configCandidates = [
  process.env.MESH_PARTICIPANTS_JSON,
  resolve(skillDir, "participants.local.json"),
  resolve(process.env.HOME || ".", ".config", "mesh-discord-routing", "participants.json"),
  "/etc/mesh-discord-routing/participants.json"
].filter(Boolean);

const registryPath = configCandidates.find((candidate) => existsSync(candidate));
if (!registryPath) {
  console.error("mesh-hydrate: missing participant config. Set MESH_PARTICIPANTS_JSON or create participants.local.json next to this skill.");
  process.exit(4);
}

const registry = JSON.parse(readFileSync(registryPath, "utf8"));

function readArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return "";
  return process.argv[index + 1] || "";
}

function normalizeLabel(value) {
  return String(value || "").trim().toLowerCase();
}

const to = readArg("--to")
  .split(",")
  .map(normalizeLabel)
  .filter(Boolean);
const body = readArg("--body").trim();

if (!body) {
  console.error("mesh-hydrate: missing --body");
  process.exit(2);
}

const participants = registry.participants || {};
const aliasToLabel = new Map();
for (const [label, entry] of Object.entries(participants)) {
  aliasToLabel.set(normalizeLabel(label), label);
  for (const alias of entry.aliases || []) aliasToLabel.set(normalizeLabel(alias), label);
}

const mentions = [];
const recipientLabels = [];
const unknown = [];
for (const rawLabel of to) {
  const label = aliasToLabel.get(rawLabel);
  const participant = label ? participants[label] : undefined;
  if (!participant?.discordUserId) {
    unknown.push(rawLabel);
    continue;
  }
  recipientLabels.push(label);
  mentions.push(`<@${participant.discordUserId}>`);
}

if (unknown.length > 0) {
  console.error(`mesh-hydrate: unknown recipient label(s): ${unknown.join(", ")}`);
  process.exit(3);
}

const prefix = [...new Set(mentions)].join(" ");
const trigger = [...new Set(recipientLabels)].join(",");
console.log(prefix ? `cc-mesh: ${trigger}\n${prefix} ${body}` : body);
