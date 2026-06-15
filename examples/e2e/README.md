# @cue-vin/example-e2e

End-to-end example that demonstrates the full cue SDK workflow: from a plain feature description to a working, embeddable HTML demo — all in one script, no build step required.

## What it does

`run.ts` executes four steps in sequence:

1. **Generate** — Calls `generate()` from `@cue-vin/core` with a list of features for a fictional product called "TaskFlow". Each feature becomes one step in the demo, complete with optional hotspots and call-to-action overlays.

2. **Validate** — Calls `validateDemoScript()` to confirm the generated DemoScript conforms to the expected schema (required `id`, `title`, `steps` fields, correct types).

3. **Export** — Calls `exportToHtml()` from `@cue-vin/player` to produce a self-contained HTML file that embeds the DemoScript as JSON and loads the cue-player from a CDN.

4. **Print summary** — Logs the step count, validation result, and file size to the console.

## Output

Running the script produces `demo.html` in the same directory. Open it in any browser to see the TaskFlow product demo with auto-advancing steps and an email-capture CTA on the final slide.

## How to run

```bash
# From the repo root (first time only)
pnpm install
pnpm run build

# Run the e2e example
cd examples/e2e
pnpm start
```

Expected console output:

```
✓ Generated 4 steps, valid: true

Steps:
  create-task: "Click + to add a new task instantly" [4000ms]
  assign-team-member: "Drag to assign tasks to your team" [4000ms | 1 hotspot(s)]
  track-progress: "See real-time completion across your project" [4000ms]
  get-started: "Join 10,000+ teams using TaskFlow" [manual (CTA)]

✓ Exported to /path/to/examples/e2e/demo.html (1234 bytes)

Open demo.html in browser to see the demo!
```

## Reference: actions.json

The `actions.json` file in this directory shows an example of the structured action format used by `cue-record` (the browser-session recorder). It is **not** consumed by `run.ts` — it is included purely as reference material for agents that want to understand the recorder's output schema.
