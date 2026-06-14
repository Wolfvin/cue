/**
 * Tool handler for cue_validate — validate a DemoScript JSON object.
 * Delegates to @cue-vin/core's validateDemoScript() function.
 */

import { z } from "zod";
import { validateDemoScript } from "@cue-vin/core";
import type { DemoScript } from "@cue-vin/core";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

/** Zod schema for the cue_validate tool input. */
export const validateToolSchema = {
  script: z.record(z.unknown()).describe(
    "A DemoScript JSON object to validate. The tool will check that it conforms to the DemoScript interface (required fields: id, title, steps)."
  ),
};

/**
 * Validate a DemoScript and collect detailed error messages for each issue found.
 * Returns both the valid flag and a list of human-readable error strings.
 */
function collectValidationErrors(script: unknown): string[] {
  const errors: string[] = [];

  if (typeof script !== "object" || script === null) {
    errors.push("Script must be a non-null object.");
    return errors;
  }

  const obj = script as Record<string, unknown>;

  // Required string fields
  if (typeof obj.id !== "string" || obj.id.trim() === "") {
    errors.push("'id' is required and must be a non-empty string.");
  }
  if (typeof obj.title !== "string" || obj.title.trim() === "") {
    errors.push("'title' is required and must be a non-empty string.");
  }

  // steps array
  if (!Array.isArray(obj.steps)) {
    errors.push("'steps' is required and must be an array.");
  } else if (obj.steps.length === 0) {
    errors.push("'steps' must contain at least one step.");
  } else {
    obj.steps.forEach((step, i) => {
      if (typeof step !== "object" || step === null) {
        errors.push(`Step at index ${i} must be a non-null object.`);
      } else {
        const s = step as Record<string, unknown>;
        if (typeof s.id !== "string" || s.id.trim() === "") {
          errors.push(`Step at index ${i} must have a non-empty string 'id'.`);
        }
      }
    });
  }

  // Optional fields
  if (obj.loop !== undefined && typeof obj.loop !== "boolean") {
    errors.push("'loop' must be a boolean if provided.");
  }
  if (obj.theme !== undefined) {
    if (typeof obj.theme !== "object" || obj.theme === null) {
      errors.push("'theme' must be an object if provided.");
    } else {
      const theme = obj.theme as Record<string, unknown>;
      if (theme.accent !== undefined && typeof theme.accent !== "string") {
        errors.push("'theme.accent' must be a string if provided.");
      }
      if (theme.bg !== undefined && typeof theme.bg !== "string") {
        errors.push("'theme.bg' must be a string if provided.");
      }
      if (theme.font !== undefined && typeof theme.font !== "string") {
        errors.push("'theme.font' must be a string if provided.");
      }
    }
  }

  return errors;
}

/**
 * Handle the cue_validate tool call.
 * Validates the provided DemoScript and returns { valid, errors }.
 */
export async function handleValidate(
  args: Record<string, unknown>
): Promise<CallToolResult> {
  try {
    const { script } = args as { script: unknown };

    if (!script || typeof script !== "object") {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ valid: false, errors: ["'script' is required and must be an object."] }),
          },
        ],
      };
    }

    const valid = validateDemoScript(script as DemoScript);
    const errors = valid ? [] : collectValidationErrors(script);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ valid, errors }, null, 2),
        },
      ],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text", text: `Error validating DemoScript: ${message}` }],
      isError: true,
    };
  }
}
