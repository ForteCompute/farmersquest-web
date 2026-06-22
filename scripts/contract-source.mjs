// Shared helpers for the contract sync and drift-guard scripts. The web client is generated from the
// FarmersQuest API's OpenAPI contract; these scripts keep the committed client in step with it.
//
// The contract is pulled from the API's published OpenAPI endpoint, which is the source CI can reach
// reliably. The URL is configuration, never hardcoded into the app: it comes from API_OPENAPI_URL,
// with the development API as the default so a developer can refresh with no extra setup.
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const DEFAULT_OPENAPI_URL = 'https://farmquest-api.dev.fortecompute.com/swagger/v1/swagger.json';

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const committedSchemaPath = path.join(repoRoot, 'src/services/api/schema.ts');
export const committedDocPath = path.join(repoRoot, 'openapi/farmersquest-api.openapi.json');

export function contractUrl() {
  return process.env.API_OPENAPI_URL?.trim() || DEFAULT_OPENAPI_URL;
}

// Fetch the contract and return it as a normalised JSON string (stable formatting, so the committed
// document has clean diffs from one sync to the next).
export async function fetchContract(url) {
  let response;
  try {
    response = await fetch(url);
  } catch (cause) {
    throw new Error(`Could not reach the API contract at ${url}. ${cause}`);
  }
  if (!response.ok) {
    throw new Error(`The API contract at ${url} returned HTTP ${response.status}.`);
  }
  const parsed = await response.json();
  return `${JSON.stringify(parsed, null, 2)}\n`;
}

// Generate the typed client from an OpenAPI document on disk into the given output path. Uses the
// pinned openapi-typescript binary so local and CI produce identical output.
export function generateClient(docPath, outPath) {
  const bin = path.join(repoRoot, 'node_modules/.bin/openapi-typescript');
  execFileSync(bin, [docPath, '--output', outPath], { stdio: 'inherit' });
}
