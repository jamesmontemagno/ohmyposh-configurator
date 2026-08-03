import { execFile } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const COMMAND = 'oh-my-posh';
const COMMAND_TIMEOUT_MS = 5_000;
const OUTPUT_BUFFER_BYTES = 1_048_576;

export type OhMyPoshCliStatus =
  | { available: true; version: string }
  | { available: false; reason: 'not-found' };

export type OhMyPoshRenderResult =
  | OhMyPoshCliStatus & { output?: never }
  | { available: true; version: string; output: string };

function isCommandNotFound(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT';
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function getOhMyPoshCliStatus(): Promise<OhMyPoshCliStatus> {
  try {
    const { stdout } = await execFileAsync(COMMAND, ['version'], {
      timeout: COMMAND_TIMEOUT_MS,
      maxBuffer: OUTPUT_BUFFER_BYTES,
      encoding: 'utf8',
    });

    const version = stdout.trim();
    if (!version) {
      throw new Error('Oh My Posh did not return a version.');
    }

    return { available: true, version };
  } catch (error) {
    if (isCommandNotFound(error)) {
      return { available: false, reason: 'not-found' };
    }

    throw new Error(`Unable to detect Oh My Posh: ${getErrorMessage(error)}`);
  }
}

export async function renderWithOhMyPosh(config: unknown): Promise<OhMyPoshRenderResult> {
  const status = await getOhMyPoshCliStatus();
  if (!status.available) return status;

  const directory = await mkdtemp(join(tmpdir(), 'ohmyposh-mcp-'));
  const configPath = join(directory, 'config.json');

  try {
    await writeFile(configPath, JSON.stringify(config), 'utf8');
    const { stdout } = await execFileAsync(
      COMMAND,
      ['print', 'primary', '--config', configPath],
      {
        timeout: COMMAND_TIMEOUT_MS,
        maxBuffer: OUTPUT_BUFFER_BYTES,
        encoding: 'utf8',
      }
    );

    return { ...status, output: stdout };
  } catch (error) {
    throw new Error(`Unable to render the Oh My Posh preview: ${getErrorMessage(error)}`);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
