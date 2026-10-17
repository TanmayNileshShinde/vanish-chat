# Security Policy

**Vanish Chat** is designed for ephemeral, real-time messaging with a focus on room isolation and ephemeral delivery.

---

## 🔒 Security Practices

1. **Zero Message Logging:** Chat messages are ephemeral and transmitted over encrypted WebSocket channels. No chat messages or conversation logs are persisted to a database or server disk.
2. **Ephemeral Rooms:** Rooms cease to exist once all participants leave.
3. **Environment Isolation:** Pusher or WebSocket credentials must be loaded via local environment variables (`.env`) and never committed into source control.

---

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability in Vanish Chat, please report it responsibly:

- **Contact:** `tanmaynileshshinde@gmail.com`
- **Subject:** `[SECURITY] Vanish Chat Vulnerability Report`

Please include reproduction steps and avoid public disclosure prior to a fix being deployed.
