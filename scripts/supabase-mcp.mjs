import { spawn } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const projectRef = process.env.SUPABASE_PROJECT_REF ?? 'ncffmgqqyxvggqhlhgmz';
const configPath = resolve('.kilo/kilo.json');

async function getAccessToken() {
  const rawConfig = await readFile(configPath, 'utf8');
  const config = JSON.parse(rawConfig);
  const command = config?.mcp?.supabase?.command;

  if (!Array.isArray(command)) {
    throw new Error('Supabase MCP command was not found in .kilo/kilo.json');
  }

  const tokenFlagIndex = command.indexOf('--access-token');
  const token = tokenFlagIndex >= 0 ? command[tokenFlagIndex + 1] : undefined;

  if (typeof token !== 'string' || token.length === 0) {
    throw new Error('Supabase access token was not found in .kilo/kilo.json');
  }

  return token;
}

async function parseJsonPayload(payload) {
  if (!payload) {
    return {};
  }

  if (payload.startsWith('@')) {
    const filePath = resolve(payload.slice(1));
    return JSON.parse(await readFile(filePath, 'utf8'));
  }

  return JSON.parse(payload);
}

function createJsonRpcClient(child) {
  let nextId = 1;
  let buffer = '';
  const pending = new Map();

  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (chunk) => {
    buffer += chunk;
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.trim()) {
        continue;
      }

      const message = JSON.parse(line);
      if (typeof message.id !== 'undefined') {
        const callbacks = pending.get(message.id);
        if (callbacks) {
          pending.delete(message.id);
          if (message.error) {
            callbacks.reject(new Error(JSON.stringify(message.error)));
          } else {
            callbacks.resolve(message.result);
          }
        }
      }
    }
  });

  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (chunk) => {
    if (process.env.MCP_DEBUG === '1') {
      process.stderr.write(chunk);
    }
  });

  function send(method, params) {
    const id = nextId;
    nextId += 1;
    const payload = { jsonrpc: '2.0', id, method, params };

    return new Promise((resolvePromise, rejectPromise) => {
      pending.set(id, { resolve: resolvePromise, reject: rejectPromise });
      child.stdin.write(`${JSON.stringify(payload)}\n`);
    });
  }

  function notify(method, params) {
    child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', method, params })}\n`);
  }

  return { send, notify };
}

async function main() {
  const [, , commandName, maybeToolName, maybePayload] = process.argv;
  const token = await getAccessToken();
  const child = spawn(
    'npx',
    [
      '-y',
      '@supabase/mcp-server-supabase@0.5.5',
      '--access-token',
      token,
      '--project-ref',
      projectRef,
    ],
    {
      shell: process.platform === 'win32',
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    },
  );

  const client = createJsonRpcClient(child);

  await client.send('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'masari-codex-local',
      version: '1.0.0',
    },
  });
  client.notify('notifications/initialized', {});

  if (commandName === 'tools') {
    const result = await client.send('tools/list', {});
    console.log(JSON.stringify(result, null, 2));
  } else if (commandName === 'generate-types') {
    if (!maybeToolName) {
      throw new Error('Usage: node scripts/supabase-mcp.mjs generate-types <outputPath>');
    }

    const result = await client.send('tools/call', {
      name: 'generate_typescript_types',
      arguments: {},
    });
    const textContent = result?.content?.find((item) => item?.type === 'text')?.text;
    const parsed = typeof textContent === 'string' ? JSON.parse(textContent) : undefined;

    if (typeof parsed?.types !== 'string') {
      throw new Error('MCP response did not include generated TypeScript types');
    }

    await writeFile(resolve(maybeToolName), parsed.types, 'utf8');
    console.log(JSON.stringify({ outputPath: maybeToolName }, null, 2));
  } else if (commandName === 'apply-migration') {
    if (!maybeToolName || !maybePayload) {
      throw new Error('Usage: node scripts/supabase-mcp.mjs apply-migration <migrationName> <sqlPath>');
    }

    const query = await readFile(resolve(maybePayload), 'utf8');
    const result = await client.send('tools/call', {
      name: 'apply_migration',
      arguments: {
        name: maybeToolName,
        query,
      },
    });
    console.log(JSON.stringify(result, null, 2));
  } else if (commandName === 'call') {
    if (!maybeToolName) {
      throw new Error('Usage: node scripts/supabase-mcp.mjs call <toolName> [jsonPayload]');
    }

    const args = await parseJsonPayload(maybePayload);
    const result = await client.send('tools/call', {
      name: maybeToolName,
      arguments: args,
    });
    console.log(JSON.stringify(result, null, 2));
  } else {
    throw new Error('Usage: node scripts/supabase-mcp.mjs tools OR call <toolName> [jsonPayload] OR apply-migration <migrationName> <sqlPath> OR generate-types <outputPath>');
  }

  child.kill();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
