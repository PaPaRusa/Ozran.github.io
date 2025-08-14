# Ozran.github.io

Node.js server for the phishing test service.

## Environment Variables

Copy `.env.example` to `.env` and adjust the values to suit your environment.
The server uses the following variables:

- `JWT_SECRET` – secret used to sign JWT tokens. Falls back to a development
  value if unset, but **must** be provided in production.
- `SUPABASE_URL` – URL of your Supabase project.
- `SUPABASE_SERVICE_ROLE_KEY` – Supabase service role key with required permissions.
- `EMAIL_USER` – email account used to send test emails.
- `EMAIL_PASS` – password or app password for `EMAIL_USER`.
- `TESTER_EMAIL` – address that receives phishing alerts.
- `PORT` – port for the server (defaults to `10000`).

Missing critical variables will produce warnings and, in production, halt the
server. The default values in `.env.example` are intended for local development
only.
