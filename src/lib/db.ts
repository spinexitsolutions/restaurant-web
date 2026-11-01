import "server-only";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { createSeed } from "./seed";
import type { CollectionName, Customer, Database, Settings } from "./types";

/**
 * Tiny JSON-file database. Zero setup, perfect for demos and small venues.
 * Data lives in `.data/db.json` (or DATA_DIR). On read-only hosts
 * (e.g. serverless) it transparently falls back to the OS temp dir.
 * Swap this module for Postgres/Supabase/Mongo in production — the
 * rest of the app only talks to the functions exported here.
 */

// Shared across route handlers & pages (they can live in separate module graphs).
const G = globalThis as unknown as { __noorDb?: { dir: string; cache: Database | null; mtime: number; writing: Promise<void> } };
const state = (G.__noorDb ??= {
  dir: process.env.DATA_DIR || path.join(process.cwd(), ".data"),
  cache: null,
  mtime: 0,
  writing: Promise.resolve(),
});

function file() {
  return path.join(state.dir, "db.json");
}

async function ensureDir() {
  try {
    await fs.mkdir(state.dir, { recursive: true });
    await fs.access(state.dir, (await import("fs")).constants.W_OK);
  } catch {
    state.dir = path.join(os.tmpdir(), "noor-data");
    await fs.mkdir(state.dir, { recursive: true });
  }
}

export function getDataDir() {
  return state.dir;
}

export async function readDb(): Promise<Database> {
  await state.writing;
  if (state.cache) {
    // another process/module may have written — reload when the file changed
    const m = await fs.stat(file()).then((st) => st.mtimeMs).catch(() => 0);
    if (m === state.mtime) return state.cache;
  }
  await ensureDir();
  try {
    const raw = await fs.readFile(file(), "utf8");
    const parsed = JSON.parse(raw) as Database;
    // forward-compatible: fill in any new keys from the seed
    const seed = createSeed();
    state.cache = { ...seed, ...parsed, settings: deepMerge(seed.settings, parsed.settings) };
    state.mtime = (await fs.stat(file())).mtimeMs;
  } catch {
    state.cache = createSeed();
    await persist(state.cache);
  }
  return state.cache!;
}

async function persist(db: Database) {
  state.writing = state.writing.then(async () => {
    await ensureDir();
    const tmp = file() + ".tmp";
    await fs.writeFile(tmp, JSON.stringify(db, null, 2));
    await fs.rename(tmp, file());
    state.mtime = (await fs.stat(file())).mtimeMs;
  });
  return state.writing;
}

export async function writeDb(mutator: (db: Database) => void | Promise<void>) {
  const db = await readDb();
  await mutator(db);
  await persist(db);
  return db;
}

export async function resetDb() {
  state.cache = createSeed();
  await persist(state.cache);
  return state.cache;
}

export async function getSettings(): Promise<Settings> {
  return (await readDb()).settings;
}

export async function list<K extends CollectionName>(name: K): Promise<Database[K]> {
  return (await readDb())[name];
}

export function uid(prefix = "") {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export async function insert<K extends CollectionName>(name: K, item: Database[K][number]) {
  await writeDb((db) => {
    (db[name] as Database[K][number][]).unshift(item);
  });
  return item;
}

export async function update<K extends CollectionName>(name: K, id: string, patch: Partial<Database[K][number]>) {
  let found: Database[K][number] | undefined;
  await writeDb((db) => {
    const arr = db[name] as (Database[K][number] & { id: string })[];
    const idx = arr.findIndex((x) => x.id === id);
    if (idx >= 0) {
      arr[idx] = { ...arr[idx], ...patch, id };
      found = arr[idx];
    }
  });
  return found;
}

export async function remove<K extends CollectionName>(name: K, id: string) {
  await writeDb((db) => {
    (db as unknown as Record<string, { id: string }[]>)[name] = (db[name] as { id: string }[]).filter((x) => x.id !== id);
  });
}

/** CRM: create or enrich a customer profile from any touchpoint. */
export async function upsertCustomer(input: {
  name: string;
  email?: string;
  phone?: string;
  source: string;
  spend?: number;
  visit?: boolean;
  order?: boolean;
}) {
  await writeDb((db) => {
    const email = (input.email || "").trim().toLowerCase();
    const phone = (input.phone || "").replace(/\s+/g, "");
    let c: Customer | undefined = db.customers.find(
      (x) => (email && x.email.toLowerCase() === email) || (phone && x.phone.replace(/\s+/g, "") === phone)
    );
    const nowIso = new Date().toISOString();
    if (!c) {
      c = {
        id: uid("cu"),
        name: input.name,
        email: input.email || "",
        phone: input.phone || "",
        tags: ["New"],
        notes: "",
        visits: 0,
        orders: 0,
        totalSpent: 0,
        lastSeen: nowIso,
        source: input.source,
        birthday: "",
        createdAt: nowIso,
      };
      db.customers.unshift(c);
    }
    c.name = input.name || c.name;
    if (input.email) c.email = input.email;
    if (input.phone) c.phone = input.phone;
    if (input.visit) c.visits += 1;
    if (input.order) c.orders += 1;
    c.totalSpent += input.spend || 0;
    c.lastSeen = nowIso;
    if (c.visits + c.orders >= 3 && c.tags.includes("New")) {
      c.tags = c.tags.filter((t) => t !== "New").concat("Regular");
    }
  });
}

function deepMerge<T>(base: T, over: Partial<T> | undefined): T {
  if (!over) return base;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(over)) {
    const b = (base as Record<string, unknown>)[k];
    if (v && typeof v === "object" && !Array.isArray(v) && b && typeof b === "object" && !Array.isArray(b)) {
      out[k] = deepMerge(b, v as Partial<typeof b>);
    } else if (v !== undefined) {
      out[k] = v;
    }
  }
  return out as T;
}
