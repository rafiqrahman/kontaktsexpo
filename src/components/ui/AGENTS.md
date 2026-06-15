# Mobile UI Primitives (mobile/src/components/ui)

## Purpose
Low-level, styled, and highly reusable mobile UI elements (e.g., Collapsible, primitives).

## Ownership
Mobile Engineering team.

## Local Contracts
- Build components on top of core React Native elements (`View`, `Text`, `TouchableOpacity`).
- Ensure consistent spacing and theme application.

## Work Guidance
- Primitives must remain stateless where possible, or only manage UI-specific transitions.
- Do not introduce complex data-fetching or context consumption into primitives.

## Verification
- Test interactive states, touch response times, and rendering across device sizes.
