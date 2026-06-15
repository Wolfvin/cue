# @cue-vin/templates

Headless HTML template engine for cue SDK — generates mock UI for DemoScript steps as self-contained HTML strings. No React, no DOM dependency. Pure TypeScript returning string HTML.

## Why This Package Exists

The cue SDK's `generate()` function in `@cue-vin/core` creates DemoScript JSON from feature descriptions, but it doesn't produce the **visual UI** for each step. Workers building showcases (fintech, ecommerce, devops, mobile) had to write custom HTML/CSS from scratch every time.

`@cue-vin/templates` fills this gap by providing ready-made UI templates that accept data and return HTML strings. These strings can be:

- Injected into `innerHTML` directly
- Base64-encoded as data URIs for `DemoStep.screen`
- Embedded in standalone HTML demos

## Installation

```bash
pnpm add @cue-vin/templates
```

## Quick Start

```typescript
import { renderTemplate } from "@cue-vin/templates";

// Login form
const loginHtml = renderTemplate({
  type: "login",
  title: "Sign In",
  fields: ["email", "password"],
  theme: { accent: "#C91C1C" },
});

// Dashboard with metrics
const dashHtml = renderTemplate({
  type: "dashboard",
  title: "Dashboard",
  greeting: "Good morning, Andi",
  metrics: [
    { label: "Revenue", value: "$42,500", change: "+12.5%", positive: true, icon: "💰" },
    { label: "Users", value: "1,234", change: "+8.2%", positive: true, icon: "👥" },
  ],
  columns: 2,
});

// Insert into DOM
document.getElementById("demo-step")!.innerHTML = loginHtml;
```

## Templates

### 1. `login` — Login Form

A centered login card with brand, input fields, submit button, and footer links.

```typescript
const html = renderTemplate({
  type: "login",
  title: "Sign In",
  subtitle: "Welcome back!",
  brand: "MyApp",
  fields: [
    { name: "email", type: "email", placeholder: "you@example.com", required: true },
    { name: "password", type: "password", placeholder: "••••••••" },
  ],
  submitLabel: "Sign In",
  footerLinks: [
    { label: "Forgot password?", href: "#" },
    { label: "Create account", href: "#" },
  ],
  theme: { accent: "#2563EB", bg: "#0a0f1a" },
});
```

**Default fields**: email + password. **Default submit label**: "Sign In".

### 2. `dashboard` — Metrics Dashboard

A grid of metric cards with labels, values, change indicators, and icons.

```typescript
const html = renderTemplate({
  type: "dashboard",
  title: "Dashboard",
  greeting: "Good morning, Andi",
  columns: 3,
  metrics: [
    { label: "Revenue", value: "$42,500", change: "+12.5%", positive: true, icon: "💰" },
    { label: "Users", value: "1,234", change: "+8.2%", positive: true, icon: "👥" },
    { label: "Errors", value: "3", change: "-50%", positive: true, icon: "🐛" },
    { label: "Latency", value: "42ms", change: "+5ms", positive: false, icon: "⚡" },
    { label: "Deploys", value: "12", change: "+3", positive: true, icon: "🚀" },
    { label: "Uptime", value: "99.9%", change: "+0.1%", positive: true, icon: "✅" },
  ],
});
```

**Default**: 4 sample metrics in a 2-column grid.

### 3. `form` — Multi-Field Data Entry

A flexible form with labeled inputs, support for text/email/password/select/textarea fields.

```typescript
const html = renderTemplate({
  type: "form",
  title: "Create Account",
  description: "Fill in your details to get started.",
  fields: [
    { name: "fullname", label: "Full Name", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "role", label: "Role", type: "select", options: ["Developer", "Designer", "Manager"] },
    { name: "bio", label: "Bio", type: "textarea", placeholder: "Tell us about yourself..." },
  ],
  submitLabel: "Create Account",
  layout: "centered",
});
```

**Default**: 3 sample fields. **Layout options**: `"centered"` (card), `"full"` (full-bleed).

### 4. `table` — Data Table

A styled data table with headers, rows, row numbers, and status-colored cells.

```typescript
const html = renderTemplate({
  type: "table",
  title: "Orders",
  columns: [
    { header: "Order ID" },
    { header: "Customer" },
    { header: "Status" },
    { header: "Total" },
  ],
  rows: [
    { cells: ["#1001", "Alice Johnson", "Shipped", "$120.00"], status: "success" },
    { cells: ["#1002", "Bob Smith", "Processing", "$85.50"], status: "warning" },
    { cells: ["#1003", "Carol Davis", "Cancelled", "$0.00"], status: "error" },
  ],
  showRowNumbers: true,
});
```

**Default**: 4 sample columns/rows. **Status options**: `"success"` (green), `"warning"` (amber), `"error"` (red).

### 5. `terminal` — Terminal / Log Output

A terminal window with title bar (dots + cwd), color-coded lines, and blinking cursor.

```typescript
const html = renderTemplate({
  type: "terminal",
  title: "Terminal",
  cwd: "~/projects/my-app",
  prompt: "$ ",
  lines: [
    { text: "npm run build", type: "command" },
    { text: "Building project...", type: "output" },
    { text: "✔ Compiled successfully in 1.2s", type: "success" },
    { text: "✖ Error: module not found", type: "error" },
    { text: "// Check your imports", type: "comment" },
  ],
});
```

**Line types**: `"command"` (accent color + prompt), `"output"` (muted), `"success"` (green), `"error"` (red), `"warning"` (amber), `"comment"` (dim italic).

## Theme

All templates accept an optional `theme` override with these defaults:

| Property    | Default                                                               |
|-------------|-----------------------------------------------------------------------|
| `accent`    | `"#C91C1C"`                                                           |
| `bg`        | `"#0a0a0a"`                                                           |
| `bgCard`    | `"#111827"`                                                           |
| `bgInput`   | `"#1e293b"`                                                           |
| `border`    | `"#1e293b"`                                                           |
| `text`      | `"#f1f5f9"`                                                           |
| `textMuted` | `"#94a3b8"`                                                           |
| `textDim`   | `"#64748b"`                                                           |
| `font`      | `"'Inter','Segoe UI',system-ui,-apple-system,sans-serif"`            |
| `radius`    | `12`                                                                  |

## Advanced Usage

### Extract Styles Separately

```typescript
import { renderTemplateBody, renderTemplateCSS } from "@cue-vin/templates";

const body = renderTemplateBody({ type: "login" });
const css = renderTemplateCSS({ type: "login" });

// Inject styles into <head>, body into <body>
document.head.insertAdjacentHTML("beforeend", `<style>${css}</style>`);
document.getElementById("app")!.innerHTML = body;
```

### Use Individual Template Renderers

```typescript
import { renderLogin, loginCSS, resolveTheme } from "@cue-vin/templates";

const theme = resolveTheme({ accent: "#2563EB" });
const html = renderLogin({ type: "login", title: "Admin Login" }, theme);
const css = loginCSS(theme);
```

### Integrate with DemoScript

```typescript
import { generate } from "@cue-vin/core";
import { renderTemplate } from "@cue-vin/templates";

const script = generate({
  id: "my-saas-demo",
  title: "My SaaS Demo",
  features: [
    { name: "Login", description: "Secure sign-in" },
    { name: "Dashboard", description: "View your metrics" },
  ],
});

// Render mock UI for each step and set as screen content
script.steps[0].screen = `data:text/html;base64,${btoa(renderTemplate({ type: "login", title: "Sign In" }))}`;
script.steps[1].screen = `data:text/html;base64,${btoa(renderTemplate({ type: "dashboard", title: "Dashboard" }))}`;
```

## File Structure

```
packages/templates/
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── README.md
└── src/
    ├── index.ts           # Barrel export
    ├── types.ts           # TemplateConfig, TemplateField, TemplateLayout interfaces
    ├── theme.ts           # Theme defaults and resolveTheme() utility
    ├── render.ts          # renderTemplate() — main entry point
    └── templates/
        ├── login.ts       # Login form template
        ├── dashboard.ts   # Metrics dashboard template
        ├── form.ts        # Multi-field data entry form template
        ├── table.ts       # Data table with rows template
        └── terminal.ts    # Terminal/log output template
```

## License

MIT
