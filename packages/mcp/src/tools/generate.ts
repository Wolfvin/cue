/**
 * Tool handler for cue_generate — generate a DemoScript JSON from a list of
 * features. Delegates to @cue/core's generate() function.
 */

import { z } from "zod";
import { generate } from "@cue/core";
import type { GenerateOptions } from "@cue/core";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

/** Zod schema for a single feature input. */
const FeatureSchema = z.object({
  name: z.string().describe(
    "Feature name, e.g. 'Upload File'. Also used to derive the step id via slugify."
  ),
  description: z.string().describe(
    "Short description — becomes the step caption."
  ),
  screenshotPath: z.string().optional().describe(
    "Optional path or URL to a screenshot image."
  ),
});

/** Zod schema for the cue_generate tool input. */
export const generateToolSchema = {
  id: z.string().describe("Unique identifier for the demo."),
  title: z.string().describe("Display title of the demo."),
  features: z.array(FeatureSchema).describe(
    "Ordered list of features — each becomes one DemoStep in the generated script."
  ),
  defaultDuration: z.number().optional().describe(
    "Default auto-advance duration per step in milliseconds. Default: 4000."
  ),
};

/**
 * Handle the cue_generate tool call.
 * Calls generate() from @cue/core and returns the DemoScript as a JSON string.
 */
export async function handleGenerate(
  args: Record<string, unknown>
): Promise<CallToolResult> {
  try {
    const options = args as unknown as GenerateOptions;

    // Basic validation before calling generate()
    if (!options.id || typeof options.id !== "string") {
      return {
        content: [{ type: "text", text: "Error: 'id' is required and must be a string." }],
        isError: true,
      };
    }
    if (!options.title || typeof options.title !== "string") {
      return {
        content: [{ type: "text", text: "Error: 'title' is required and must be a string." }],
        isError: true,
      };
    }
    if (!Array.isArray(options.features) || options.features.length === 0) {
      return {
        content: [{ type: "text", text: "Error: 'features' is required and must be a non-empty array." }],
        isError: true,
      };
    }

    const script = generate(options);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(script, null, 2),
        },
      ],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text", text: `Error generating DemoScript: ${message}` }],
      isError: true,
    };
  }
}
