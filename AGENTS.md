# AGENTS.md

## Cursor Cloud specific instructions

This is a React + TypeScript travel planning web app built with Vite.

### Tech stack
- **Frontend**: React 19, TypeScript, Vite 7, Tailwind CSS 4, Zustand (state), React Router 7
- **Persistence**: localStorage via Zustand `persist` middleware
- **No backend** — purely client-side SPA

### Commands
| Task | Command |
|------|---------|
| Dev server | `npm run dev` (serves on `http://localhost:5173`) |
| Lint | `npm run lint` |
| Type check | `npx tsc -b` |
| Build | `npm run build` |

### Notes
- Vite dev server is configured to bind to `0.0.0.0:5173` so it's accessible from the Desktop pane.
- Tailwind CSS 4 is integrated via the `@tailwindcss/vite` plugin (no `tailwind.config.js` needed).
- All trip data is persisted in localStorage under key `mytravel-storage`.
