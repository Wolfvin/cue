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
 * Handle the cue_get_stats tool call.
 * Fetches {endpoint}/stats/{demoId} and returns the stats object.
 */
export async function handleGetStats(
  args: Record<string, unknown>
): Promise<CallToolResult> {
  try {
    const { demoId, endpoint = "http://localhost:3001" } = args as {
      demoId: string;
      endpoint?: string;
    };

    if (!demoId || typeof demoId !== "string") {
      return {
        content: [{ type: "text", text: "Error: 'demoId' is required and must be a string." }],
        isError: true,
      };
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
