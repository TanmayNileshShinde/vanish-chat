# System Architecture — Vanish Chat

This document details the in-memory WebSocket event pipeline, zero-knowledge ephemeral room lifecycles, and self-destruct routines.

## Architecture Overview

```text
[ Browser Client A ]                            [ Browser Client B ]
        |                                                |
        +======== Secure WebSocket Connection (WSS) =====+
                                |
                   [ Ephemeral Node.js Server ]
                                |
             +------------------+------------------+
             |                                     |
   [ In-Memory Map Rooms ]            [ Self-Destruct Garbage Collector ]
   (Active volatile sessions)         (Destroys room on last disconnect)
```

### Ephemeral Lifecycle Rules
1. **Volatile In-Memory Maps:** Chat rooms and temporary encryption nonces exist purely in volatile Node.js RAM.
2. **Immediate Garbage Collection:** As soon as connected client count reaches zero, room memory references are detached and scrubbed.
3. **Zero Logs:** Server stdout/stderr suppresses message content payloads.
