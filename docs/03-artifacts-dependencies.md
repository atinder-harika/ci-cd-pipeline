# Artifacts & Job Dependencies

**Status:** ✅ Complete

---

## What are Artifacts?

**Artifacts** are files produced by your workflow that persist after jobs complete:
- Build outputs (`dist/`, `.jar` files)
- Test reports (coverage, screenshots)
- Logs and diagnostic data

**Limits:** 500 MB per artifact, 90 days default retention

---

## Artifact Syntax

### Upload Artifacts

```yaml
- uses: actions/upload-artifact@v4
  with:
    name: frontend-build
    path: frontend/dist/
    retention-days: 7  # Default: 90 days
```

### Download Artifacts

```yaml
- uses: actions/download-artifact@v4
  with:
    name: frontend-build
    path: ./dist
```

---

## Job Dependencies

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

**Flow:**
```
build ─┐
       ├─→ deploy (only if both succeed)
test ──┘
```

**Benefits:**
- ✅ Build and test run in parallel (faster feedback)
- ✅ Deploy only if all tests pass (safety)
- ✅ Artifact preservation (download builds for inspection)

---

## Build Once, Test Many Pattern

Share build artifact across matrix jobs for efficiency:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
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
      - run: npm test  # Tests same build on 6 environments
```

**Result:** 1 build (2 min) + 6 test jobs (30s each) = **2m 30s**  
**vs:** Building in each job = **12 minutes**

---

## Mistakes & Lessons

### Error #1: Artifact Download Path

**Problem:** Expected artifact to download into subdirectory

```yaml
- uses: actions/download-artifact@v4
  with:
    name: frontend-build
- run: ls frontend-build/  # ❌ Fails! No such directory
```

**Lesson:** Artifacts download to **current directory** by default, not a subdirectory!

**Fix:** Specify path explicitly
```yaml
- uses: actions/download-artifact@v4
  with:
    name: frontend-build
    path: ./frontend-build  # ✅ Creates subdirectory
- run: ls frontend-build/  # ✅ Works!
```

---

## When to Use Multi-Job Pipelines

**Use separate jobs when:**
- ✅ Build and test can run in parallel (faster)
- ✅ Need to share artifacts with multiple jobs (matrix testing)
- ✅ Want deployment gates (deploy only if all tests pass)
- ✅ Different jobs need different runners (Linux build, Windows test)

**Use single job when:**
- ✅ Simple projects (tests < 1 minute)
- ✅ Steps must run sequentially
- ✅ No need to preserve build output

---

## Quick Reference

### Common Patterns

**Multi-stage with conditional deploy:**
```yaml
jobs:
  build:
    # ...
  test:
    # ...
  deploy:
    needs: [build, test]
    if: github.ref == 'refs/heads/main'  # Only on main branch
```

**Parallel builds:**
```yaml
jobs:
  frontend:
    # Runs immediately
  backend:
    # Runs in parallel with frontend
  deploy:
    needs: [frontend, backend]  # Waits for BOTH
```

### Context Variables
```yaml
${{ github.ref }}             # Branch ref (refs/heads/main)
${{ github.event_name }}      # push, pull_request, etc.
${{ success() }}              # Previous jobs succeeded
${{ failure() }}              # Previous jobs failed
```

---

## Key Takeaways

1. **Artifacts** - Share build outputs between jobs or preserve for download
2. **Job Dependencies** - Use `needs` to control execution order
3. **Parallel Execution** - Jobs without `needs` run simultaneously (faster CI)
4. **Deployment Gates** - Combine `needs` + `if` for safe deployments
5. **Build Once Pattern** - Upload artifact once, download in multiple jobs
6. **Download Path** - Artifacts extract to current directory unless path specified

---

## Questions I Can Now Answer

**Q: What if `test` fails but `build` succeeds?**  
**A:** `deploy` **will not run** because `needs: [build, test]` requires ALL dependencies to succeed.

**Q: Why separate build and test into different jobs?**  
**A:** 
1. They can run **in parallel** (faster feedback)
2. Can reuse build artifact in **matrix test jobs** (build once, test on 6 environments)
3. Clear separation of concerns (easier to debug which stage failed)

**Q: How long are artifacts stored?**  
**A:** **90 days** by default, or custom via `retention-days: 7` (saves storage costs).

**Q: Can I download artifacts locally?**  
**A:** Yes! Go to Actions → Workflow run → Artifacts section → Download ZIP.

---

**Next:** [Backend Maven CI →](04-backend-maven-ci.md)