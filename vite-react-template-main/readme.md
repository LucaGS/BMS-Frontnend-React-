# Baum Management System – Frontend

React + TypeScript Single Page App for BMS (tree and green-area management) powered by Vite. The UI covers authentication, tree/inspection workflows (inkl. 0–5 Slider und Vitalitaet), Bild-Uploads und Karten fuer Gruenflaechen.

## Stack
- React 19, TypeScript, React Router 7  
- Vite 6 (bundle), Vitest + Testing Library (Tests)  
- Bootstrap 5 Styling

## Getting started
1) Abhaengigkeiten: `npm install`  
2) Dev-Server: `npm run dev` und `http://localhost:5173` oeffnen  
3) API-URL bei Bedarf anpassen in `src/shared/config/appConfig.ts` (`API_BASE_URL`)

## Scripts
- `npm run dev` – Dev-Server starten
- `npm run build` – Type-Check + Production-Build nach `dist/`
- `npm test` – Vitest einmal ausfuehren
- `npm run test:watch` – Tests im Watch-Modus
- `npm run test:coverage` – Coverage-Report

## Testing
Vitest ist in `vite.config.ts` (happy-dom) konfiguriert. Globales Setup: `src/setupTests.ts`.  
`renderWithRouter` aus `src/test/test-utils.tsx` nutzen, wenn Komponenten Routing brauchen.

## Deployment
Produktionsbundle liegt in `dist/`. Stelle sicher, dass `API_BASE_URL` zur Zielumgebung passt. Caddy/Container-Deployments funktionieren ohne weitere Anpassungen.
