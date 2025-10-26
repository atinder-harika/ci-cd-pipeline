# Matrix Builds

**Status:** ✅ Complete

---

## What are Matrix Builds?

Matrix builds allow you to **test the same code across multiple environments in parallel**. Instead of running tests sequentially on different OS/version combinations, GitHub Actions creates multiple jobs that run simultaneously.

**Example:** Testing on 3 operating systems × 3 Node versions = 9 jobs running in parallel!

### Without Matrix (Sequential Testing)
```
Test on Ubuntu Node 20   → 3 minutes
Test on Ubuntu Node 22   → 3 minutes  
Test on Windows Node 20  → 4 minutes
Test on Windows Node 22  → 4 minutes
Total: 14 minutes 😴
```

### With Matrix (Parallel Testing)
```
All 4 jobs run simultaneously
Total: 4 minutes (longest job) ⚡
```

**Benefits:**
- ✅ Catch OS-specific bugs (Windows vs Linux path separators)
- ✅ Verify version compatibility (Node 20 vs 22 breaking changes)
- ✅ Faster feedback (parallel execution)
- ✅ Confidence in multi-platform support

---

## Matrix Syntax

### Basic Structure

```yaml
jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [20, 22]
        # Creates 6 jobs: 3 OS × 2 Node versions
```

**How it works:**
- GitHub Actions creates a **Cartesian product** (all combinations)
- Each combination becomes a separate job
- Jobs run in parallel (subject to runner availability)

**Accessing matrix values:**
```yaml
${{ matrix.os }}           # ubuntu-latest, windows-latest, etc.
${{ matrix.node-version }} # 20, 22, etc.
```

---

## Advanced Techniques

### Excluding Combinations

**Use case:** Skip expensive/unsupported combinations

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]
    node-version: [18, 20, 22]
    exclude:
      - os: macos-latest
        node-version: 18  # ❌ Don't test macOS on Node 18
      - os: macos-latest
        node-version: 20  # ❌ Don't test macOS on Node 20
```

**Result:** 9 possible jobs - 2 excluded = **7 jobs**

**⚠️ Common Mistake:**
```yaml
exclude:
  - os: macos-latest
    node-version: [18, 20]  # ❌ WRONG! Arrays don't work in exclude
```

**✅ Correct approach:** List each combination separately
```yaml
exclude:
  - os: macos-latest
    node-version: 18
  - os: macos-latest
    node-version: 20
```

---

### Including Combinations

**Use case:** Add specific combinations outside the main matrix

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest]
    node-version: [20, 22]
    # Creates 4 jobs: 2 OS × 2 versions
    
    include:
      - os: macos-latest
        node-version: 22  # ➕ Add ONE extra combo
```

**Result:** 4 base jobs + 1 included = **5 jobs**

**You can add custom variables in includes:**
```yaml
include:
  - os: ubuntu-latest
    node-version: 20
    experimental: true  # Custom flag
  - os: windows-latest
    node-version: 22
    arch: x86  # Another custom variable
```

Access with: `${{ matrix.experimental }}`, `${{ matrix.arch }}`

---

### Combining Exclude and Include

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest]
    node-version: [20, 22]
    include:
      - os: macos-latest
        node-version: 22  # macOS only on latest (cost optimization)
```

---

### Fail-Fast Strategy

Controls whether to cancel remaining jobs when one fails:

```yaml
strategy:
  fail-fast: false  # Run all jobs even if one fails
  matrix:
    # ...
```

**When to use:**
- `fail-fast: true` (default) - Fast feedback, save CI minutes
- `fail-fast: false` - See all failures, better for debugging

---

## My Configuration

```yaml
strategy:
  fail-fast: false
  matrix:
    os: [ubuntu-latest, windows-latest]
    node-version: [20, 22]
    include:
      - os: macos-latest
        node-version: 22
```

**Result:** 5 jobs (ubuntu × 2, windows × 2, macos × 1)

**Rationale:**
- Test popular platforms (Ubuntu, Windows)
- Test LTS + current (Node 20, 22)
- Minimize macOS jobs (10× cost)
- fail-fast: false (see all results)

---

## Mistakes & Lessons

### Error #1: Array Syntax in Exclude

**Problem:** Tried to use arrays in exclude

```yaml
exclude:
  - os: macos-latest
    node-version: [18, 20]  # ❌ WRONG!
```

**Fix:** List each combination separately
```yaml
exclude:
  - os: macos-latest
    node-version: 18
  - os: macos-latest
    node-version: 20
```

**Lesson:** Exclude requires individual combinations, not arrays!

---

### Discovery: Node 18 Incompatibility

**Problem:** All Node 18 matrix jobs failed with:
```
TypeError: Cannot read properties of undefined (reading 'get')
at webidl-conversions/lib/index.js:325:94
```

**Root cause:** Vitest 4.x requires Node.js 18.12+ or 20+. Early Node 18 versions have `structuredClone` bugs.

**Decision:** Dropped Node 18 support

**Reasoning:**
- Node 18 entering maintenance mode (October 2024)
- Vitest 4.x requires Node 20+ for full compatibility
- Node 20 is current LTS
- Simpler matrix (5 jobs vs 7) = faster builds

**Lesson:** Matrix testing reveals real compatibility issues before users encounter them!

---

## Quick Reference

### Common Patterns

**Cost-optimized matrix:**
```yaml
matrix:
  os: [ubuntu-latest, windows-latest]  # Most common OSes
  node-version: [20, 22]                # LTS + current
  include:
    - os: macos-latest                  # Limited macOS testing
      node-version: 22
```

**Parallel build optimization:**
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
    steps:
      - uses: actions/download-artifact@v4
      - run: npm test  # Test same build on all OSes
```

**Result:** 1 build + 3 parallel tests = much faster than 3 complete builds

### Matrix Limits
```yaml
Maximum jobs per matrix: 256
GitHub Actions concurrency: 20 jobs (free tier)
macOS cost: 10× Ubuntu runners
Cache retention: 7 days default
```

---

## Key Takeaways

1. **Parallel Execution** - Matrix creates independent jobs that run simultaneously
2. **Cartesian Product** - All combinations created automatically (3 OS × 2 versions = 6 jobs)
3. **Exclude Syntax** - Each exclusion listed separately (no arrays!)
4. **Cost Optimization** - macOS runners are 10× more expensive than Ubuntu
5. **Fail-Fast Strategy** - Choose based on debugging needs vs cost
6. **Compatibility Testing** - Discovered Node 18 issue before production
7. **Build Once Pattern** - Share artifacts across matrix jobs for efficiency

---

## Questions I Can Now Answer

**Q: How do I test on 3 OS but only 1 Node version on macOS?**
```yaml
matrix:
  os: [ubuntu-latest, windows-latest]
  node-version: [20, 22]
  include:
    - os: macos-latest
      node-version: 22
```

**Q: Why do some jobs show "Canceled" status?**  
**A:** `fail-fast: true` is enabled (default). One job failed → GitHub canceled remaining jobs. Set `fail-fast: false` to see all results.

**Q: Can I pass custom variables through the matrix?**  
**A:** Yes! Use `include` to add custom properties:
```yaml
include:
  - os: ubuntu-latest
    node-version: 20
    custom-flag: 'production'
# Access: ${{ matrix.custom-flag }}
```

**Q: What's the maximum number of matrix jobs?**  
**A:** GitHub Actions limit: 256 jobs per matrix. Practical limit: 10-20 jobs (cost/queue time).

---

**Next:** [Artifacts & Dependencies →](03-artifacts-dependencies.md)