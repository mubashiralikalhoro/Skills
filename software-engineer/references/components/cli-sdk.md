# Component guide: CLI tool / SDK / library / browser extension

## P0 — blocking
- **Who runs it**: end user, developer, CI pipeline, ops. This decides everything about UX.
- Commands / public API surface, in the user's words, and what each does.
- Installation and distribution: package registry, binary, extension store, internal only.
- Authentication: how credentials are supplied and stored (env var, config file, keychain,
  interactive login) and what must never be written to disk.
- Where it runs: OS/runtime versions, offline capability, air-gapped environments.

## P1
- Input and output contract: flags, arguments, stdin, exit codes, machine-readable output (JSON)
  vs human output. CI consumers need stable exit codes and parseable output.
- Error messages: what a user sees on each failure class, and whether it is actionable.
- Configuration precedence: flags > env > config file > defaults — state the order.
- Versioning and backward-compatibility promise; deprecation policy for a public SDK.
- Idempotency and dry-run mode for anything destructive.

## P2
- Shell completion, colored output, telemetry (opt-in), plugin mechanism, docs generation.

## Do not ask
Language or packaging tooling — Stage 3.5, unless the consumer environment forces it (an SDK for
Python users must be Python; that is a requirement, not a preference).
