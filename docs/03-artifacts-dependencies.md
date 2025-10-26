# Artifacts & Job Dependencies

**Date:** October 26, 2024  
**Status:** ✅ Complete - Multi-stage pipeline working

---

## What are Artifacts?

**Artifacts** are files produced by your workflow that persist after jobs complete:
- Build outputs (`dist/`, `.jar` files)
- Test reports (coverage, screenshots)
- Logs and diagnostic data

**Key Actions:**
```yaml
# Save files
- uses: actions/upload-artifact@v4
  with:
    name: frontend-build
    path: frontend/dist/
    retention-days: 7  # Default: 90 days

# Retrieve files in another job
- uses: actions/download-artifact@v4
  with:
    name: frontend-build
    path: ./dist
```

**Limits:** 500 MB per artifact, 90 days default retention

---

## Job Dependencies with `needs`

By default, jobs run **in parallel**. Use `needs` to create sequential workflows:

```yaml
jobs:
  build:
    # Runs immediately
  
  test:
    # Runs in parallel with build
  
  deploy:
    needs: [build, test]  # Waits for BOTH to succeed ✅
```

**Behavior:**
- If `build` fails → `deploy` is skipped ❌
- If `test` fails → `deploy` is skipped ❌
- Both must pass → `deploy` runs ✅

---

## My Multi-Stage Pipeline

### Architecture
```
┌─────────┐
│  Build  │ ← Compiles code, uploads dist/
└────┬────┘
     │
     ├──────────────┐
     ↓              ↓
┌─────────┐   ┌─────────┐
│  Test   │   │ Deploy  │ ← Downloads dist/, simulates deployment
└─────────┘   └─────────┘
(parallel)    (needs: [build, test])
```

### Benefits Over Single Job
- ✅ **Faster feedback:** Build and test run simultaneously
- ✅ **Build once, test many:** Use artifact in matrix builds
- ✅ **Deployment safety:** Only deploy if tests pass
- ✅ **Artifact preservation:** Download builds for manual inspection

---

## Build Once, Test Many Pattern

**Optimization:** Share build artifact across matrix jobs

```yaml
jobs:
  build:
    steps:
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: build
          path: dist/
  
  test:
    needs: build
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [20, 22]
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: build
      - run: npm test  # Tests the same build on 6 environments
```

**Result:** 1 build (2 min) + 6 test jobs (30s each) = **2m 30s total** (vs 12 minutes if building in each job)

---

## Key Learnings

### 1. Parallel vs Sequential Execution
- **No `needs`:** Jobs run in parallel (fastest for independent tasks)
- **With `needs`:** Jobs run sequentially (required for dependent tasks)

### 2. Conditional Execution
```yaml
deploy:
  needs: [build, test]
  if: github.ref == 'refs/heads/main'  # Only deploy from main branch
```

### 3. Artifact Management
- Uploaded artifacts appear in GitHub Actions UI (downloadable ZIP)
- Useful for debugging ("What did the build actually produce?")
- Expired artifacts are automatically deleted (retention policy)

### 4. When to Use Multi-Job Pipelines

**Use separate jobs when:**
- ✅ Build and test can run in parallel (faster CI)
- ✅ Need to share build output with multiple jobs (matrix testing)
- ✅ Want deployment gate (only deploy if all tests pass)
- ✅ Different jobs require different runners (Linux build, Windows test)

**Use single job when:**
- ✅ Simple projects (tests finish in < 1 minute)
- ✅ Steps must run sequentially anyway
- ✅ No need to preserve build output

---

## Research Answers

**Q1: What if `test` fails but `build` succeeds?**  
**A:** `deploy-preview` **will not run** because `needs: [build, test]` requires ALL dependencies to succeed.

**Q2: Why separate build and test into different jobs?**  
**A:** 
1. They can run **in parallel** (faster feedback)
2. Can reuse build artifact in **matrix test jobs** (build once, test on 6 environments)
3. Clear separation of concerns (easier to debug which stage failed)

**Q3: How to make test job use build artifact?**  
**A:** Use `actions/download-artifact@v4` in the test job to retrieve the build output instead of rebuilding.

**Q4: Artifact size limit?**  
**A:** **500 MB** per artifact (GitHub Actions limit)

**Q5: Using artifacts in matrix builds?**  
**A:** Upload artifact in one job, then download it in each matrix job using `actions/download-artifact@v4`

---

## Practical Example: My Workflow

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: frontend-build
          path: frontend/dist/

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm test

  deploy-preview:
    needs: [build, test]  # Waits for both
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: frontend-build
      - run: ls -laR  # Verify artifact downloaded
```

---

## Next Steps

- ✅ Understand artifacts and job dependencies
- ✅ Built multi-stage pipeline (build → test → deploy)
- ✅ Optimized with parallel execution
- 🔜 **Next:** Backend CI with Spring Boot & Maven

---

**Key Insight:** Jobs with `needs` create dependency graphs. GitHub Actions automatically determines optimal execution order and parallelization! 🚀