# NeuronBook — Session context

Use this file when you return to the project. You can open it and tell the AI: *"Continue from docs/CONTEXT.md"* or paste the relevant section into a new chat.

---

## What was done (recent session)

### PDF reader
- **Default PDF** was pointing to `/sample.pdf` (missing). It’s now `/Lecture1_modified_JG.pdf` (exists in `public/`). `.env` and `.env.example` were updated.
- **Foxit “File Open Error”** for local PDFs: Foxit’s cloud can’t fetch `localhost`, so for **same-origin** PDFs (e.g. from `public/`) the app now shows the PDF in a plain **iframe** instead of the Foxit Embed viewer. Files in `public/` load correctly.
- **Foxit** is still used when the PDF URL is a public (non–same-origin) URL.

### Backend / dev
- **`scripts/start-flask.js`** was recreated (it had been deleted). It starts Flask with `api/.venv` and runs `flask --app index run -p 5328` from the `api` directory.
- **`npm run dev`** runs both Next.js and Flask (via `concurrently`); no need to start the backend separately.

### Key files
- **Reader:** `app/reader/page.tsx` — uses `SAMPLE_PDF_URL` (env or default `/Lecture1_modified_JG.pdf`).
- **PDF viewer:** `components/foxit-pdf-viewer.tsx` — iframe for same-origin PDFs, Foxit for public URLs, mock when Foxit isn’t configured.
- **Env:** `.env` has `NEXT_PUBLIC_SAMPLE_PDF_URL`, Foxit script/key, and `YOU_COM_API_KEY` for concept enrichment.

---

## Current state

- **PDF reader:** Working. PDF in `public/` (e.g. `Lecture1_modified_JG.pdf`) loads in an iframe on the reader page.
- **Flow:** User can “Request question (current page)” or select text → question appears in sidebar → user submits answer → evaluation + optional concept enrichment (You.com).
- **API:** Flask on port 5328; Next.js rewrites `/api/*` to Flask. Routes: `/api/question/generate`, `/api/answer/submit`, health.

---

## Suggested next steps

1. **End-to-end test**  
   With `npm run dev`, open Reader → request a question → submit an answer. Confirm the sidebar shows the question, then the result (evaluation + enrichment). If you see API errors, check Flask is running and rewrites in `next.config.ts`.

2. **Smarter questions**  
   Done: `api/routes/question.py` now uses You.com **Express API** (LLM) to generate Socratic questions from the selected passage when `YOU_COM_API_KEY` is set; falls back to the template question on failure or empty response.

3. **Optional:** Fix or ignore the Node deprecation warning (`util._extend`) from a dependency — run with `node --trace-deprecation` to find the package if needed.

4. **Optional:** Polish the homepage (`app/page.tsx`) for NeuronBook (e.g. “Active reading with Socratic questions”) and keep “Open Reader” as the main CTA.

---

*Last updated: Feb 2025*
