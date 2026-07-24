# Kanban Board

A mobile-friendly kanban board built with React, TypeScript, and Vite. Tasks and columns
persist to `localStorage`, so your board is there when you come back.

## Features

- Add, rename, delete, and reorder columns (drag or the `‹ ›` buttons)
- Add, edit, delete tasks with a title, description, and priority (low/medium/high/urgent)
- Drag and drop tasks between columns, or use the move menu on a card
- Responsive layout with horizontal snap-scrolling columns on small screens
- State persists across sessions via `localStorage`

## Getting started

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — type-check and build for production
- `npm run lint` — run ESLint
- `npm run preview` — preview the production build locally
