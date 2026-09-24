# App Spec: Software Bug Triage & Maintenance Engineer Agent

## Overview

Build a full-stack web application titled **"AutoTriage AI"**—an intelligent Software Bug Triage & Maintenance Engineer agent. The application ingests application crash logs, runtime stack traces, and error payloads, analyzes them using the Gemini API to perform Root Cause Analysis (RCA) and generate code fixes, and executes proactive downstream actions including automated GitHub Issue creation and instant Discord/Slack webhook notifications.

---

## Tech Stack

- **Framework**: Next.js 14+ (App Router, TypeScript)
- **Styling & UI**: Tailwind CSS + shadcn/ui components (Badges, Cards, Buttons, Dialogs, Tables, Inputs)
- **AI Integration**: `@google/genai` SDK using `gemini-2.5-flash` with Structured Outputs (`responseSchema`)
- **Integrations**:
  - GitHub REST API (`@octokit/rest`) for automated issue creation & label tagging
  - Discord / Slack Webhooks for real-time team alerts
- **State & Storage**: Local React state / Server Actions (optional light persistence with Upstash Redis / Vercel KV if available)

---

## Key Features & Requirements

### 1. Ingestion & Analysis UI (Frontend)

- **Log Submission Form**: A high-speed text area input allowing developers to paste raw stack traces or error logs, select the source language/framework (e.g., Node.js, React, Python), and submit for instant triage.
- **Sample Presets**: Provide 3 quick "Load Sample Error" buttons (e.g., `React Null Pointer`, `Node.js Unhandled Rejection`, `DB Connection Pool Timeout`) so the demo can be tested immediately without hunting for logs.
- **Triage Result Dashboard**: Display the structured output in a clean, developer-friendly card layout:
  - **Summary**: Concise overview of the bug.
  - **Severity Badge**: Color-coded badge (`P0-Critical`, `P1-High`, `P2-Medium`, `P3-Low`).
  - **Root Cause Analysis (RCA)**: Plain-English explanation of why the crash happened.
  - **Suggested Patch / Diff**: Formatted code block showing the exact fix/refactored code.
  - **Recommended Tags**: Badges like `bug`, `backend`, `high-priority`.

### 2. Core Backend Logic & Gemini API Prompting

Create an API route or Server Action (`/api/triage`) that sends the error log to Gemini `gemini-2.5-flash`.

Use `responseSchema` to guarantee strict JSON output matching this structure:

```json
{
  "title": "Short descriptive issue title",
  "severity": "P0-Critical | P1-High | P2-Medium | P3-Low",
  "category": "Frontend | Backend | Database | Infrastructure",
  "rootCause": "Detailed explanation of the failure mechanism",
  "suggestedFix": "Code snippet or git diff showing how to resolve the issue",
  "tags": ["bug", "high-priority", "node.js"]
}
```
