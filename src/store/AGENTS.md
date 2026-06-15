# Mobile State Store (mobile/src/store)

## Purpose
React Context Providers implementing global state management for authorization status and theme preferences across the mobile application.

## Ownership
Mobile Engineering team.

## Local Contracts
- State context files must export matching hook providers (e.g., `useAuth` or `useThemeContext`) for children consumers.
- Maintain persistent offline state (e.g., SecureStore / AsyncStorage) where required.

## Work Guidance
- Use contexts only for truly global state (e.g., auth session, global theme configuration).
- Keep context values small or memoized via `useMemo` to prevent unnecessary component tree re-renders.

## Verification
- Run state-transition checks (login, logout, theme switching) to verify dynamic state updates.
