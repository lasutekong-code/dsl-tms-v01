#!/usr/bin/env node
/**
 * Ensures .env.local exists and contains every KEY from .env.example.
 * Existing values in .env.local are never overwritten.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const examplePath = join(root, ".env.example");
const localPath = join(root, ".env.local");

function parseEnvKeys(text) {
  const keys = [];
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const eq = trimmed.indexOf("=");
    if (eq === -1) {
      continue;
    }
    keys.push(trimmed.slice(0, eq).trim());
  }
  return keys;
}

function getEnvMap(text) {
  const map = new Map();
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const eq = trimmed.indexOf("=");
    if (eq === -1) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1);
    map.set(key, value);
  }
  return map;
}

function defaultLineForKey(key, exampleText) {
  for (const line of exampleText.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith(`${key}=`)) {
      return trimmed;
    }
  }
  return `${key}=`;
}

const exampleText = readFileSync(examplePath, "utf8");
const exampleKeys = parseEnvKeys(exampleText);

let localText = "";
if (existsSync(localPath)) {
  localText = readFileSync(localPath, "utf8");
} else {
  console.log("Creating .env.local from .env.example …");
  writeFileSync(localPath, exampleText, "utf8");
  localText = exampleText;
}

const localMap = getEnvMap(localText);
const missing = exampleKeys.filter((key) => !localMap.has(key));

if (missing.length === 0) {
  console.log(".env.local is up to date.");
  process.exit(0);
}

const additions = missing.map((key) => defaultLineForKey(key, exampleText));
const suffix = localText.endsWith("\n") ? "" : "\n";
const next = `${localText}${suffix}${additions.join("\n")}\n`;

writeFileSync(localPath, next, "utf8");
console.log(`Added to .env.local: ${missing.join(", ")}`);
if (missing.includes("SUPABASE_SERVICE_ROLE_KEY")) {
  console.log(
    "Set SUPABASE_SERVICE_ROLE_KEY in .env.local (replace your-service-role-key with the service_role key from Supabase Dashboard → API).",
  );
}
