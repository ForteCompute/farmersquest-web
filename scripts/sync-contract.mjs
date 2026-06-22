// Refresh the committed API contract and regenerate the typed client from it. This is the single
// command a developer runs when the API contract changes:
//
//   npm run sync:contract
//
// It pulls the current contract from the API's published OpenAPI endpoint (API_OPENAPI_URL, default
// the development API), writes it to openapi/farmersquest-api.openapi.json, and regenerates
// src/services/api/schema.ts. Review and commit the diff. The client is never hand-edited.
import { writeFileSync } from 'node:fs';
import {
  committedDocPath,
  committedSchemaPath,
  contractUrl,
  fetchContract,
  generateClient,
} from './contract-source.mjs';

const url = contractUrl();
console.log(`Fetching API contract from ${url}`);
const doc = await fetchContract(url);
writeFileSync(committedDocPath, doc);
console.log(`Wrote ${committedDocPath}`);
generateClient(committedDocPath, committedSchemaPath);
console.log(`Regenerated ${committedSchemaPath}`);
console.log('Done. Review and commit the changes.');
