import { NextResponse } from 'next/server';
import { EnvSettingsResponse } from '@/types';

export async function GET() {
  try {
    const geminiApiKey = process.env.GEMINI_API_KEY || '';
    const githubToken = process.env.GITHUB_TOKEN || '';
    const githubOwner = process.env.GITHUB_OWNER || '';
    const githubRepo = process.env.GITHUB_REPO || '';
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL || '';
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL || '';

    const hasEnvFile = Boolean(
      geminiApiKey || githubToken || githubOwner || githubRepo || discordWebhookUrl || slackWebhookUrl
    );

    const envData: EnvSettingsResponse = {
      geminiApiKey,
      githubToken,
      githubOwner,
      githubRepo,
      discordWebhookUrl,
      slackWebhookUrl,
      hasEnvFile,
    };

    return NextResponse.json(envData);
  } catch (error: any) {
    console.error('Error fetching environment settings:', error);
    return NextResponse.json(
      { error: 'Failed to inspect environment configuration' },
      { status: 500 }
    );
  }
}
