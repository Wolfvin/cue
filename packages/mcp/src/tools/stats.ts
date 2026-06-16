/**
 * Tool handler for cue_get_stats — query analytics stats for a demo from a
 * running cue-analytics-server.
 */

import { z } from "zod";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

/** Zod schema for the cue_get_stats tool input. */
export const statsToolSchema = {
  demoId: z.string().describe(
    "The identifier of the demo to query stats for."
  ),
  endpoint: z.string().optional().describe(
    "URL of the cue-analytics-server. Default: http://localhost:3001"
  ),
};

/**
 * Validate that an endpoint URL is safe to fetch.
 *
 * Guards against Server-Side Request Forgery (SSRF) by:
 *   1. Requiring a valid URL parseable by the URL constructor.
 *   2. Only allowing http: and https: protocols.
 *   3. Blocking private / reserved IP ranges:
 *        - 127.0.0.0/8       (loopback)
 *        - 10.0.0.0/8        (RFC 1918)
 *        - 172.16.0.0/12     (RFC 1918)
 *        - 192.168.0.0/16    (RFC 1918)
 *        - 169.254.0.0/16    (link-local / cloud metadata)
 *        - 0.0.0.0/8         (current network)
 *
 * @throws Error("Invalid endpoint") if the URL does not pass validation.
 */
export function validateEndpoint(endpoint: string): void {
  let parsed: URL;
  try {
    parsed = new URL(endpoint);
  } catch {
    throw new Error("Invalid endpoint");
  }

  // Only allow http and https protocols
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Invalid endpoint");
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block IPv6 loopback and IPv6-mapped IPv4
  if (hostname === "::1" || hostname === "[::1]") {
    throw new Error("Invalid endpoint");
  }
  // Block common IPv6-mapped IPv4 patterns (::ffff:127.0.0.1 etc.)
  if (hostname.startsWith("::ffff:") || hostname.startsWith("[::ffff:")) {
    throw new Error("Invalid endpoint");
  }

  // For IPv4 hostnames, check against private ranges
  const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const [, aStr, bStr, cStr, dStr] = ipv4Match;
    const a = parseInt(aStr, 10);
    const b = parseInt(bStr, 10);
    const c = parseInt(cStr, 10);
    const d = parseInt(dStr, 10);

    // Validate octet ranges (reject invalid like 999.999.999.999)
    if (a > 255 || b > 255 || c > 255 || d > 255) {
      throw new Error("Invalid endpoint");
    }

    // 0.0.0.0/8 — current network
    if (a === 0) {
      throw new Error("Invalid endpoint");
    }
    // 127.0.0.0/8 — loopback
    if (a === 127) {
      throw new Error("Invalid endpoint");
    }
    // 10.0.0.0/8 — RFC 1918
    if (a === 10) {
      throw new Error("Invalid endpoint");
    }
    // 172.16.0.0/12 — RFC 1918
    if (a === 172 && b >= 16 && b <= 31) {
      throw new Error("Invalid endpoint");
    }
    // 192.168.0.0/16 — RFC 1918
    if (a === 192 && b === 168) {
      throw new Error("Invalid endpoint");
    }
    // 169.254.0.0/16 — link-local / cloud metadata
    if (a === 169 && b === 254) {
      throw new Error("Invalid endpoint");
    }
  }

  // Block common internal hostnames that could resolve to private IPs
  if (hostname === "localhost" || hostname === "localhost.localdomain") {
    throw new Error("Invalid endpoint");
  }
}

/** Hardcoded default endpoint — considered safe and not subject to SSRF validation. */
const DEFAULT_ENDPOINT = "http://localhost:3001";

/**
 * Handle the cue_get_stats tool call.
 * Fetches {endpoint}/stats/{demoId} and returns the stats object.
 */
export async function handleGetStats(
  args: Record<string, unknown>
): Promise<CallToolResult> {
  try {
    const raw = args as { demoId?: string; endpoint?: string };
    const demoId = raw.demoId;
    const userEndpoint = raw.endpoint;

    if (!demoId || typeof demoId !== "string") {
      return {
        content: [{ type: "text", text: "Error: 'demoId' is required and must be a string." }],
        isError: true,
      };
    }

    // If the user explicitly provided an endpoint, validate it to prevent SSRF.
    // The hardcoded default is considered safe and skips validation.
    const endpoint = userEndpoint ?? DEFAULT_ENDPOINT;
    if (userEndpoint !== undefined) {
      validateEndpoint(userEndpoint);
    }

    const url = `${endpoint.replace(/\/+$/, "")}/stats/${encodeURIComponent(demoId)}`;

    const response = await fetch(url);

    if (!response.ok) {
      return {
        content: [
          {
            type: "text",
            text: `Error: Analytics server returned ${response.status} ${response.statusText} for ${url}`,
          },
        ],
        isError: true,
      };
    }

    const stats = await response.json();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(stats, null, 2),
        },
      ],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `Error fetching analytics stats: ${message}`,
        },
      ],
      isError: true,
    };
  }
}
