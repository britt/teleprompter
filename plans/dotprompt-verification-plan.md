# Verification Plan

## Prerequisites

- Node.js v16+ installed
- `npm install` completed with all dependencies (including new `dotprompt` or `js-yaml`)
- Wrangler CLI available (`npx wrangler`)
- A working `wrangler.toml` (or wrangler dev defaults) that binds `PROMPTS` Durable Object and at least one Queue (`RL_PUBLISH_FEED`)
- No existing prompts in the local dev Durable Object (fresh state), OR willingness to use unique prompt IDs per test run
- `jq` installed for JSON inspection
- `curl` available

## Scenarios

### Scenario 1: Implementation Plan — Dependency Compatibility

**Context**: After Task 1 (dotprompt dependency added) and Task 3 (parser built). Verify the chosen parsing approach actually works in the Cloudflare Workers runtime, not just in Node/Jest.

**Steps**:
1. Run `npx wrangler dev` to start the local Workers dev server
2. POST a prompt with dotprompt frontmatter:
   ```bash
   curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:8787/prompts \
     -H 'Content-Type: application/json' \
     -d '{
       "id": "compat-test",
       "prompt": "---\nmodel: test/model\nconfig:\n  temperature: 0.5\n---\nHello {{name}}",
       "namespace": "RL_PUBLISH_FEED"
     }'
   ```
3. Check the server logs for any runtime errors about missing modules (`fs`, `path`, `node:*`)

**Success Criteria**:
- [ ] POST returns HTTP 201 (not 500)
- [ ] No `Error: Cannot find module` or `ReferenceError` in wrangler dev console output
- [ ] The YAML parsing library (dotprompt, js-yaml, or fallback) executed successfully inside the Worker

**If Blocked**: If the Worker crashes on import, the chosen parsing library is not Workers-compatible. Stop and re-evaluate: try `js-yaml` standalone, or vendor a minimal YAML parser. Do not proceed to later scenarios until this passes.

---

### Scenario 2: Dotprompt Round-Trip — Full Metadata

**Context**: All implementation tasks complete. Worker is running via `npx wrangler dev`.

**Steps**:
1. Create a dotprompt with rich metadata:
   ```bash
   curl -X POST http://localhost:8787/prompts \
     -H 'Content-Type: application/json' \
     -d '{
       "id": "verify-roundtrip",
       "prompt": "---\nmodel: anthropic/claude-sonnet-4-20250514\nconfig:\n  temperature: 0.3\n  maxOutputTokens: 2048\ndescription: Summarizes text\ninput:\n  schema:\n    text: string\n    maxLength?: number\noutput:\n  format: json\n  schema:\n    summary: string\n    wordCount: number\ntools:\n  - search\n  - fetch\n---\n{{#role \"system\"}}\nYou are a summarizer.\n{{/role}}\n\n{{#role \"user\"}}\nSummarize this: {{text}}\n{{/role}}",
       "namespace": "RL_PUBLISH_FEED"
     }'
   ```
2. Fetch it back:
   ```bash
   curl -s http://localhost:8787/prompts/verify-roundtrip | jq .
   ```
3. Inspect every field in the response JSON.

**Success Criteria**:
- [ ] `id` is `"verify-roundtrip"`
- [ ] `prompt` field contains the full dotprompt source (frontmatter + body), not just the body
- [ ] `metadata.model` is `"anthropic/claude-sonnet-4-20250514"`
- [ ] `metadata.config.temperature` is `0.3`
- [ ] `metadata.config.maxOutputTokens` is `2048`
- [ ] `metadata.description` is `"Summarizes text"`
- [ ] `metadata.input.schema.text` is `"string"`
- [ ] `metadata.input.schema["maxLength?"]` is `"number"` (or `maxLength` with optional marker — check actual picoschema handling)
- [ ] `metadata.output.format` is `"json"`
- [ ] `metadata.output.schema.summary` is `"string"`
- [ ] `metadata.tools` is `["search", "fetch"]`
- [ ] `version` is a recent UNIX timestamp (within last 60 seconds)
- [ ] `namespace` is `"RL_PUBLISH_FEED"`

**If Blocked**: If metadata fields are missing or wrong, check parser output. Run `parseDotprompt()` against the same input in a Jest test to isolate whether the bug is in parsing or storage.

---

### Scenario 3: Backward Compatibility — Plain Mustache Template

**Context**: Worker running. Verify that prompts without frontmatter still work exactly as before.

**Steps**:
1. Create a plain Mustache-style prompt (no `---` frontmatter):
   ```bash
   curl -X POST http://localhost:8787/prompts \
     -H 'Content-Type: application/json' \
     -d '{
       "id": "verify-legacy",
       "prompt": "Hello {{name}}, welcome to {{place}}! Your code is:\n{{code}}",
       "namespace": "RL_PUBLISH_FEED"
     }'
   ```
2. Fetch it:
   ```bash
   curl -s http://localhost:8787/prompts/verify-legacy | jq .
   ```
3. List all prompts and confirm the legacy prompt appears alongside dotprompt ones:
   ```bash
   curl -s http://localhost:8787/prompts | jq '.[].id'
   ```

**Success Criteria**:
- [ ] POST returns 201
- [ ] `prompt` field is exactly `"Hello {{name}}, welcome to {{place}}! Your code is:\n{{code}}"` (no frontmatter injected)
- [ ] `metadata` is `{}` (empty object, not `null`, not missing)
- [ ] `version` and `namespace` are correct
- [ ] The prompt appears in the list alongside any dotprompt-formatted prompts

**If Blocked**: If `metadata` is `null` or absent, check `toPrompt` — it should default to `{}` when the metadata column is NULL or empty.

---

### Scenario 4: Validation — Malformed Frontmatter Rejection

**Context**: Worker running. Verify that invalid YAML in frontmatter is caught at write time.

**Steps**:
1. POST a prompt with broken YAML:
   ```bash
   curl -s -w "\n%{http_code}" -X POST http://localhost:8787/prompts \
     -H 'Content-Type: application/json' \
     -d '{
       "id": "verify-bad-yaml",
       "prompt": "---\nbad: [yaml: unclosed bracket\n  indentation: wrong\n---\nHello {{name}}",
       "namespace": "RL_PUBLISH_FEED"
     }'
   ```
2. Attempt to fetch it (should not exist):
   ```bash
   curl -s -w "\n%{http_code}" http://localhost:8787/prompts/verify-bad-yaml
   ```
3. POST a prompt whose frontmatter parses as a non-object (e.g. a bare string):
   ```bash
   curl -s -w "\n%{http_code}" -X POST http://localhost:8787/prompts \
     -H 'Content-Type: application/json' \
     -d '{
       "id": "verify-non-object",
       "prompt": "---\njust a string not a mapping\n---\nHello",
       "namespace": "RL_PUBLISH_FEED"
     }'
   ```

**Success Criteria**:
- [ ] First POST returns HTTP 400 (not 201, not 500)
- [ ] Response body contains `"error"` and `"detail"` fields explaining the YAML issue
- [ ] GET for `verify-bad-yaml` returns 404 or throws (prompt was never stored)
- [ ] Non-object frontmatter POST also returns 400
- [ ] No server crash or unhandled exception in wrangler dev logs

**If Blocked**: If the POST returns 201, validation is not wired into the handler. Check that `validateDotprompt` is called before `prompts.write()` in the POST route.

---

### Scenario 5: Version History Preserves Metadata

**Context**: Worker running with the `verify-roundtrip` prompt from Scenario 2 already stored.

**Steps**:
1. Update the existing prompt with different metadata:
   ```bash
   curl -X POST http://localhost:8787/prompts \
     -H 'Content-Type: application/json' \
     -d '{
       "id": "verify-roundtrip",
       "prompt": "---\nmodel: openai/gpt-4o\nconfig:\n  temperature: 0.9\n---\nNew template body: {{text}}",
       "namespace": "RL_PUBLISH_FEED"
     }'
   ```
2. Fetch current version:
   ```bash
   curl -s http://localhost:8787/prompts/verify-roundtrip | jq '.metadata.model'
   ```
3. Fetch version history:
   ```bash
   curl -s http://localhost:8787/prompts/verify-roundtrip/versions | jq '.[] | {version, model: .metadata.model}'
   ```

**Success Criteria**:
- [ ] Current prompt shows `metadata.model` = `"openai/gpt-4o"` (the updated value)
- [ ] Version history has at least 2 entries
- [ ] Oldest version in history shows `metadata.model` = `"anthropic/claude-sonnet-4-20250514"` (original)
- [ ] Newest version shows `metadata.model` = `"openai/gpt-4o"`
- [ ] Each version has its own `metadata` object (not shared or null)

**If Blocked**: If version history shows `null` metadata, check the `INSERT INTO prompt_versions` SQL — it must include the metadata column.

---

### Scenario 6: Rollback Preserves Metadata

**Context**: Worker running. `verify-roundtrip` prompt has 2+ versions from Scenario 5.

**Steps**:
1. Get the version timestamp of the original (older) version:
   ```bash
   ORIGINAL_VERSION=$(curl -s http://localhost:8787/prompts/verify-roundtrip/versions | jq '.[-1].version')
   echo "Rolling back to version: $ORIGINAL_VERSION"
   ```
2. Rollback to original version:
   ```bash
   curl -s -w "\n%{http_code}" -X POST "http://localhost:8787/prompts/verify-roundtrip/versions/$ORIGINAL_VERSION"
   ```
3. Fetch current state after rollback:
   ```bash
   curl -s http://localhost:8787/prompts/verify-roundtrip | jq '{model: .metadata.model, prompt: .prompt[:50]}'
   ```

**Success Criteria**:
- [ ] Rollback POST returns HTTP 200
- [ ] After rollback, `metadata.model` is `"anthropic/claude-sonnet-4-20250514"` (the original value)
- [ ] After rollback, `prompt` field contains the original dotprompt source (with the original frontmatter)
- [ ] A new version entry was created in the history (rollback doesn't erase versions)

**If Blocked**: If metadata reverts but prompt body doesn't (or vice versa), the rollback handler is reading `prompt` from the old version but not re-parsing metadata. Check that `write()` re-parses the prompt text on every write, including rollback writes.

---

### Scenario 7: Delete Behavior Unchanged

**Context**: Worker running.

**Steps**:
1. Create a throwaway prompt:
   ```bash
   curl -X POST http://localhost:8787/prompts \
     -H 'Content-Type: application/json' \
     -d '{
       "id": "verify-delete",
       "prompt": "---\nmodel: test\n---\nDelete me",
       "namespace": "RL_PUBLISH_FEED"
     }'
   ```
2. Verify it exists:
   ```bash
   curl -s http://localhost:8787/prompts/verify-delete | jq .id
   ```
3. Delete it:
   ```bash
   curl -s -w "\n%{http_code}" -X DELETE http://localhost:8787/prompts/verify-delete
   ```
4. Verify it's gone:
   ```bash
   curl -s -w "\n%{http_code}" http://localhost:8787/prompts/verify-delete
   ```

**Success Criteria**:
- [ ] Create returns 201
- [ ] Prompt exists with correct metadata before deletion
- [ ] Delete returns 200
- [ ] GET after delete returns 404 or an error (prompt no longer in current table)

**If Blocked**: If delete fails with a SQL error, the DELETE SQL may not account for the new metadata column. Check `delete()` method.

---

### Scenario 8: List Endpoint Returns Metadata for All Prompts

**Context**: Worker running with multiple prompts stored (mix of dotprompt and plain).

**Steps**:
1. Ensure at least one dotprompt and one plain prompt exist (from Scenarios 2 and 3)
2. List all:
   ```bash
   curl -s http://localhost:8787/prompts | jq '.[] | {id, has_metadata: (.metadata | length > 0)}'
   ```

**Success Criteria**:
- [ ] Every prompt in the list has a `metadata` field (never `null` or missing)
- [ ] Dotprompt-formatted prompts have populated metadata objects
- [ ] Plain-text prompts have `metadata: {}`
- [ ] Response is valid JSON array
- [ ] `Content-Type` header is `application/json`

**If Blocked**: If any prompt has `null` metadata, the `toPrompt` function's null-handling is broken.

---

### Scenario 9: Edge Cases — Frontmatter Boundary Patterns

**Context**: Worker running. Test tricky inputs that could break the frontmatter regex.

**Steps**:
1. Prompt with `---` in the body (not as frontmatter):
   ```bash
   curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:8787/prompts \
     -H 'Content-Type: application/json' \
     -d '{
       "id": "verify-dashes-body",
       "prompt": "Draw a line:\n---\nEnd of line.",
       "namespace": "RL_PUBLISH_FEED"
     }'
   ```
   Then fetch: `curl -s http://localhost:8787/prompts/verify-dashes-body | jq .metadata`
2. Prompt with Windows-style line endings (CRLF) in frontmatter:
   ```bash
   curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:8787/prompts \
     -H 'Content-Type: application/json' \
     -d "{\"id\": \"verify-crlf\", \"prompt\": \"---\\r\\nmodel: test\\r\\n---\\r\\nHello\", \"namespace\": \"RL_PUBLISH_FEED\"}"
   ```
   Then fetch: `curl -s http://localhost:8787/prompts/verify-crlf | jq .metadata`
3. Prompt that is just frontmatter with no body:
   ```bash
   curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:8787/prompts \
     -H 'Content-Type: application/json' \
     -d '{
       "id": "verify-no-body",
       "prompt": "---\nmodel: test/no-body\n---\n",
       "namespace": "RL_PUBLISH_FEED"
     }'
   ```
   Then fetch: `curl -s http://localhost:8787/prompts/verify-no-body | jq '{model: .metadata.model, template_length: (.prompt | length)}'`

**Success Criteria**:
- [ ] `verify-dashes-body`: 201, metadata is `{}` (the `---` is not at the start, so no frontmatter detected)
- [ ] `verify-crlf`: 201, metadata.model is `"test"` (CRLF handled by the frontmatter regex)
- [ ] `verify-no-body`: 201, metadata.model is `"test/no-body"`, prompt stored successfully even with empty body

**If Blocked**: If `---` in body text triggers frontmatter parsing, the regex needs anchoring to `^---`. If CRLF breaks parsing, the regex needs `\r?\n` support. These are bugs in the parser.

---

### Scenario 10: Implementation Plan Audit

**Context**: All code written. Verify the plan's claims match reality.

**Steps**:
1. Check that `mustache` is no longer in dependencies:
   ```bash
   node -e "const p = require('./package.json'); console.log('mustache dep:', p.dependencies?.mustache ?? 'REMOVED'); console.log('mustache devDep:', p.devDependencies?.['@types/mustache'] ?? 'REMOVED')"
   ```
2. Check that `mustache` is not imported anywhere in source:
   ```bash
   grep -r "mustache" src/ && echo "FAIL: mustache still referenced" || echo "PASS: no mustache refs"
   ```
3. Verify the new files exist:
   ```bash
   ls -la src/types.ts src/parser.ts src/__tests__/parser.test.ts src/__tests__/types.test.ts
   ```
4. Verify the metadata column exists in both table DDLs:
   ```bash
   grep -n "metadata" src/index.ts
   ```
5. Verify `ALTER TABLE` migration is present:
   ```bash
   grep -n "ALTER TABLE" src/index.ts
   ```
6. Run the full test suite:
   ```bash
   npx jest --verbose 2>&1
   ```
7. Verify TypeScript compiles cleanly:
   ```bash
   npx tsc --noEmit 2>&1
   ```

**Success Criteria**:
- [ ] `mustache` not in `package.json` dependencies or devDependencies
- [ ] No `mustache` imports or requires in `src/`
- [ ] `src/types.ts` exists and exports `PromptMetadata` and `ParsedDotprompt`
- [ ] `src/parser.ts` exists and exports `parseDotprompt` and `validateDotprompt`
- [ ] `src/__tests__/parser.test.ts` exists with tests for parsing and validation
- [ ] `src/index.ts` contains `metadata TEXT` in both CREATE TABLE statements
- [ ] `src/index.ts` contains ALTER TABLE migrations for both tables
- [ ] All Jest tests pass
- [ ] TypeScript compiles with no errors
- [ ] Plan claimed backward compat — Scenario 3 passed
- [ ] Plan claimed validation — Scenario 4 passed
- [ ] Plan claimed version history preservation — Scenario 5 passed
- [ ] Plan claimed rollback works — Scenario 6 passed

**If Blocked**: If `tsc` fails, there are likely type mismatches between the local `Prompt` type extension and the SDK types. Resolve by checking the intersection type in `src/index.ts`.

---

## Verification Rules

- Never use mocks or fakes
- Test environments must be fully running copies of real systems
- If any success criterion fails, verification fails
- Ask developer for help if blocked, don't guess
- All scenarios must be run against `npx wrangler dev` (real Workers runtime), not just Jest
- Scenarios 1-9 must run in order (later ones depend on data from earlier ones)
- Scenario 10 can run independently at any time
