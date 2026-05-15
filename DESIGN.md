# Design System: FSL Translator
**Project ID:** 10683701754287361542

## 1. Visual Theme & Atmosphere
A "Tech-Forward Inclusivity" aesthetic that blends **Minimalism** with **Glassmorphism**. It uses deep obsidian surfaces and vibrant, luminous accents to simulate a state-of-the-art heads-up display (HUD). The vibe is clean, efficient, and accessible, prioritizing the video feed while making translation data feel integrated into the user's environment.

## 2. Color Palette & Roles
- **Deep Obsidian (#0F172A):** The core base background layer.
- **Neon Teal (#2DD4BF):** The primary brand color. Used for active translation text, "Sign Detected" states, and primary actions. Provides high visibility against dark backgrounds.
- **Electric Blue (#3B82F6):** Used for system status, secondary controls, and AI processing indicators.
- **Translucent Slate (#1E293B, 60% opacity):** The material for elevated panels and glass containers. Combined with a 20px backdrop blur.
- **Primary Glow:** `rgba(45, 212, 191, 0.3)` — Applied to active translation boxes for an AI-powered look.

## 3. Typography Rules
- **Display Translation (Inter, 48px Bold):** High-impact text for the currently detected sign. Designed for legibility from a distance.
- **Structural Headers (Geist, 32px Semi-Bold):** Used for page titles and navigation labels.
- **Status Metrics (JetBrains Mono, 14px Medium):** Used for confidence percentages, technical readouts, and timestamps.

## 4. Component Stylings
- **Translation Bubble:**
  - **Shape:** Generously rounded corners (`rounded-2xl` / 1.5rem).
  - **Surface:** Glassmorphism (Translucent Slate background + Backdrop Blur).
  - **Border:** 1px solid white (10% opacity) to define edges.
- **Status Indicators:**
  - Small "Pill" style chips.
  - "Model: Connected" features a pulsing Electric Blue dot.
- **Primary Buttons:**
  - Solid Neon Teal background with Deep Obsidian text.
  - Subtle hover glow effect.

## 5. Layout Principles
- **Grid Strategy:** A "Video-First" architecture.
- **Desktop:** Large central viewport for the FSL stream; translation panels appear as floating glass overlays on the right side.
- **Mobile:** Vertical stack where the video occupies the top 60% and the translation output takes the bottom 40% in a dedicated high-contrast area.
- **Safe Zones:** 40px margin around the edges of the video feed to ensure hands and facial expressions are never obscured.
