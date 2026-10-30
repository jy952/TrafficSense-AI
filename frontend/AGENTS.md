<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- All backend calls go through `src/services/api.ts`; it targets FastAPI via `VITE_API_BASE_URL` and falls back to demo data unless `VITE_USE_BACKEND=true` — keeps UI decoupled from the backend.
- Leaflet is only imported in `TrafficMap.tsx`, loaded through `LazyTrafficMap` — Leaflet touches `window` and breaks SSR.
- Navigation uses TanStack Router (template-fixed), not React Router.
