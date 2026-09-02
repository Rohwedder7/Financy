# Contributing

## Branches

- `main`: mandatory challenge solution, always buildable.
- `feat/<spec-id>-short-name`: one approved SPEC.
- `fix/<short-name>`: isolated defect correction.
- `experiment/<short-name>`: optional work after the mandatory delivery is preserved.

## Commits

Use Conventional Commits and include the SPEC when applicable:

```text
feat(auth): implement login guard [SPEC-004]
test(categories): prove cross-user access denial [SPEC-006]
docs(adr): record token storage decision
```

## Pull request checklist

- [ ] The PR references exactly one primary SPEC.
- [ ] Acceptance criteria are mapped to tests or other evidence.
- [ ] Ownership and unauthorized cases are covered when applicable.
- [ ] `pnpm verify` passes.
- [ ] E2E passes for changed user journeys.
- [ ] No secret, `.env` or SQLite database file is committed.
- [ ] Product or architecture source documents were updated when their truth changed.
- [ ] Optional features are not mixed into the mandatory grading branch.

## Review order

1. SPEC compliance.
2. Security and user isolation.
3. Correctness and tests.
4. Architecture and maintainability.
5. UI fidelity and accessibility.
