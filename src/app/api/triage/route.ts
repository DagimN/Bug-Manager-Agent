import { NextRequest, NextResponse } from 'next/server';
import { analyzeErrorWithGemini } from '@/lib/gemini';
import { TriageResult, DEFAULT_GEMINI_MODEL } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { errorLog, language, environment, model, customApiKey } = body;

    if (!errorLog || typeof errorLog !== 'string' || errorLog.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please provide a valid raw stack trace or crash log.' },
        { status: 400 }
      );
    }

    const selectedModel = model || DEFAULT_GEMINI_MODEL;

    const triageData = await analyzeErrorWithGemini(
      errorLog,
      language,
      environment,
      customApiKey,
      selectedModel
    );

    const result: TriageResult = {
      id: `triage-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      originalLog: errorLog,
      language: language || 'Auto-Detect',
      environment: environment || 'Production',
      ...triageData,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Triage API endpoint error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred during triage analysis.' },
      { status: 500 }
    );
  }
}
