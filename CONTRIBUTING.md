## Commit Conventions

This project uses the Conventional Commits format:

`<type>(<scope>): <short description>`

Common types:
- `feat` — new feature
- `fix` — bug fix
- `chore` — maintenance, config, tooling
- `docs` — documentation only
- `refactor` — code change that is not a fix or feature
- `test` — adding or updating tests
- `style` — formatting only, no logic change

Examples:
- `feat(auth): add JWT middleware for protected routes`
- `fix(prisma): resolve connection timeout on cold start`
- `docs(readme): add setup instructions`
- `refactor(items): extract save logic into service`
- `test(auth): add unit tests for password hashing`

Guidelines:
- Keep the subject line under 72 characters
- Use imperative mood, such as `add` or `fix`
- Use lowercase after the colon
- Do not end the subject with a period

## Comment and Pseudocode Guidelines

Use comments to improve clarity, not to narrate obvious code.

Guidelines:
- Comment **why**, not just **what**
- Use comments only for **non-obvious logic**
- Prefer **short comments above a block** over line-by-line commentary
- Keep comments **brief, specific, and direct**
- Use comments for **flow, intent, business rules, edge cases, and security-sensitive behavior**
- Avoid comments that simply **repeat the code**
- Prefer **clear names** before adding extra comments
- Remove temporary learning comments before considering a file finished
- Keep comment style **consistent** across the project
- Update comments when code changes so they do not become stale
- If a section needs too much explanation, consider extracting a helper function


## Pull Request Description Format

When opening a pull request, use the following format:

```md
## Summary

Briefly explain what this pull request does.

## Changes

- List the main changes made in this PR
- Keep each bullet short and specific
- Focus on what changed, not every tiny implementation detail

## Testing

- Explain how the change was tested
- If no tests were run, explain why
```

### Example

```md
## Summary

Adds a Git workflow practice section to the README.

## Changes

- Documents the engineer workflow
- Documents the reviewer workflow
- Adds cleanup steps after merge

## Testing

- Not run; documentation-only change
```
