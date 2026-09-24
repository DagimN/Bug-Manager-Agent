import { createHash } from 'crypto';

interface CachedLogEntry {
  fingerprint: string;
  firstSeen: number;
  lastSeen: number;
  count: number;
  triageId: string;
  githubIssueUrl?: string;
}

// In-memory deduplication cache (key: fingerprint)
const deduplicationCache = new Map<string, CachedLogEntry>();

// Default deduplication window: 1 hour (3600000 ms)
const DEFAULT_DEDUP_TTL_MS = 60 * 60 * 1000;

/**
 * Normalizes an error log by stripping dynamic timestamps, IP addresses, memory addresses, and file paths.
 */
export function generateLogFingerprint(log: string): string {
  if (!log) return '';

  const normalized = log
    // Strip ISO timestamps (e.g. 2026-09-24T13:12:04.891Z)
    .replace(/\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?/gi, '[TIMESTAMP]')
    // Strip hex memory addresses (e.g. 0x7f48b9, 0xc00018e000)
    .replace(/0x[a-f0-9]+/gi, '[MEM_ADDR]')
    // Strip IP addresses and ports (e.g. 10.0.4.12:5432)
    .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?\b/g, '[IP_ADDR]')
    // Strip process PIDs (e.g. pid:18492, node:24819)
    .replace(/\b(pid|node):\d+\b/gi, '$1:[PID]')
    // Normalize whitespace and collapse lines
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  return createHash('sha256').update(normalized).digest('hex').substring(0, 16);
}

export interface CheckDuplicateResult {
  isDuplicate: boolean;
  fingerprint: string;
  count: number;
  existingEntry?: CachedLogEntry;
}

/**
 * Checks whether an incoming log fingerprint has already been processed within the TTL window.
 */
export function checkAndRecordLog(
  log: string,
  triageId: string,
  ttlMs: number = DEFAULT_DEDUP_TTL_MS
): CheckDuplicateResult {
  const fingerprint = generateLogFingerprint(log);
  const now = Date.now();

  const existing = deduplicationCache.get(fingerprint);

  if (existing && now - existing.lastSeen < ttlMs) {
    // Duplicate detected!
    existing.count += 1;
    existing.lastSeen = now;
    return {
      isDuplicate: true,
      fingerprint,
      count: existing.count,
      existingEntry: existing,
    };
  }

  // New log entry
  const newEntry: CachedLogEntry = {
    fingerprint,
    firstSeen: now,
    lastSeen: now,
    count: 1,
    triageId,
  };
  deduplicationCache.set(fingerprint, newEntry);

  return {
    isDuplicate: false,
    fingerprint,
    count: 1,
    existingEntry: newEntry,
  };
}

export function updateLogGitHubUrl(fingerprint: string, issueUrl: string) {
  const entry = deduplicationCache.get(fingerprint);
  if (entry) {
    entry.githubIssueUrl = issueUrl;
  }
}

export function getDeduplicationStats() {
  const entries = Array.from(deduplicationCache.values());
  const totalLogs = entries.reduce((acc, curr) => acc + curr.count, 0);
  const uniqueCount = entries.length;
  const duplicateCount = totalLogs - uniqueCount;

  return {
    totalLogsIngested: totalLogs,
    uniqueLogs: uniqueCount,
    duplicatesSkipped: duplicateCount,
  };
}
