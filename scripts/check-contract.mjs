// Contract drift guard. Regenerates the typed client from the API's current contract and fails if the
// committed client is out of date, so the web can never silently build against a stale contract.
//
//   npm run check:contract
//
// It pulls the current contract from the API's published OpenAPI endpoint (API_OPENAPI_URL, default
// the development API), generates the client into a temporary file, and compares it to the committed
// src/services/api/schema.ts. Any difference fails the build with the one command to fix it.
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  committedSchemaPath,
  contractUrl,
  fetchContract,
  generateClient,
} from './contract-source.mjs';

const url = contractUrl();
console.log(`Checking the committed API client against the contract at ${url}`);

let doc;
try {
  doc = await fetchContract(url);
} catch (error) {
  console.error(`\nContract check could not run: ${error.message}`);
  console.error('Set API_OPENAPI_URL to a reachable OpenAPI endpoint and try again.');
  process.exit(1);
}

const tmp = mkdtempSync(path.join(tmpdir(), 'fq-contract-'));
const tmpDoc = path.join(tmp, 'contract.json');
const tmpSchema = path.join(tmp, 'schema.ts');
writeFileSync(tmpDoc, doc);
generateClient(tmpDoc, tmpSchema);

const fresh = readFileSync(tmpSchema, 'utf8');
const committed = readFileSync(committedSchemaPath, 'utf8');

if (fresh !== committed) {
  console.error('\nThe committed API client is out of date with the API contract.');
  console.error('Run `npm run sync:contract` and commit the regenerated client.');
  process.exit(1);
}

console.log('The committed API client is up to date with the API contract.');
