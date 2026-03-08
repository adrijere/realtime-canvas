# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Klein Realtime is a sketch-to-image web app that uses fal.ai's `flux-2/klein` model via realtime WebSocket. Users draw on a canvas and get live AI-generated images based on style presets.

## Commands

- `npm start` — start production server
- `npm run dev` — start server with `--watch` (auto-restart on changes)
- No test framework or linter is configured.

## Environment

Requires a `.env` file with `FAL_KEY` (fal.ai API key). Optional `PORT` (defaults to 3000).

## Architecture

**ES Modules throughout** — `"type": "module"` in package.json; the frontend uses `<script type="module">` with ESM imports from `esm.sh`.

### Backend (`server.js`)
Express 5 server with one API endpoint:
- `POST /api/fal/realtime-token` — proxies token requests to fal.ai's token API, keeping `FAL_KEY` server-side. Extracts the app alias (e.g. `flux-2` from `fal-ai/flux-2/klein`) for token scoping.

Static files served from `public/`.

### Frontend (`public/`)
Vanilla HTML/CSS/JS — no build step, no framework.

- **`app.js`** — All application logic in one file:
  - `PRESETS` object defines style prompts (studio, toy, ceramic, etc.)
  - Drawing: mouse/touch event handlers on a `<canvas>` element
  - `fal.realtime.connect()` establishes WebSocket to fal.ai with token-based auth via the backend endpoint
  - `scheduleSend()` debounces canvas captures (128ms default) and sends JPEG data URLs to the realtime connection
  - `captureCanvas()` resizes drawings to 704×704 for the model
  - Two view modes: "split" (side-by-side) and "merge" (overlay)
  - Dark/light theme support with `localStorage` persistence

- **`index.html`** — Single-page layout with draw pane, output pane, and preset bar
- **`style.css`** — All styling including theme variants

### Key data flow
1. User draws on canvas → `draw()` → `scheduleSend()` (debounced)
2. `sendToFal()` captures canvas as JPEG, composes prompt from active preset + theme hint
3. Payload sent via `connection.send()` over fal realtime WebSocket
4. `onResult` callback receives base64 images, displays in output pane
