# TANAW Mobile

Expo Router + NativeWind mobile app for FSL → Tagalog translation.

## Phase 0 (current)

- Design tokens (`theme/tokens.ts`, `tailwind.config.js`)
- App shell: `TanawAppBar`, `TanawBottomNav`, `TanawShell`
- Tab routes: Translate · Create · Discover (grid + immersive)
- Demo mocks from `fsl_translator_app_demo.py` (`mocks/translate-demo.ts`)

## Run

```bash
cd apps/tanaw-mobile
npm start
```

Scan the QR code with Expo Go, or press `w` for web.

## Figma reference

- File: `HMdCplbVWx6qHXtE0CGSir`
- Translate tab: node `1:4`
- Colors: `#014421` (forest green), `#F9FFE3` (pomelo white), `#1A1A1A` (charcoal)

## Demo mocks

```ts
import { getDemoScenarios } from '@/mocks/translate-demo';

const scenarios = getDemoScenarios();
// 6 scenarios matching fsl_translator_app_demo.py DEMO_SCENARIOS
```
