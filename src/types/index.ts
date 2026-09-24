export type SeverityLevel = "P0-Critical" | "P1-High" | "P2-Medium" | "P3-Low";
export type IssueCategory =
  | "Frontend"
  | "Backend"
  | "Database"
  | "Infrastructure"
  | "Security"
  | "DevOps";

export interface GeminiModelInfo {
  id: string;
  name: string;
  description: string;
  badge?: string;
}

export const AVAILABLE_MODELS: GeminiModelInfo[] = [
  {
    id: "gemini-3.8-flash",
    name: "Gemini 3.8 Flash",
    description:
      "Ultra-fast structured outputs for crash log triage (Recommended)",
    badge: "Fastest",
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    description:
      "Ultra-fast structured outputs for crash log triage (Recommended)",
    badge: "Fastest",
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    description: "Deep reasoning for intricate multi-stack architectural bugs",
    badge: "High Precision",
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    description: "High concurrency fallback during traffic spikes",
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    description: "Reliable legacy model for standard error triage",
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    description: "Legacy high-capacity model for extended context stack traces",
  },
];

export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

export interface TriageResult {
  id: string;
  timestamp: string;
  title: string;
  severity: SeverityLevel;
  category: IssueCategory;
  rootCause: string;
  suggestedFix: string;
  tags: string[];
  modelUsed?: string;
  originalLog?: string;
  language?: string;
  environment?: string;
  githubIssueUrl?: string;
  webhookSent?: boolean;
}

export interface TriageRequest {
  errorLog: string;
  language?: string;
  environment?: string;
  model?: string;
  customApiKey?: string;
}

export interface GitHubIssueRequest {
  title: string;
  severity: SeverityLevel;
  category: IssueCategory;
  rootCause: string;
  suggestedFix: string;
  tags: string[];
  repoOwner: string;
  repoName: string;
  githubToken: string;
}

export interface WebhookNotifyRequest {
  platform: "discord" | "slack";
  webhookUrl: string;
  triageResult: TriageResult;
}

export interface AppSettings {
  geminiApiKey: string;
  selectedModel: string;
  githubToken: string;
  githubOwner: string;
  githubRepo: string;
  discordWebhookUrl: string;
  slackWebhookUrl: string;
  defaultPlatform: "discord" | "slack";
}

export interface EnvSettingsResponse {
  geminiApiKey: string;
  githubToken: string;
  githubOwner: string;
  githubRepo: string;
  discordWebhookUrl: string;
  slackWebhookUrl: string;
  hasEnvFile: boolean;
}

export interface SamplePreset {
  id: string;
  name: string;
  language: string;
  environment: string;
  log: string;
  description: string;
}

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}
