# Pipeline as Code

**Status:** ✅ Complete

---

## What is Pipeline as Code?

Defining CI/CD pipelines as version-controlled configuration files (YAML) stored alongside source code. This makes builds reproducible, auditable, and enables collaboration through pull requests.

---

## GitHub Actions Fundamentals

### YAML Structure
```yaml
name: Workflow name
on: [push, pull_request]        # Triggers
jobs:
  job-name:
    runs-on: ubuntu-latest      # Runner OS
    steps:
      - uses: actions/checkout@v4   # Pre-built action
      - run: npm test               # Shell command
```

### Key Concepts

**Triggers (`on`):**
- `push`: Runs on code pushes to specified branches
- `pull_request`: Runs on PR creation/updates
- `workflow_dispatch`: Manual trigger button in GitHub UI

**Runners (`runs-on`):**
- `ubuntu-latest` - Linux VM (fastest, most common)
- `windows-latest` - Windows VM
- `macos-latest` - macOS VM (10× cost of Ubuntu)

**Steps:**
- `uses:` - Pre-built GitHub Actions (JavaScript/Docker)
- `run:` - Shell commands executed in runner environment

---

## My First Workflow

```yaml
name: frontend-ci

on:
  push:
    branches: [main, development]
  pull_request:
    branches: [main, development]

jobs:
  test-and-build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build project
        run: npm run build
```

---

## Mistakes & Lessons

### Error #1: Wrong Working Directory
**Problem:** Set `working-directory: src` but folder was `frontend/`

**Error:**
```
No such file or directory: '/home/runner/work/ci-cd-pipeline/ci-cd-pipeline/src'
```

**Lesson:** `working-directory` must match actual folder structure. It only applies to `run:` steps, not `uses:` actions.

**Fix:** Changed to `working-directory: frontend`

---

### Understanding `npm ci` vs `npm install`

**`npm ci` (Clean Install):**
- Deletes `node_modules/` before installing
- Requires `package-lock.json` (fails without it)
- Faster in CI (no dependency resolution)
- Reproducible builds (uses exact versions from lockfile)

**`npm install`:**
- Updates `package-lock.json` if needed
- Resolves dependencies (slower)
- Used in development

**CI Rule:** Always use `npm ci` for reproducible builds!

---

## Caching Optimization

### Before Caching
```
Install dependencies: 52 seconds
```

### After Caching
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'npm'  # ← Single line enables caching!
    cache-dependency-path: frontend/package-lock.json
```

**Result:** 41 seconds (21% speedup)

### How It Works

**Cache Key:** `${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}`
- OS-specific (Linux cache won't work on Windows)
- Content-based (hash changes when dependencies change)

**Restore Keys:** Fallback for partial matches
```yaml
restore-keys: |
  ${{ runner.os }}-node-
```

**Flow:**
1. First run: No cache → Download deps → Save cache
2. Second run: Cache hit → Restore deps (5 seconds)
3. Changed `package.json`: Cache miss → Download → Save new cache

---

## Quick Reference

### Common Actions
```yaml
actions/checkout@v4           # Clone repository
actions/setup-node@v4         # Install Node.js
actions/upload-artifact@v4    # Save build outputs
actions/download-artifact@v4  # Retrieve artifacts
actions/cache@v4              # Manual caching
```

### Workflow Triggers
```yaml
on:
  push:
    branches: [main]
    paths:
      - 'src/**'              # Only run if src/ changed
  schedule:
    - cron: '0 0 * * *'       # Daily at midnight
  workflow_dispatch:          # Manual trigger
```

### Context Variables
```yaml
${{ github.ref }}             # Branch/tag ref
${{ github.sha }}             # Commit SHA
${{ runner.os }}              # Runner OS (Linux, Windows, macOS)
${{ secrets.MY_SECRET }}      # Access repository secrets
```

---

## Key Takeaways

1. **Pipeline as Code** - Version control your CI/CD configurations
2. **Working Directory** - Only applies to `run:` steps, not `uses:` actions
3. **npm ci** - Always use in CI for reproducible builds
4. **Caching** - Built-in caching in `setup-node` saves significant time
5. **Actions vs Commands** - `uses:` for reusable actions, `run:` for custom commands

---

## Questions Answered

**Q: Why doesn't `actions/checkout` need `working-directory`?**  
**A:** It's a `uses:` action (runs independently), not a `run:` command. `working-directory` only affects shell commands.

**Q: What happens if tests fail?**  
**A:** Workflow stops immediately. Subsequent steps (build, deploy) are skipped. Job status: ❌

**Q: Why use `actions/checkout@v4` instead of `git clone`?**  
**A:** Pre-configured for GitHub Actions (auth, sparse checkout, submodules). Much simpler than manual git commands.

---

**Next:** [Matrix Builds →](02-matrix-builds.md)