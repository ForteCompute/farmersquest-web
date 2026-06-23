// Shared helpers for the contract sync and drift-guard scripts. The web client is generated from the
// FarmersQuest API's OpenAPI contract; these scripts keep the committed client in step with it.
//
// The contract is read from the API repository's committed OpenAPI document, which is the source of
// truth in git (docs/openapi/v1.json on develop). Reading from git, not a running API, means a
// dev-API outage can never break web builds: the check only fails when the committed web client is
// actually behind the committed contract.
//
// The document is fetched through the GitHub Contents API, which needs a token with read access to
// the (private) API repository. The token is configuration and is never hardcoded: it comes from the
// API_CONTRACT_TOKEN environment variable (a repository secret in CI). Locally, if that variable is
// not set, the developer's GitHub CLI login is used so the refresh command works with no extra setup.
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const DEFAULT_REPO = 'ForteCompute/farmersquest-api';
const DEFAULT_PATH = 'docs/openapi/v1.json';
const DEFAULT_REF = 'develop';
const TOKEN_ENV = 'API_CONTRACT_TOKEN';

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const committedSchemaPath = path.join(repoRoot, 'src/services/api/schema.ts');
export const committedDocPath = path.join(repoRoot, 'openapi/farmersquest-api.openapi.json');

// Where the contract lives. The repository, path, and branch have sensible defaults (the API repo's
// committed document) and can each be overridden by an environment variable. None of these are
// secrets.
export function contractSource() {
  const repo = process.env.API_CONTRACT_REPO?.trim() || DEFAULT_REPO;
  const filePath = process.env.API_CONTRACT_PATH?.trim() || DEFAULT_PATH;
  const ref = process.env.API_CONTRACT_REF?.trim() || DEFAULT_REF;
  const apiBase = process.env.GITHUB_API_URL?.trim() || 'https://api.github.com';
  const url = `${apiBase}/repos/${repo}/contents/${filePath}?ref=${encodeURIComponent(ref)}`;
  return { repo, filePath, ref, url };
}

// A short human label for log lines, for example "ForteCompute/farmersquest-api docs/openapi/v1.json@develop".
export function contractDescription() {
  const { repo, filePath, ref } = contractSource();
  return `${repo} ${filePath}@${ref}`;
}

const MISSING_TOKEN_MESSAGE =
  `No token to read the API contract. Set the ${TOKEN_ENV} environment variable. In CI, add it as ` +
  `the ${TOKEN_ENV} repository secret (a token with read access to the API repository contents). ` +
  `Locally you can instead sign in with the GitHub CLI (gh auth login).`;

// Resolve the read token. CI must provide it explicitly through API_CONTRACT_TOKEN. Locally (never in
// CI) we fall back to the GitHub CLI token so a developer who is signed in needs no extra setup.
function resolveToken() {
  const explicit = process.env[TOKEN_ENV]?.trim();
  if (explicit) {
    return explicit;
  }
  if (!process.env.CI) {
    try {
      const token = execFileSync('gh', ['auth', 'token'], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim();
      if (token) {
        return token;
      }
    } catch {
      // The GitHub CLI is not installed or not signed in; fall through to the clear error below.
    }
  }
  return null;
}

// Fetch the committed contract and return it as a normalised JSON string (stable formatting, so the
// committed document has clean diffs from one sync to the next).
export async function fetchContract() {
  const { url, repo, filePath, ref } = contractSource();
  const token = resolveToken();
  if (!token) {
    throw new Error(MISSING_TOKEN_MESSAGE);
  }

  let response;
  try {
    response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.raw+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'farmersquest-web-contract-check',
      },
    });
  } catch (cause) {
    throw new Error(`Could not reach the GitHub Contents API for ${repo}. ${cause}`);
  }

  if (response.status === 401 || response.status === 403) {
    throw new Error(
      `Not authorised to read ${filePath} from ${repo}. The ${TOKEN_ENV} token needs read access to ` +
        `the API repository contents.`,
    );
  }
  if (response.status === 404) {
    throw new Error(
      `The API contract was not found at ${repo}:${filePath}@${ref}. A 404 can also mean the token ` +
        `cannot see the repository.`,
    );
  }
  if (!response.ok) {
    throw new Error(`Fetching the API contract returned HTTP ${response.status}.`);
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
