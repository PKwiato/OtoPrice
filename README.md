# OtoPrice

## Overview

OtoPrice is a Fastify backend with a Vue 3 frontend for scraping car listings and displaying analytics.

## Prerequisites

- **Node.js** (>= 18)
- **npm** (comes with Node)

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run the backend**
   ```bash
   npm run dev:backend
   ```
   This starts the Fastify server defined in `server.ts`.

3. **Run the frontend**
   ```bash
   npm run dev:frontend
   ```
   The Vue app lives in `frontend/` and will be available at `http://localhost:5173` (or the port shown in the console).

4. **Open the application**
   Visit the frontend URL in your browser. The backend API is proxied automatically by the dev server.

## Development

- **Backend**: Edit `server.ts` and related TypeScript files. Restart the backend process after changes.
- **Frontend**: Edit Vue components under `frontend/src/`. Hot‑module replacement updates the UI without a full reload.

## Scripts

- `npm run dev:backend` – Starts the backend server.
- `npm run dev:frontend` – Starts the Vite dev server for the Vue frontend.
- `npm run build` – Builds the production bundle for both backend and frontend.

## License

MIT © 2026 PKwiato
