---
name: review-spec
description: Review an implementation strictly against its Financy SPEC.
---

# Review SPEC

1. Read the SPEC and diff.
2. Trace every acceptance criterion to implementation and a test.
3. Check auth principal, `id + userId` predicates, money precision and error codes.
4. Check UI states, keyboard/focus and Figma evidence when applicable.
5. Run focused verification if safe.
6. Report blocking, important and minor findings with exact evidence. State explicitly when no findings exist.
