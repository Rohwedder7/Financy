# Frontend rule

- Inspect the exact Figma node and screenshot before implementing a final screen.
- Keep server state in Apollo; do not mirror it in ad-hoc global state.
- Store the JWT only through the session abstraction and clear it on authentication failure.
- Use semantic controls, visible focus, labels and keyboard-complete dialogs.
- Convert localized money input at the boundary; application values remain integer cents.
