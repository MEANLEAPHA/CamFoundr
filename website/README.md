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

Set `GEMINI_API` in the server's environment (or its local `server/.env` file)
to a Google Gemini API key. Keep this key on the server; it is never required
in the website's Vite environment. The authenticated question-generation API
uses Gemini 3.8 Flash and is rate limited per user.
