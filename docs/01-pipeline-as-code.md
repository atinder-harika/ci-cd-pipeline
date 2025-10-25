# Pipeline as Code (PaC)

**Date Started:** October 25, 2024  
**Status:** ✅ Basic workflow working

---

## What is Pipeline as Code?

[Your explanation - explain it in your own words like you're teaching someone else]

---

## My First Workflow: `frontend-ci.yml`

### What It Does
- Triggers on: push/PR to main and development branches
- Runs on: Ubuntu Linux (latest)
- Steps:
  1. Checks out code from GitHub
  2. Sets up Node.js v20
  3. Installs dependencies (`npm ci`)
  4. Runs tests (`npm test`)
  5. Builds the app (`npm run build`)

### Why These Steps Matter

**`npm ci` vs `npm install`:**
- [Explain the difference - look it up if you don't know!]
- Why I use `npm ci` in CI: [Your reasoning]

**Working Directory:**
- Why I needed `working-directory: frontend`: [Explain]
- What happens without it: [Explain]

---

## Mistakes I Made

### Error #1: Wrong Working Directory Path
**Problem:** Initially set `working-directory: src` but my folder was `frontend/`

**Error Message:**
```
Error: An error occurred trying to start process '/usr/bin/bash' with 
working directory '/home/runner/work/ci-cd-pipeline/ci-cd-pipeline/src'. 
No such file or directory
```

**What I Learned:**
- `working-directory` must match actual folder structure
- The `defaults.run.working-directory` only applies to `run:` steps, not `uses:` actions
- `actions/checkout` creates the folder structure; subsequent steps navigate into it

**Fix:** Changed to `working-directory: frontend`

---

## Key Concepts

### 1. YAML Structure
```yaml
name: Workflow name
on: Trigger events
jobs:
  job-name:
    runs-on: Operating system
    steps:
      - name: Step description
        uses: Pre-built action OR
        run: Shell command
```

### 2. Triggers (`on:`)
- `push`: Runs when code is pushed to specified branches
- `pull_request`: Runs when PR is opened/updated
- `workflow_dispatch`: Adds manual trigger button

### 3. Runners (`runs-on:`)
- `ubuntu-latest`: Linux VM (most common, fastest)
- `windows-latest`: Windows VM
- `macos-latest`: macOS VM

### 4. Actions (`uses:`) vs Commands (`run:`)
- `uses:`: Pre-built reusable actions (JavaScript/Docker)
- `run:`: Shell commands executed in the runner

---

## Questions I Can Now Answer

**Q: Why doesn't `actions/checkout` need `working-directory`?**  
A: [Your answer]

**Q: What happens if a test fails?**  
A: [Try breaking a test and see! Document the result]

**Q: Can I run multiple jobs in parallel?**  
A: [Research this for next phase]

---

## Next Steps
- [ ] Add dependency caching to speed up builds
- [ ] Understand how to run jobs in parallel
- [ ] Learn about matrix builds (test multiple Node versions)