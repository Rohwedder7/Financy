---
name: implement-spec
description: Implement one approved active Financy SPEC with tests and evidence.
---

# Implement SPEC

1. Confirm exactly one requested SPEC is `approved` in `specs/active`.
2. Read its references and inspect affected code before editing.
3. Plan the smallest vertical change and map tests to acceptance criteria.
4. Implement without unrelated refactors; preserve GraphQL and ownership rules.
5. Run focused tests after each slice, then every command in the SPEC.
6. Summarize files changed and evidence by criterion. Do not mark completed yourself unless explicitly asked.

Stop if a migration is destructive, a Figma node is missing, or observable behavior is undecided.
