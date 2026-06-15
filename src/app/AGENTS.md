# Mobile Application Screens (mobile/src/app)

## Purpose
Expo Router implementation for the mobile application, specifying tab layouts, screen structures, navigation routes, and authentication flow boundaries.

## Ownership
Mobile Engineering team.

## Local Contracts
- Utilize file-based routing provided by Expo Router.
- Separate screens into logical groups like `(auth)` and `(tabs)` where appropriate.
- Ensure all screens handle platform differences (iOS vs. Android vs. Web) gracefully.

## Work Guidance
- Keep screen components clean by abstracting complex states or operations into Hooks or context stores.
- Use safe area views to ensure components render correctly behind device cutouts or physical notches.

## Verification
- Run local simulation on iOS Simulator, Android Emulator, or Expo Go.
- Ensure navigation routes resolve correctly without console warnings or loop-backs.
