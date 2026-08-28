# ASP.NET Code Style

This guide records conventions already used by the active `backend/` and `backend.Test/` projects. It does not apply Node.js, tRPC, Drizzle, or unrelated Next.js rules.

## Formatting and language

- CSharpier is the formatting authority: use `just format` and verify with `just format-check`.
- Use file-scoped namespaces and the projects' enabled implicit usings and nullable reference types.
- Use PascalCase for types and public members, `_camelCase` for private fields, and the `Async` suffix for asynchronous methods.
- Prefer primary constructors where the surrounding controller/service uses them; do not refactor existing types solely for style.

## Boundaries

- Controllers define HTTP routes, binding, authorization, response metadata, and delegate work to services.
- Services own application behavior and MongoDB operations and return `FluentResults.Result<T>`.
- `MongoDbContext` exposes typed collections; keep collection access and MongoDB filters/updates in services.
- Group request/response DTOs by feature under `backend/DTOs/<Feature>/`.
- Use Mapperly partial mappers under `backend/Mappers/`; declare ignored or custom mappings explicitly.
- Convert service results through `ResultExtensions.ToApiResponse` rather than constructing parallel response envelopes.

## MongoDB

- Keep BSON element names, ObjectId representations, UTC timestamps, and enum string representations consistent with existing models.
- Use async MongoDB Driver APIs and the shared pagination extensions.
- Do not change collection names or persisted shapes during characterization work.

## Tests

- Use xUnit naming in the form `Method_Condition_ExpectedBehavior`.
- Use Mongo2Go through `TestDBContext` for real collection behavior and Moq only at service/controller boundaries.
- Arrange, act, assert; verify both the returned `Result<T>` and persisted state when behavior crosses MongoDB.
- Characterization tests lock current behavior. A discovered defect gets a separate ticket and production change, not a rewritten expectation in this baseline.
