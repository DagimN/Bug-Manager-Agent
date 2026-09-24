import { NextRequest, NextResponse } from 'next/server';
import { analyzeErrorWithGemini } from '@/lib/gemini';
import { checkAndRecordLog, updateLogGitHubUrl, getDeduplicationStats } from '@/lib/dedup';
import { createGitHubIssue } from '@/lib/github';
import { sendWebhookNotification } from '@/lib/webhook';
import { TriageResult, DEFAULT_GEMINI_MODEL } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      errorLog,
      language,
      environment,
      serviceName,
      model,
      autoCreateGitHubIssue = false,
      autoNotifyWebhook = false,
      platform = 'discord',
      customApiKey,
      githubToken,
      githubOwner,
      githubRepo,
      webhookUrl,
    } = body;

    if (!errorLog || typeof errorLog !== 'string' || errorLog.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid payload. "errorLog" string is required.' },
        { status: 400 }
      );
    }

    const triageId = `ingest-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    // 1. Check for Duplicate Log Fingerprint
    const dedupCheck = checkAndRecordLog(errorLog, triageId);

    if (dedupCheck.isDuplicate) {
      return NextResponse.json(
        {
          status: 'duplicate_skipped',
          isDuplicate: true,
          fingerprint: dedupCheck.fingerprint,
          occurrences: dedupCheck.count,
          message: `Duplicate crash log detected (${dedupCheck.count} occurrences). Skipping GitHub issue creation and Webhook dispatch to prevent notification spam.`,
          existingTriageId: dedupCheck.existingEntry?.triageId,
          existingGitHubIssueUrl: dedupCheck.existingEntry?.githubIssueUrl,
        },
        { status: 200 }
      );
    }

    // 2. Perform Gemini AI Root Cause Analysis
    const selectedModel = model || DEFAULT_GEMINI_MODEL;
    const triageData = await analyzeErrorWithGemini(
      errorLog,
      language,
      environment,
      customApiKey,
      selectedModel
    );

    const triageResult: TriageResult = {
      id: triageId,
      timestamp: new Date().toISOString(),
      originalLog: errorLog,
      language: language || serviceName || 'Auto-Detect',
      environment: environment || 'Production',
      ...triageData,
    };

    let githubIssueResult = null;
    let webhookResult = null;

    // 3. Automated Downstream GitHub Issue Creation if requested
    const targetGithubToken = githubToken || process.env.GITHUB_TOKEN;
    const targetOwner = githubOwner || process.env.GITHUB_OWNER;
    const targetRepo = githubRepo || process.env.GITHUB_REPO;

    if (autoCreateGitHubIssue) {
      githubIssueResult = await createGitHubIssue({
        title: triageResult.title,
        severity: triageResult.severity,
        category: triageResult.category,
        rootCause: triageResult.rootCause,
        suggestedFix: triageResult.suggestedFix,
        tags: triageResult.tags,
        repoOwner: targetOwner || 'acme-corp',
        repoName: targetRepo || 'main-app',
        githubToken: targetGithubToken || '',
      });

      if (githubIssueResult.issueUrl) {
        triageResult.githubIssueUrl = githubIssueResult.issueUrl;
        updateLogGitHubUrl(dedupCheck.fingerprint, githubIssueResult.issueUrl);
      }
    }

    // 4. Automated Downstream Webhook Dispatch if requested
    const targetWebhookUrl =
      webhookUrl || (platform === 'slack' ? process.env.SLACK_WEBHOOK_URL : process.env.DISCORD_WEBHOOK_URL);

    if (autoNotifyWebhook) {
      webhookResult = await sendWebhookNotification({
        platform: platform === 'slack' ? 'slack' : 'discord',
        webhookUrl: targetWebhookUrl || '',
        triageResult,
      });

      triageResult.webhookSent = webhookResult.success;
    }

    return NextResponse.json(
      {
        status: 'success',
        isDuplicate: false,
        fingerprint: dedupCheck.fingerprint,
        triageResult,
        githubIssue: githubIssueResult,
        webhookNotification: webhookResult,
        dedupStats: getDeduplicationStats(),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Programmatic Log Ingestion Endpoint Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process external log ingestion.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'AutoTriage AI Programmatic Log Ingest API',
    status: 'active',
    dedupStats: getDeduplicationStats(),
    endpoints: {
      ingest: 'POST /api/ingest',
    },
  });
}
