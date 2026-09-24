export type SeverityLevel = 'P0-Critical' | 'P1-High' | 'P2-Medium' | 'P3-Low';
export type IssueCategory = 'Frontend' | 'Backend' | 'Database' | 'Infrastructure' | 'Security' | 'DevOps';

export interface TriageResult {
  id: string;
  timestamp: string;
  title: string;
  severity: SeverityLevel;
  category: IssueCategory;
  rootCause: string;
  suggestedFix: string;
  tags: string[];
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
  platform: 'discord' | 'slack';
  webhookUrl: string;
  triageResult: TriageResult;
}

export interface AppSettings {
  geminiApiKey: string;
  githubToken: string;
  githubOwner: string;
  githubRepo: string;
  discordWebhookUrl: string;
  slackWebhookUrl: string;
  defaultPlatform: 'discord' | 'slack';
}

export interface SamplePreset {
  id: string;
  name: string;
  language: string;
  environment: string;
  log: string;
  description: string;
}
