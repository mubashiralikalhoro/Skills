# Safe sequences — examples

Examples of expand → migrate → contract for common changes. They are hints for shaping a change,
not a complete list; apply the same idea to anything not here.

| Change | Ship now (v1 still runs) | Later, after v1 and old clients are gone |
|---|---|---|
| Rename column or field | Rename only in code with an ORM column mapping (`@map`, `@Column({name})`, `field:`, `db_column`, `HasColumnName`, `text('old_name')`). If the DB name must change: add new column, write both, read new with fallback to old, backfill | Stop writing old, then drop old |
| Add a required column | Add nullable, or with a default valid for v1's inserts. v2 writes it. Backfill in batches | `SET NOT NULL` once every writer sets it |
| Drop column or table | Ship code that no longer reads or writes it | Drop it |
| Change column type | Add a new column with the new type, dual-write, backfill | Switch reads, drop old |
| Add enum or status value | First ship readers that accept it (v1 updated, or unknown → safe fallback). Then start writing it | — (a Postgres enum value cannot be removed) |
| Remove enum value | Stop writing it, migrate rows | Remove it |
| Tighten a constraint | Clean existing data, make every writer comply | Add the constraint (Postgres: `NOT VALID`, then `VALIDATE`) |
| Change a DB default | Set the value explicitly in v2's code | Change the default |
| Add a required request field | Accept it as optional, derive or default it for old clients | Require it only when no client in use omits it |
| Rename or remove a response field, change the wrapper | Add the new field next to the old one; a new shape gets a new endpoint or version | Remove old once no client in use reads it |
| Change validation, defaults, pagination, sorting, status codes, error format | Keep old behavior for old callers (version, opt-in parameter, or accept both); new behavior on new input or a new endpoint | Retire the old path once no client in use depends on it |
| New or renamed env var | Read new, fall back to old or a safe default; fail only in the code path that needs it | Remove the fallback |
| Cache value shape | New key prefix or version (`user:v2:{id}`) | Old keys expire |
| Queue / event / webhook payload | Additive fields only; deploy consumers before producers; incompatible payload → new queue, topic or job name | Remove old fields |
| JWT / session claim | Issue old and new claims; readers accept both | Drop old after the longest token or session lifetime |
| Field changes meaning | New field; never reuse an existing one with a new meaning | — |
| Backfill data | Batched, idempotent, resumable, safe under live traffic | — |
