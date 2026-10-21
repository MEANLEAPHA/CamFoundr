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
