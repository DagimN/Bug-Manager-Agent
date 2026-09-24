import { AppSettings, TriageResult, DEFAULT_GEMINI_MODEL } from '@/types';

const SETTINGS_KEY = 'autotriage_settings_v1';
const HISTORY_KEY = 'autotriage_history_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  geminiApiKey: '',
  selectedModel: DEFAULT_GEMINI_MODEL,
  githubToken: '',
  githubOwner: 'octocat',
  githubRepo: 'hello-world',
  discordWebhookUrl: '',
  slackWebhookUrl: '',
  defaultPlatform: 'discord',
};

export function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch (e) {
    console.error('Error loading settings:', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings:', e);
  }
}

export function loadHistory(): TriageResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error loading history:', e);
    return [];
  }
}

export function saveHistoryItem(item: TriageResult): TriageResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const history = loadHistory();
    // Prepend new item and limit history to 50 items
    const updated = [item, ...history.filter((h) => h.id !== item.id)].slice(0, 50);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error saving history item:', e);
    return [];
  }
}

export function deleteHistoryItem(id: string): TriageResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const history = loadHistory();
    const updated = history.filter((h) => h.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error deleting history item:', e);
    return [];
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (e) {
    console.error('Error clearing history:', e);
  }
}
