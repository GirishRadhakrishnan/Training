# GIT.md
Four cumulative linear branches: day1 -> day2 -> day3 -> day4 (9, +10, +7, +8 topics + project). Differing files per branch: package.json,
vite.config.ts, src/main.tsx, src/App.tsx, README.md.
Trainer: git switch dayN; npm install; npm run dev. Trainees work on personal branches (git switch -c <name>/day1-task), never on dayN.
Changing content: edit on the EARLIEST branch the file belongs to, run npm run build, commit, then
git switch day3 && git rebase day2; git switch day4 && git rebase day3. On conflicts keep the later branch's version of the five files above.
Never merge dayN into dayN+1. Push with --force-with-lease only.
Commit messages: "Day <n>: <change>", "Fix: ...", "Docs: ...", "Chore: ..." (present tense, under 72 chars).
Rules: never commit node_modules, dist, .env. Every branch must build. Day 1 trainees must not see later-day code. Tag a tested release: git tag course-2026-11 day4.
Release check: for b in day1 day2 day3 day4; do git switch $b && npm install && npm run build; done
