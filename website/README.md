# Website

## Deploying to Hostinger

The app uses React Router browser URLs. Hostinger must serve `index.html` for
routes that are handled by the client-side router, such as `/blog/example`.
The `.htaccess` file in `public/` configures this fallback and is copied into
the production build.

Build the site with `npm run build` from this directory, then upload the
contents of `dist/` (including the hidden `.htaccess` file) to the website's
document root. Direct route visits and browser refreshes will then load the
app, while real files and directories continue to be served normally.

## AI question generation

Set `NVIDIA_API` to an NVIDIA NIM API key in the server's environment (or its
local `server/.env` file). `NVIDIA_MODEL` is optional; it defaults to
`meta/llama-3.1-8b-instruct`. To use another available model, set
`NVIDIA_MODEL` to its exact NVIDIA Build model ID, such as
`deepseek-ai/deepseek-v4-flash`. The key is kept on the server; it is never
required in the website's Vite environment. The authenticated
question-generation API uses NVIDIA's OpenAI-compatible chat completions
endpoint and is rate limited per user.
The provider request timeout defaults to 180 seconds. Set `NVIDIA_TIMEOUT_MS`
on the server to override it (allowed range: 30000–300000 milliseconds).

## Matching question database setup

Before starting the updated server, apply
`server/migrations/20261025_add_matching_questions.sql` to the PostgreSQL
database. It creates the indexed matching-pair table and adds the JSONB column
used to store each respondent's index mapping.
