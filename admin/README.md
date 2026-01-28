# Smart Savings Card Admin (RTL Arabic)

## Features
- Arabic-first UI with RTL layout.
- English-ready via JSON dictionaries in `src/i18n`.
- Shared UI components consume labels through `t("key.path")`.
- API wrapper maps backend messages and network errors to Arabic text.

## Setup
1) Set `NEXT_PUBLIC_API_BASE` to your backend base URL (default: `http://localhost:4000`).
2) Install dependencies and run:
   - `npm install`
   - `npm run dev`

## Localization
- Default locale is Arabic in `src/i18n/ar.json`.
- Add new languages by creating a JSON file and registering it in `src/i18n/index.tsx`.

## RTL Notes
- `src/app/layout.tsx` sets `dir="rtl"` and `lang="ar"`.
- If you enable English in production, move `dir` and `lang` to a client provider based on selected locale.
