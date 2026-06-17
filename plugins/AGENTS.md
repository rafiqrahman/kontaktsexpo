# Expo Config Plugins (mobile/plugins)

## Purpose
Contains custom local Expo Config Plugins that manipulate native Android and iOS configurations during Expo Prebuild or EAS Build compilation.

## Ownership
Mobile Engineering team.

## Local Contracts
- All config plugins must follow standard Expo config plugin specification (`module.exports = function myPlugin(config, props) { ... }`).
- Plugins must keep native changes automated and repeatable without requiring manual commits of `android/` or `ios/` folders.

## Work Guidance
- Use `withDangerousMod` when modifying files on disk directly.
- Use built-in plugins like `withAndroidManifest` or `withInfoPlist` for XML and property list edits.

## Verification
- Run `npx expo prebuild` locally to inspect generated native changes in `android/` and `ios/` and verify they match expectations.
