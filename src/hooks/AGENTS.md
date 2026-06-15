# Mobile Custom Hooks (mobile/src/hooks)

## Purpose
Custom React hooks encapsulating side effects, device state queries, and API interactions for the mobile application.

## Ownership
Mobile Engineering team.

## Local Contracts
- Hook files must start with the `use` prefix (e.g., `useApi.ts`).
- Hooks must clean up side effects and event listeners (e.g., color scheme listeners) in `useEffect` returns.
- **Basepath Contract:** `API_BASE_URL` (`EXPO_PUBLIC_API_BASE_URL`) and `BASE_URL` (`EXPO_PUBLIC_BASE_URL`) point to the Next.js server with the `/kontaktsapp` base path prefix.
- **Endpoint Concatenation:** Endpoints requested via `useApi` (e.g. `get()`, `post()`) must always begin with a leading slash `/` (e.g. `/api/v1/...`) to concatenate correctly with the base path.

## Work Guidance
- Use hooks to separate platform-specific rendering behavior from page layout structures (e.g., `use-color-scheme.ts` vs `use-color-scheme.web.ts`).
- Leverage generic API wrappers to standardize fetch errors and loading states.
- In local development, ensure `.env` base URLs are configured with your development machine's local IP (e.g., `http://10.x.x.x:3000/kontaktsapp`) instead of `localhost` so physical devices and emulators can successfully reach the Next.js dev server.

## Verification
- Verify hooks function across all platforms without memory leaks or duplicate listeners.
