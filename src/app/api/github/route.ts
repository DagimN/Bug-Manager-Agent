import { NextRequest, NextResponse } from 'next/server';
import { createGitHubIssue } from '@/lib/github';
import { GitHubIssueRequest } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body: GitHubIssueRequest = await req.json();

    if (!body.title || !body.rootCause || !body.suggestedFix) {
      return NextResponse.json(
        { error: 'Missing required triage information for GitHub issue creation.' },
        { status: 400 }
      );
    }

    const result = await createGitHubIssue(body);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('GitHub API route error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process GitHub issue request.' },
      { status: 500 }
    );
  }
}
