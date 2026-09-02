# Backend rule

- Derive the effective user only from the verified JWT principal.
- Never expose or accept `userId` in finance GraphQL inputs.
- Query owned resources using both resource ID and authenticated user ID.
- Keep resolvers thin; rules live in feature services.
- Store money as positive integer cents and validate category ownership atomically.
- Return stable GraphQL error codes without SQL, stack traces or secrets.
