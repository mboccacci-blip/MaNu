# Lessons Record

Entries should follow the format:
- **Mistake/Feedback**: Describe what happened.
- **Root Cause**: Why did it go wrong?
- **Correction Pattern**: How to prevent this in the future (rule or code pattern).

---

### Lesson #1 — 2026-03-20
- **Mistake/Feedback**: Delivered a deep analysis of the project informe without first checking for and applying the project's own workflow framework (`/senior-orchestration`). The user had to ask if I was using it.
- **Root Cause**: The workflow file didn't exist in the workspace at that point, but I also didn't proactively ask about established frameworks or check for `.agent/workflows/` early. I assumed the project had no operational guidelines beyond the docs I found.
- **Correction Pattern**: At the start of ANY session on this project, always:
  1. Read `tasks/lessons.md` first (Self-Improvement Loop, rule #3)
  2. Read `.agent/workflows/senior-orchestration.md` to load operational framework
  3. Check `tasks/todo.md` for pending work
  4. Only then begin any analysis or execution

### Lesson #2 — 2026-03-23
- **Mistake/Feedback**: Iterated through 6 versions of a PDF cleaning script and fought a crashing browser tool without consulting the user, when simpler paths existed (asking user to check browser, asking if original .jsx exists, etc.).
- **Root Cause**: Over-engineering workarounds instead of recognizing when a blocker calls for human intervention.
- **Correction Pattern**: When hitting a difficulty:
  1. **Missing/broken tools** (browser crash, missing CLI) → Ask the user immediately.
  2. **Environmental issues** (missing installs, permissions) → Consult before trying complex bypasses.
  3. **Diminishing returns** (2+ failed attempts at same problem) → Stop, explain the blocker, ask for input.
  General rule: **If the same type of error appears 2+ times, escalate to the user.**

### Lesson #3 — 2026-03-24
- **Mistake/Feedback**: Re-ran the JSX cleaning script at the start of a new session, breaking an App.jsx that was already verified working in the previous session. Then spent hours fixing cascading parse errors one by one instead of stopping.
- **Root Cause**: Did not verify the current state before making changes. Assumed the cleaning script needed to run again.
- **Correction Pattern**:
  1. **Never re-run a cleaning/transform script on a file that was previously verified working** without an explicit reason.
  2. **Before ANY modification to App.jsx, run Babel parse check first** to know baseline state.
  3. **If the same class of error keeps appearing after 3 attempts, stop and ask the user.**
  4. **Prefer dev mode verification over build mode** — Vite dev is more tolerant and matches actual user experience.
