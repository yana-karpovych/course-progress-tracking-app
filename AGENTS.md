# Agent instructions (Cursor)

Read before coding:

1. `REQUIREMENTS.md` — stack, API, UI state rules (section 6)
2. `STEP3-DRAFT-GUIDE.md` — current phase and prompts

Workflow:

- Use **executing-plans**: one step only, stop for manual verification
- Use **verification-before-completion**: give browser or PowerShell checks
- Use **systematic-debugging** only when user pastes errors
- Do NOT use: brainstorming, writing-plans, TDD, parallel agents (plan exists)

Superpowers plugin is enabled in this project — follow step-by-step execution.

Windows: API tests use `Invoke-RestMethod`, not bash `curl`.
