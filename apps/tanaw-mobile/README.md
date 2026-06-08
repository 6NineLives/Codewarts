# TANAW Mobile

Expo Router + NativeWind mobile app for FSL → Tagalog translation.

## Phase 0 (current)

- Design tokens (`theme/tokens.ts`, `tailwind.config.js`)
- App shell: `TanawAppBar`, `TanawBottomNav`, `TanawShell`
- Tab routes: Translate · Create · Discover (grid + immersive)
- Demo mocks from `fsl_translator_app_demo.py` (`mocks/translate-demo.ts`)

## Run

### Translate tab (real-time bones)

The Translate tab uses **react-native-vision-camera** for continuous video frame sampling. This requires a **custom development build** — Expo Go is not supported for bone tracking.

```bash
# Terminal 1 — API
cd services/tanaw-api
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 — mobile dev client (first time builds native app)
cd apps/tanaw-mobile
npm run android    # or: npm run ios
npm start          # then open the dev client on device
```

On Android, frames are sampled from the live preview via `takeSnapshot()` (~5–6 fps to the backend). On iOS, silent `capturePhotoToFile()` is used as a fallback.

### Web / Create tab

```bash
cd apps/tanaw-mobile
npm run web        # web preview (no bones camera)
```

Create still uses `expo-camera` for recording and works in Expo Go.

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
