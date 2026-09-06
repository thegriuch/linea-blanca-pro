# Línea Blanca Pro

Aplicación móvil de diagnóstico técnico guiado para técnicos de electrodomésticos,
con evidencia fotográfica y reportes DOCX compartibles.

## Run & Operate

- `pnpm --filter @workspace/linea-blanca-pro run dev` — start the Expo preview
- `pnpm --filter @workspace/linea-blanca-pro run typecheck` — validate the mobile app
- `pnpm --filter @workspace/linea-blanca-pro run build` — build the static Expo deployment
- `pnpm --filter @workspace/linea-blanca-pro run serve` — serve the static Expo build
- Use the configured `artifacts/linea-blanca-pro: expo` workflow or **Preview on your phone** to open the app in Expo Go.
- The app stores diagnostics locally with AsyncStorage; it does not require `DATABASE_URL`.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Expo SDK 54, Expo Router, React Native, React Native Web
- AsyncStorage for offline-first persistence
- `expo-image-picker` for camera/gallery evidence
- `docx`, `expo-file-system` and `expo-sharing` for DOCX generation and sharing
- The separate API artifact uses Express 5 and remains optional for the mobile app

## Where things live

- `artifacts/linea-blanca-pro/app/` — Expo Router screens and diagnostic flow
- `artifacts/linea-blanca-pro/contexts/DiagnosticoContext.tsx` — session state and persistence
- `artifacts/linea-blanca-pro/utils/share.ts` — text fallback and DOCX report generation
- `artifacts/linea-blanca-pro/assets/images/icon.png` — app icon and DOCX letterhead icon
- `artifacts/linea-blanca-pro/app.json` — Expo metadata, permissions and native identifiers
- `artifacts/linea-blanca-pro/eas.json` — preview APK and production Android build profiles

## Architecture decisions

- Diagnostics are local-first so technicians can work without network access.
- Each evidence photo becomes its own DOCX page with its capture label and timestamp.
- The DOCX default header contains the app icon, so the letterhead repeats on every page.

## Product

- Guided decision trees for appliance faults
- Camera/gallery evidence capture
- Persistent diagnostic history
- DOCX report export with photos, labels and repeated letterhead

## User preferences

No project-specific preferences recorded.

## Gotchas

- Expo dependency versions must stay aligned with SDK 54; run `CI=1 pnpm exec expo install --check` from the mobile package after dependency changes.
- Android publishing through Replit's Expo Launch is not currently supported; iOS production publishing uses Replit's Publish / Expo Launch flow.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
