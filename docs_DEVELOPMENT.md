# Development Guidelines

## Branching strategy

- main: production-ready
- develop: integration and staging for next release
- feature/*: new features and experiments
- fix/*: bug fixes and urgent patches

## Local setup

1. Create virtualenv and install dependencies
2. Install dev tools (pre-commit hooks)
3. Run `pytest` and linters before committing

## Formatting & linting

- Python: black + isort + flake8
- JS/TS: prettier + eslint (if applicable)
- Configure pre-commit hooks via .pre-commit-config.yaml

## Tests

- Unit tests under tests/
- Integration tests for pipeline components should mock heavy model runtime where possible
- CI runs tests on PRs and main branch

## Commits & PRs

- Use Conventional Commits
- Keep PRs focused and small
- Include test coverage for new code