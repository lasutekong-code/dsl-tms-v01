#!/usr/bin/env node
/**
 * Create an active admin user (Auth + profiles). Server-only; uses SUPABASE_SERVICE_ROLE_KEY.
 *
 * Usage:
 *   node scripts/create-admin.mjs --email admin@example.com --password 'Secret123!' --name '시스템 관리자'
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const root = join(import.meta.dirname, "..");
const localPath = join(root, ".env.local");

function loadEnvFile(path) {
  if (!existsSync(path)) {
    return;
  }
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const eq = trimmed.indexOf("=");
    if (eq === -1) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(localPath);

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1 || !process.argv[i + 1]) {
    return null;
  }
  return process.argv[i + 1];
}

const email = arg("email");
const password = arg("password");
const name = arg("name") ?? "시스템 관리자";
const phone = arg("phone");

if (!email || !password) {
  console.error(
    "Usage: node scripts/create-admin.mjs --email <email> --password <password> [--name <name>] [--phone <phone>]",
  );
  process.exit(1);
}

if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey || serviceKey === "your-service-role-key") {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: created, error: createError } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { name, role: "admin" },
});

if (createError) {
  console.error("Auth create failed:", createError.message);
  process.exit(1);
}

const userId = created.user?.id;
if (!userId) {
  console.error("No user id returned.");
  process.exit(1);
}

const { error: profileError } = await supabase.from("profiles").upsert(
  {
    id: userId,
    role: "admin",
    name,
    email,
    phone: phone ?? null,
    is_active: true,
  },
  { onConflict: "id" },
);

if (profileError) {
  await supabase.auth.admin.deleteUser(userId);
  console.error("Profile upsert failed:", profileError.message);
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, userId, email, name, role: "admin", is_active: true }, null, 2));
