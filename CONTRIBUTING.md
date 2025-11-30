# Contributing to Generative Pop Song Studio

Thank you for your interest in contributing! This document outlines how to contribute, the expected workflow, and coding standards.

1. Fork the repository and create a branch
   - git checkout -b feature/short-description

2. Work locally
   - Run tests and linters before committing
   - Keep commits small and focused; follow conventional commits:
     - feat: new feature
     - fix: bug fix
     - docs: documentation only changes
     - style: formatting, missing semicolons, etc.
     - refactor: code change that neither fixes a bug nor adds a feature
     - test: adding or updating tests

3. Tests & CI
   - Add unit tests for new features
   - Make sure existing tests pass locally
   - CI runs linting, tests and basic smoke pipelines

4. Submit a pull request
   - Target branch: develop for ongoing work; main for hotfixes/urgent patches
   - Use a descriptive title and summary. Link issues if applicable.
   - Include usage notes and examples when relevant

5. Review process
   - PRs will be reviewed by maintainers
   - Address review comments and push follow-ups to the same branch
   - After all checks and reviews pass, a maintainer will merge

6. Issues
   - Search existing issues before opening new ones
   - Provide reproducible steps, environment info and logs

7. Code of Conduct
   - By contributing, you agree to follow the project's Code of Conduct.

If you want help drafting a PR or issue, ping the maintainers or open a draft PR and request review.
