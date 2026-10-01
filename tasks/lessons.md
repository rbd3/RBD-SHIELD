# Lessons
- Stale frontend reads can make a newly registered on-chain identity fall back to an address-derived placeholder until the UI is explicitly updated or invalidated.
- When a form writes user-facing identity data on-chain, propagate the submitted name through the registration success path so the current session can render the exact label immediately.
