/**
 * NDJSON append-only store for cue analytics events.
 * Uses Node.js built-in fs/path modules — zero external runtime dependencies.
 */

import fs from "fs";
import path from "path";

/** Event shape stored in the NDJSON log. */
export interface StoredEvent {
  demoId: string;
  sessionId: string;
  event: string;
  step?: number;
  totalSteps?: number;
  hotspotId?: string;
  ts: number;
}

/** Options for creating a store instance. */
export interface StoreOptions {
  /** Directory where events.ndjson lives. Default: process.env.CUE_DATA_DIR || "data" */
  dataDir?: string;
}

/** Resolve the data directory from options or env. */
function resolveDataDir(options?: StoreOptions): string {
  return options?.dataDir ?? process.env.CUE_DATA_DIR ?? "data";
}

/** Resolve the full path to the events.ndjson file. */
function resolveFilePath(options?: StoreOptions): string {
  return path.join(resolveDataDir(options), "events.ndjson");
}

/**
 * Append a single event to the NDJSON log file.
 * Creates the data directory and file if they don't exist.
 */
export function appendEvent(event: StoredEvent, options?: StoreOptions): void {
  const dir = resolveDataDir(options);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const filePath = path.join(dir, "events.ndjson");
  const line = JSON.stringify(event) + "\n";
  fs.appendFileSync(filePath, line, "utf-8");
}

/**
 * Read all events from the NDJSON log file.
 * Returns an array of parsed StoredEvent objects. Malformed lines are skipped.
 */
export function readAllEvents(options?: StoreOptions): StoredEvent[] {
  const filePath = resolveFilePath(options);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  const events: StoredEvent[] = [];
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.length === 0) continue;
    try {
      events.push(JSON.parse(trimmed) as StoredEvent);
    } catch {
      /* skip malformed lines */
    }
  }
  return events;
}

/**
 * Read events filtered by demoId.
 * Reads all events then filters — suitable for moderate file sizes.
 */
export function readEventsByDemo(demoId: string, options?: StoreOptions): StoredEvent[] {
  const all = readAllEvents(options);
  return all.filter((e) => e.demoId === demoId);
}

/**
 * Count total events in the log file without parsing each one fully.
 * Simply counts non-empty lines.
 */
export function countEvents(options?: StoreOptions): number {
  const filePath = resolveFilePath(options);
  if (!fs.existsSync(filePath)) {
    return 0;
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  let count = 0;
  for (const line of raw.split("\n")) {
    if (line.trim().length > 0) count++;
  }
  return count;
}
