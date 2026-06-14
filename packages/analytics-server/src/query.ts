/**
 * Query and aggregate functions for cue analytics events.
 * Can be used standalone (without the HTTP server running) — an agent
 * can import query.ts directly and pass events read from the NDJSON file.
 */

import type { StoredEvent } from "./store";

/** Aggregate stats for a single demo. */
export interface DemoStats {
  demoId: string;
  totalViews: number;
  completionRate: number;
  avgStepsReached: number;
  stepDropoff: number[];
  hotspotClicks: Record<string, number>;
}

/**
 * Compute aggregate statistics for a specific demo from an array of stored events.
 * This function is pure — it takes events as input and returns computed stats,
 * making it usable offline without the server running.
 *
 * Usage (standalone):
 *   import { readEventsByDemo } from "./store";
 *   import { queryStats } from "./query";
 *   const events = await readEventsByDemo("my-demo");
 *   const stats = queryStats("my-demo", events);
 */
export function queryStats(demoId: string, events: StoredEvent[]): DemoStats {
  const demoEvents = events.filter((e) => e.demoId === demoId);

  // Unique sessions
  const sessions = new Set(demoEvents.map((e) => e.sessionId));
  const totalViews = sessions.size;

  // For each session, find the highest step reached
  let totalStepsReached = 0;
  const maxStepBySession = new Map<string, number>();
  const totalStepsBySession = new Map<string, number>();

  for (const ev of demoEvents) {
    // Track totalSteps from any event that includes it
    if (ev.totalSteps !== undefined) {
      totalStepsBySession.set(ev.sessionId, ev.totalSteps);
    }
    if (ev.step !== undefined) {
      const current = maxStepBySession.get(ev.sessionId) ?? -1;
      if (ev.step > current) {
        maxStepBySession.set(ev.sessionId, ev.step);
      }
    }
  }

  // Completion: a session is "complete" if the last event is "complete"
  const completedSessions = new Set<string>();
  // We need to find the last event per session
  const lastEventBySession = new Map<string, StoredEvent>();
  for (const ev of demoEvents) {
    const existing = lastEventBySession.get(ev.sessionId);
    if (!existing || ev.ts >= existing.ts) {
      lastEventBySession.set(ev.sessionId, ev);
    }
  }
  for (const [sessionId, lastEv] of lastEventBySession) {
    if (lastEv.event === "complete") {
      completedSessions.add(sessionId);
    }
  }

  const completionRate = totalViews > 0 ? completedSessions.size / totalViews : 0;

  // Average steps reached
  for (const maxStep of maxStepBySession.values()) {
    totalStepsReached += maxStep + 1; // step is 0-indexed, so +1 for count
  }
  const avgStepsReached = totalViews > 0 ? totalStepsReached / totalViews : 0;

  // Step dropoff: how many sessions reached each step index
  // Determine max total steps
  let maxTotalSteps = 0;
  for (const ts of totalStepsBySession.values()) {
    if (ts > maxTotalSteps) maxTotalSteps = ts;
  }
  // Fallback: use highest step index + 1
  if (maxTotalSteps === 0) {
    let maxStep = 0;
    for (const s of maxStepBySession.values()) {
      if (s + 1 > maxStep) maxStep = s + 1;
    }
    maxTotalSteps = maxStep;
  }

  // stepDropoff[i] = number of sessions that reached step i
  const stepDropoff: number[] = new Array(maxTotalSteps + 1).fill(0);
  // stepDropoff[0] = total views (everyone who started)
  stepDropoff[0] = totalViews;
  for (const maxStep of maxStepBySession.values()) {
    for (let i = 1; i <= Math.min(maxStep, maxTotalSteps); i++) {
      stepDropoff[i]++;
    }
  }

  // Hotspot clicks
  const hotspotClicks: Record<string, number> = {};
  for (const ev of demoEvents) {
    if (ev.event === "hotspot_click" && ev.hotspotId) {
      hotspotClicks[ev.hotspotId] = (hotspotClicks[ev.hotspotId] ?? 0) + 1;
    }
  }

  return {
    demoId,
    totalViews,
    completionRate,
    avgStepsReached,
    stepDropoff,
    hotspotClicks,
  };
}

/**
 * List all unique demo IDs present in the event log.
 * Useful for discovering which demos have analytics data.
 */
export function listDemoIds(events: StoredEvent[]): string[] {
  const ids = new Set(events.map((e) => e.demoId));
  return [...ids];
}

/**
 * Get events for a specific session.
 * Returns events sorted by timestamp.
 */
export function getSessionEvents(
  sessionId: string,
  events: StoredEvent[]
): StoredEvent[] {
  return events
    .filter((e) => e.sessionId === sessionId)
    .sort((a, b) => a.ts - b.ts);
}
