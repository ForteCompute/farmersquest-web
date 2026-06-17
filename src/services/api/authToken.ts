// A tiny in-memory holder for the current access token, read by the API client's request
// middleware. The session owns the lifecycle (sign in sets it, sign out clears it) and its
// persistence; the client only needs to read the current value when attaching the Authorization
// header. Keeping this separate from React state lets the network layer stay decoupled from the UI.
//
// The token is a bearer credential: never log it, and it is only ever attached to requests the
// client sends, which all target the configured API origin.

let currentToken: string | null = null;

export function getAuthToken(): string | null {
  return currentToken;
}

export function setAuthToken(token: string | null): void {
  currentToken = token;
}
