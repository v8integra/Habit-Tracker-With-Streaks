---
description: After I approve a slice (or a change like 5b), log my note, commit it, and tag it
argument-hint: <slice: 5 or 5b> <one or two sentences: what surprised you, what the AI got wrong, what you changed>
---

I just approved a slice. Save a checkpoint for it. Arguments: `$ARGUMENTS`

1. The first word of the arguments is the slice id (S): a number like `5`, or a number and a letter like `5b` for a change made between slices. Everything after it is my note. Use my note word for word.
2. Find the title:
   - For a number, use slice S's title from the "Build slices" section of the plan file (`*-plan.md`).
   - For a number and a letter, use the title from that line under "Changes during the build" at the end of the plan. If the line isn't there, stop and tell me; don't commit.
3. If `package.json` has a `test` script, run the tests once (`npm test -- --run`) and record how many passed and failed. If there are no tests yet, write "No tests yet".
4. Append this section to the end of `build-log.md`, filling in the brackets:

   ```md
   ## Slice S · [title]
   - Date: [today, YYYY-MM-DD]
   - My note: [my note, word for word]
   - What changed: [2–4 short bullets, from `git status` and `git diff --stat`]
   - Plan changes: [the plan lines added or changed in this checkpoint, or "None"]
   - Tests: [result from step 3]
   ```

5. Commit everything: `git add -A`, then `git commit -m "Slice S: [title]"`. Then tag it: `git tag slice-S`.
6. Reply with only the short commit hash and the tag. Don't change any other files, and don't start the next slice.
