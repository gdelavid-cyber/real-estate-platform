export interface OpenCodeTaskResult {
  tool: string;
  command: string;
  status: 'completed';
  output: string;
  executionMs: number;
  dataPayload?: unknown;
}

const authHeader = (): Record<string, string> => {
  const username = process.env.OPENCODE_SERVER_USERNAME || 'opencode';
  const password = process.env.OPENCODE_SERVER_PASSWORD;
  if (!password) return {};
  return {
    Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
  };
};

/**
 * Executes a real prompt against an OpenCode headless server.
 * Start one with `opencode serve`, expose it securely, then set
 * OPENCODE_SERVER_URL and OPENCODE_SERVER_PASSWORD in Vercel.
 */
export async function executeOpenCodeTask(
  taskType: string,
  params: Record<string, unknown>
): Promise<OpenCodeTaskResult> {
  const baseUrl = process.env.OPENCODE_SERVER_URL?.replace(/\/$/, '');
  if (!baseUrl) {
    throw new Error(
      'OpenCode is not connected. Configure OPENCODE_SERVER_URL and OPENCODE_SERVER_PASSWORD.'
    );
  }

  const start = Date.now();
  const headers = { 'Content-Type': 'application/json', ...authHeader() };

  const health = await fetch(`${baseUrl}/global/health`, {
    headers: authHeader(),
    cache: 'no-store',
  });
  if (!health.ok) throw new Error('OpenCode server health check failed.');

  const sessionResponse = await fetch(`${baseUrl}/session`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ title: `Real estate task: ${taskType}` }),
  });
  if (!sessionResponse.ok) throw new Error('OpenCode could not create a session.');
  const session = await sessionResponse.json();
  const sessionId = session.id || session.data?.id;
  if (!sessionId) throw new Error('OpenCode returned no session ID.');

  const instruction = [
    'You are the operations assistant for Melissa Hatfield, REALTOR/Broker at John L. Scott Real Estate.',
    'Do not invent MLS listings, contacts, sales, results, or executed actions.',
    'Return concise, actionable output and identify every required external integration.',
    `Task: ${taskType}`,
    `Inputs: ${JSON.stringify(params)}`,
  ].join('\n');

  const messageResponse = await fetch(`${baseUrl}/session/${sessionId}/message`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      parts: [{ type: 'text', text: instruction }],
    }),
  });
  if (!messageResponse.ok) {
    throw new Error(`OpenCode prompt failed (${messageResponse.status}).`);
  }

  const result = await messageResponse.json();
  const parts = result.parts || result.data?.parts || [];
  const output = parts
    .filter((part: { type?: string; text?: string }) => part.type === 'text')
    .map((part: { text?: string }) => part.text || '')
    .join('\n')
    .trim();

  return {
    tool: 'opencode-server',
    command: `${taskType} ${JSON.stringify(params)}`,
    status: 'completed',
    output: output || 'OpenCode completed the task without a text response.',
    executionMs: Date.now() - start,
    dataPayload: result,
  };
}
