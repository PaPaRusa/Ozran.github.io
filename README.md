# Phishing Project Server

This server powers the phishing project application.

## HTTPS Requirement

Production deployments **must** be served over HTTPS. Authentication cookies are marked secure when requests are made over HTTPS or when the `USE_HTTPS=true` environment variable is set. Ensure your deployment uses HTTPS (for example, behind a reverse proxy) to protect these cookies.

