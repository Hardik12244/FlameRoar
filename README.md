# Gamified Education Platform

The repository is now organized around the two active applications:

- `apps/api`: Express + Socket.IO backend
- `apps/web`: Vite + React frontend

Older experiments are preserved under `archive/` instead of sitting in the active runtime paths:

- `archive/fastapi-prototype`
- `archive/next-prototype`
- `archive/standalone-phaser`
- `archive/scratch`

## Run From Root

1. Install dependencies with `npm install`
2. Start the API with `npm run dev`
3. Start the frontend with `npm run dev:web`
4. Start both with `npm run dev:all`
5. Run the backend audit with `npm run audit`

## Main Layout

```text
apps/
  api/
    src/
    tests/
  web/
    public/
    src/
archive/
docs/
```

## Notes

- The API reads `.env` from the repo root.
- The frontend keeps its own package metadata inside `apps/web`.
- Product and pitch materials live under `docs/`.

## Gemini Setup (Chatbot + Skill Tree Tutor)

1. Copy [.env.example](.env.example) to `.env` in the repository root.
2. Add your Gemini key in `.env`:

  - `GEMINI_API_KEY=your_gemini_api_key_here`

3. (Optional) Set model/provider overrides:

  - `GEMINI_MODEL=gemini-2.0-flash`
  - `AI_PROVIDER=gemini`

The backend endpoints used by chatbot and tutoring lessons are:

- `POST /api/game/support/chat` (chatbot)
- `GET /api/game/study/:topic` (Skill Tree lesson generation)
