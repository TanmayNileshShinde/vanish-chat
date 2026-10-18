# Contributing to Vanish Chat

Thank you for helping build Vanish Chat — the zero-knowledge ephemeral messaging app.

## Security Principles
- Never persist chat room logs or messages to disk or permanent databases.
- Rooms must self-destruct immediately when the last peer disconnects.
- Avoid tracking IP addresses or telemetry identifiers in logs.

## Contribution Guidelines
- Test WebSocket disconnect and reconnections.
- Maintain clean TypeScript/Node.js modular code.
