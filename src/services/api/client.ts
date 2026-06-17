import createClient from 'openapi-fetch';
import type { Middleware } from 'openapi-fetch';
import type { paths } from './schema';
import { config } from '../config';
import { getAuthToken } from './authToken';

// The typed API client. Types come from schema.ts, which is generated from the FarmersQuest API
// OpenAPI document (run `npm run generate:api` after the contract changes). The base URL comes from
// environment configuration, never hardcoded. Every call is type checked against the published
// contract, so a path, parameter, or shape that the API does not offer will not compile.
//
// This client is the only way the web app talks to the API. There is no business logic here: it
// sends requests and returns typed responses for the presentation layer to render.

// Attaches the bearer token to outgoing requests when the user is signed in. Because the client is
// scoped to the configured API base URL, the token only ever travels to that origin. The token is
// never logged.
const authMiddleware: Middleware = {
  onRequest({ request }) {
    const token = getAuthToken();
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`);
    }
    return request;
  },
};

export const apiClient = createClient<paths>({
  baseUrl: config.apiBaseUrl,
  headers: {
    Accept: 'application/json',
  },
});

apiClient.use(authMiddleware);

export type ApiClient = typeof apiClient;
