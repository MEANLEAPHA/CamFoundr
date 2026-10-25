# NahideaBackend

## CORS configuration

Set `ORIGIN_URL` to the primary website origin. To allow additional website
origins, set `CORS_ORIGINS` to a comma-separated list of full origins, for
example:

```env
ORIGIN_URL=https://skyblue-fox-816626.hostingersite.com
CORS_ORIGINS=https://www.example.com,https://example.com
```

Use the website origin (the domain in the browser address bar), not the API
server's domain. These settings apply to both REST and Socket.IO requests.
