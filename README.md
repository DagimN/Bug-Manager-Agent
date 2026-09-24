# AutoTriage AI 🤖⚡

> **Software Bug Triage & Maintenance Engineer Agent**  
> An intelligent full-stack autonomous agent built with Next.js 15, TypeScript, Tailwind CSS, and Google Gemini AI. AutoTriage AI ingests crash logs, stack traces, and error payloads, performs Root Cause Analysis (RCA), generates code fixes, and executes downstream GitHub issue creation and Discord/Slack webhook notifications.

> [!IMPORTANT]
> 📋 **For Reviewers & Evaluators**: Read the complete **[Solution Design & Functional Specification (SRS)](./SOLUTION_DESIGN_SPECIFICATION.md)** document outlining agent role selection rationale, system architecture, third-party integrations, and automation mechanisms.

---

## 🌟 Key Features & Capabilities

### 1. ⚡ Log Ingestion & Demo Presets
- **High-Speed Log Input**: Paste raw stack traces or error payloads with source framework and target environment selection (`Production`, `Staging`, `Development`).
- **Instant Sample Presets**: Pre-loaded with 5 common crash scenarios for instant testing:
  - `React Null Pointer` (Uncaught TypeError during render)
  - `Node.js Unhandled Rejection` (PostgreSQL connection ETIMEDOUT)
  - `DB Connection Pool Timeout` (Knex pool exhaustion)
  - `Python Asyncio Deadlock` (FastAPI worker process timeout)
  - `Go Nil Pointer Dereference` (Runtime panic in payment gateway)

### 2. 🧠 Gemini AI Triage Engine & Structured Outputs
- Powered by the `@google/genai` SDK querying Gemini models with strict JSON `responseSchema` validation.
- **Color-Coded Severity Badges**:
  - `P0-Critical` (Red / Rose)
  - `P1-High` (Orange / Amber)
  - `P2-Medium` (Yellow / Blue)
  - `P3-Low` (Slate / Gray)
- **Categorization**: Automatic labeling into `Frontend`, `Backend`, `Database`, or `Infrastructure`.
- **Root Cause Analysis (RCA)**: Plain-English explanation of why the crash occurred.
- **Suggested Patch / Git Diff**: Formatted syntax-highlighted code block with line numbers, diff indicators (`+` and `-`), and copy functionality.

### 3. 🔄 Dynamic Multi-Model Switching & Traffic Failover
- Switch between multiple Gemini AI models directly from the top navigation bar or settings modal to handle API traffic spikes and model downtimes:
  - `gemini-2.5-flash` (Default / Ultra-fast)
  - `gemini-2.5-pro` (High Precision Reasoning)
  - `gemini-2.0-flash` (Traffic Failover)
  - `gemini-1.5-flash` (Legacy Fallback)
  - `gemini-1.5-pro` (Extended Context)

### 4. 🛡️ SHA-256 Crash Deduplication & Programmatic Ingestion API
- **Programmatic Endpoint (`POST /api/ingest`)**: Allows external backend services (Node.js, Express, Python/FastAPI, Go/Gin, Sentry, Datadog) to stream crash logs programmatically.
- **Fingerprinting Engine**: Normalizes stack trace text (stripping dynamic timestamps, memory addresses `0x...`, process PIDs, and IP addresses) to generate a 16-character SHA-256 fingerprint.
- **Notification Spam Prevention**: If an incoming error is a duplicate within the TTL window, GitHub issue creation and Webhook alerts are **skipped automatically** to prevent spamming team channels while returning the existing RCA report.

### 5. 🔔 Proactive Downstream Integrations
- **Automated GitHub Issue Creation**: Uses `@octokit/rest` to create structured markdown GitHub issues with severity tags and code patches.
- **Discord & Slack Webhooks**: Dispatches rich Discord embeds or Slack markdown block attachments to team channels.
- **Export & Copy**: Copy full Markdown reports to clipboard or export JSON payload files with a single click.

### 6. 🔒 Environment Variable Visibility & Universal Toasts
- **Settings Modal (`/api/settings/env`)**: Automatically detects loaded server environment variables (`.env`, `.env.local`, `.env.prod`) and displays status badges.
- **Toast Notification Stack**: Provides interactive visual feedback for every user action and API response.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15.1 (App Router, TypeScript)
- **Styling**: Tailwind CSS v4 + Lucide React Icons
- **AI Integration**: `@google/genai` SDK (`gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-2.0-flash`, etc.)
- **GitHub Integration**: `@octokit/rest` (GitHub REST API v3)
- **Notifications**: Discord & Slack Incoming Webhooks
- **State & Storage**: Local Storage Client Persistence + In-Memory SHA-256 Fingerprint Cache

---

## 📁 Repository Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── triage/route.ts        # Manual log triage endpoint (Gemini API)
│   │   │   ├── ingest/route.ts        # Programmatic log ingestion & deduplication API
│   │   │   ├── github/route.ts        # GitHub issue creation endpoint
│   │   │   ├── webhook/route.ts       # Discord & Slack alert dispatch endpoint
│   │   │   └── settings/env/route.ts  # Server environment inspector endpoint
│   │   ├── globals.css                # Tailwind v4 styles & dark theme rules
│   │   ├── layout.tsx                 # Root layout container
│   │   └── page.tsx                   # Main dashboard landing page
│   ├── components/
│   │   ├── Header.tsx                 # Top bar with dynamic model selector
│   │   ├── LogForm.tsx                # Log input form with sample error presets
│   │   ├── TriageCard.tsx             # Triage result dashboard & action bar
│   │   ├── CodeBlock.tsx              # Syntax-highlighted git diff view
│   │   ├── GitHubModal.tsx            # Automated GitHub issue dispatch modal
│   │   ├── WebhookModal.tsx           # Discord/Slack webhook alert modal
│   │   ├── SettingsModal.tsx          # API keys & environment settings modal
│   │   ├── IntegrationModal.tsx       # External backend code snippets & dedup stats modal
│   │   ├── HistorySidebar.tsx         # Stored session history drawer with search
│   │   ├── Toast.tsx                  # Toast notification stack container
│   │   └── SamplePresets.ts           # Pre-loaded sample crash stack traces
│   ├── lib/
│   │   ├── gemini.ts                  # Gemini SDK integration & fallback engine
│   │   ├── dedup.ts                   # SHA-256 crash fingerprinting & deduplication logic
│   │   ├── github.ts                  # Octokit REST helper & issue formatter
│   │   ├── webhook.ts                 # Discord/Slack webhook payload formatters
│   │   └── storage.ts                 # LocalStorage persistence utility
│   └── types/
│       └── index.ts                   # TypeScript interfaces & model definitions
├── .env.example                       # Sample environment configuration template
├── .env.local                         # Local environment configuration
├── next.config.ts                     # Next.js configuration
├── package.json                       # Project dependencies
└── prompt.md                          # Initial application specification prompt
```

---

## 🔌 API Reference

### 1. Programmatic Log Ingestion & Deduplication
```http
POST /api/ingest
Content-Type: application/json
```
**Request Body**:
```json
{
  "errorLog": "TypeError: Cannot read properties of undefined at UserList.jsx:42",
  "language": "React / Node.js",
  "environment": "Production",
  "serviceName": "auth-service",
  "model": "gemini-2.5-flash",
  "autoCreateGitHubIssue": true,
  "autoNotifyWebhook": true,
  "platform": "discord"
}
```

**Response (Unique Log)**:
```json
{
  "status": "success",
  "isDuplicate": false,
  "fingerprint": "9d489114a02f34ee",
  "triageResult": {
    "title": "Uncaught TypeError: Accessing properties of undefined state object",
    "severity": "P1-High",
    "category": "Frontend",
    "rootCause": "The component attempted to access or iterate (.map()) over a property ('data') on an undefined state object during render...",
    "suggestedFix": "// Safe guard with Optional Chaining\nexport function UserList...",
    "tags": ["bug", "react", "null-pointer"]
  }
}
```

**Response (Duplicate Log Skipped)**:
```json
{
  "status": "duplicate_skipped",
  "isDuplicate": true,
  "fingerprint": "9d489114a02f34ee",
  "occurrences": 3,
  "message": "Duplicate crash log detected (3 occurrences). Skipping GitHub issue creation and Webhook dispatch to prevent notification spam."
}
```

---

## 💻 Backend Service Integration Examples

### Node.js / Express Middleware
```javascript
app.use(async (err, req, res, next) => {
  try {
    await fetch("http://localhost:3000/api/ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        errorLog: err.stack || err.message,
        language: "Node.js / Express",
        environment: process.env.NODE_ENV || "Production",
        serviceName: "payment-api",
        autoCreateGitHubIssue: true,
        autoNotifyWebhook: true
      })
    });
  } catch (e) {
    console.error("AutoTriage log streaming error:", e);
  }
  res.status(500).json({ error: "Internal Server Error" });
});
```

---

## 🚀 Quickstart & Setup Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Installation
```bash
# 1. Clone repository
git clone https://github.com/DagimN/Bug-Manager-Agent.git
cd Bug-Manager-Agent

# 2. Install dependencies
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory (or copy from `.env.example`):
```env
GEMINI_API_KEY=your_gemini_api_key_here
GITHUB_OWNER=your_github_username_or_org
GITHUB_REPO=your_target_repo_name
GITHUB_TOKEN=ghp_your_github_personal_access_token
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

### 4. Running Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Building for Production
```bash
npm run build
npm start
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
