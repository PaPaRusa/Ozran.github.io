# Security Considerations

This project avoids storing sensitive user information in `localStorage`. Data persisted in `localStorage` is accessible to any script running on the page and can be exposed through cross-site scripting (XSS) attacks. Instead, essential user details are transmitted via HTTP-only cookies and retrieved through the `/auth-status` endpoint when needed.

This approach reduces the risk of credential theft from client-side storage and keeps user information restricted to the browser's protected cookie store.

