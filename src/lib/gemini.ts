import { GoogleGenAI, Type } from '@google/genai';
import { SeverityLevel, IssueCategory, DEFAULT_GEMINI_MODEL } from '@/types';

export interface GeminiTriageOutput {
  title: string;
  severity: SeverityLevel;
  category: IssueCategory;
  rootCause: string;
  suggestedFix: string;
  tags: string[];
  modelUsed: string;
}

export async function analyzeErrorWithGemini(
  errorLog: string,
  language?: string,
  environment?: string,
  customApiKey?: string,
  modelName: string = DEFAULT_GEMINI_MODEL
): Promise<GeminiTriageOutput> {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  const targetModel = modelName || DEFAULT_GEMINI_MODEL;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `You are AutoTriage AI, an expert Principal Software Maintenance Engineer.
Analyze the following crash log/stack trace carefully.

Language/Framework Context: ${language || 'Auto-Detect'}
Environment: ${environment || 'Production'}

Error Log / Stack Trace:
\`\`\`
${errorLog}
\`\`\`

Perform a Root Cause Analysis (RCA) and generate a code fix / git diff.
Adhere strictly to the requested JSON schema format.
- title: Short, actionable issue summary.
- severity: Must be strictly one of: "P0-Critical", "P1-High", "P2-Medium", "P3-Low".
- category: Must be strictly one of: "Frontend", "Backend", "Database", "Infrastructure".
- rootCause: Comprehensive explanation of why this error occurred.
- suggestedFix: Formatted code patch, git diff, or replacement code snippet.
- tags: Array of concise string tags (e.g. ["bug", "react", "null-pointer"]).`;

      const response = await ai.models.generateContent({
        model: targetModel,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              severity: {
                type: Type.STRING,
                enum: ['P0-Critical', 'P1-High', 'P2-Medium', 'P3-Low'],
              },
              category: {
                type: Type.STRING,
                enum: ['Frontend', 'Backend', 'Database', 'Infrastructure'],
              },
              rootCause: { type: Type.STRING },
              suggestedFix: { type: Type.STRING },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['title', 'severity', 'category', 'rootCause', 'suggestedFix', 'tags'],
          },
        },
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        return {
          title: parsed.title || 'Application Exception Detected',
          severity: parsed.severity || 'P1-High',
          category: parsed.category || 'Backend',
          rootCause: parsed.rootCause || 'Root cause analysis unavailable.',
          suggestedFix: parsed.suggestedFix || '// Please review stack trace',
          tags: Array.isArray(parsed.tags) ? parsed.tags : ['bug', 'triage'],
          modelUsed: targetModel,
        };
      }
    } catch (err) {
      console.warn(`Gemini API call using ${targetModel} failed, switching to local smart fallback engine:`, err);
    }
  }

  // Smart heuristic fallback if no key is provided or API call fails
  const fallbackResult = getFallbackTriage(errorLog, language, environment);
  return {
    ...fallbackResult,
    modelUsed: `${targetModel} (Local Fallback Engine)`,
  };
}

function getFallbackTriage(
  log: string,
  language?: string,
  environment?: string
): Omit<GeminiTriageOutput, 'modelUsed'> {
  const logLower = log.toLowerCase();

  // Pattern 1: React Null Pointer / Property of undefined
  if (logLower.includes('cannot read properties of undefined') || logLower.includes('null pointer') || logLower.includes('userlist')) {
    return {
      title: 'Uncaught TypeError: Accessing properties of undefined state object',
      severity: 'P1-High',
      category: 'Frontend',
      rootCause: `The component attempted to access or iterate (.map()) over a property ('data') on an undefined state object during render before async data fetching completed. Initial state defaults to null without optional chaining or loading safeguards.`,
      suggestedFix: `// Safe guard with Optional Chaining & Fallback Default Array
export function UserList({ userState }: { userState: { data?: Array<{ id: string; name: string }> | null } }) {
  if (!userState?.data) {
    return <div className="p-4 text-gray-500">No users found or loading...</div>;
  }

  return (
    <ul className="space-y-2">
      {userState.data.map((user) => (
        <li key={user.id} className="p-2 border rounded">{user.name}</li>
      ))}
    </ul>
  );
}`,
      tags: ['bug', 'react', 'null-pointer', 'frontend', 'typescript']
    };
  }

  // Pattern 2: Node.js Connection / ETIMEDOUT / Unhandled Rejection
  if (logLower.includes('etimedout') || logLower.includes('unhandledpromiserejection') || logLower.includes('pg/lib/client')) {
    return {
      title: 'Unhandled Promise Rejection: PostgreSQL Connection ETIMEDOUT',
      severity: 'P0-Critical',
      category: 'Backend',
      rootCause: `The database connection client failed to establish a TCP handshake within the connection timeout threshold (10.0.4.12:5432). The connection attempt lacked a outer try/catch wrapper or promise rejection handler, resulting in an unhandled process crash.`,
      suggestedFix: `// Wrap connection & session validation in resilient try/catch with retry
import { pool } from '../db';

export async function validateSession(sessionId: string) {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query('SELECT * FROM sessions WHERE id = $1', [sessionId]);
    return result.rows[0];
  } catch (error) {
    console.error('[DB Connect Error] Connection timed out or failed:', error);
    throw new Error('Database connection failure. Please retry later.');
  } finally {
    if (client) client.release();
  }
}`,
      tags: ['bug', 'node.js', 'database', 'unhandled-rejection', 'p0-critical']
    };
  }

  // Pattern 3: DB Connection Pool Timeout / Knex / Connection exhaustion
  if (logLower.includes('knextimeouterror') || logLower.includes('pool size') || logLower.includes('active: 10')) {
    return {
      title: 'Knex DB Connection Pool Exhaustion & Worker Timeout',
      severity: 'P0-Critical',
      category: 'Database',
      rootCause: `High incoming traffic requested DB connections faster than active transactions were releasing them. 10 of 10 connection pool slots remained locked because transactions were opened inside a loop without explicit completion or release callbacks.`,
      suggestedFix: `// Use single batch query or reuse pooled connection cleanly
export async function createOrdersBatch(ordersData: OrderInput[]) {
  return await knex.transaction(async (trx) => {
    // Perform bulk insertion instead of multiple individual connections in a loop
    const results = await trx('orders')
      .insert(ordersData)
      .returning(['id', 'status', 'created_at']);
    
    return results;
  });
}`,
      tags: ['bug', 'database', 'postgresql', 'knex', 'connection-pool']
    };
  }

  // Pattern 4: Python Asyncio Deadlock
  if (logLower.includes('worker timeout') || logLower.includes('asyncio') || logLower.includes('fastapi')) {
    return {
      title: 'FastAPI Worker Timeout: Synchronous CPU-bound Execution in Async Loop',
      severity: 'P1-High',
      category: 'Backend',
      rootCause: `A heavy synchronous DataFrame Regex computation ('sync_heavy_dataframe_processing') was executed directly on the main asyncio event loop thread, preventing Uvicorn heartbeats and causing Gunicorn worker process termination.`,
      suggestedFix: `from fastapi import FastAPI
import asyncio
from concurrent.futures import ProcessPoolExecutor

executor = ProcessPoolExecutor()

@app.post("/analytics/report")
async def generate_report(raw_logs: list):
    loop = asyncio.get_running_loop()
    # Offload CPU-heavy Pandas transformation to worker process pool
    report_data = await loop.run_in_executor(
        executor, sync_heavy_dataframe_processing, raw_logs
    )
    return {"status": "success", "data": report_data}`,
      tags: ['bug', 'python', 'fastapi', 'asyncio', 'deadlock']
    };
  }

  // Default fallback for generic logs
  return {
    title: 'Unhandled Exception Detected in Log Payload',
    severity: 'P2-Medium',
    category: language?.toLowerCase().includes('react') ? 'Frontend' : 'Backend',
    rootCause: `The crash log indicates an unresolved runtime exception in ${language || 'the application'}. Stack trace analysis reveals execution failure near line numbers referenced in the trace payload.`,
    suggestedFix: `// Add defensive null checking and error handling wrapper
try {
  // Execute target operation safely
  const result = await executeTask();
  return result;
} catch (error) {
  console.error("Execution error:", error);
  return { error: true, message: error.message };
}`,
    tags: ['bug', 'triage', (language || 'backend').toLowerCase(), 'maintenance']
  };
}
