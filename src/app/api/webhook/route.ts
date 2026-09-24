import { NextRequest, NextResponse } from 'next/server';
import { sendWebhookNotification } from '@/lib/webhook';
import { WebhookNotifyRequest } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body: WebhookNotifyRequest = await req.json();

    if (!body.triageResult) {
      return NextResponse.json(
        { error: 'Missing triage result payload for webhook notification.' },
        { status: 400 }
      );
    }

    const result = await sendWebhookNotification(body);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Webhook API route error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to dispatch webhook notification.' },
      { status: 500 }
    );
  }
}
