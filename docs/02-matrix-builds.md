# Matrix Builds

**Date:** October 25, 2024  
**Status:** ✅ Complete - All builds passing

---

## What are Matrix Builds?

Matrix builds allow you to **test the same code across multiple environments in parallel**. Instead of running tests sequentially on different OS/version combinations, GitHub Actions creates multiple jobs that run simultaneously.

**Example:** Testing on 3 operating systems × 3 Node versions = 9 jobs running in parallel!

---

## Why Use Matrix Builds?

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

## Matrix Syntax Fundamentals

### Basic Matrix Structure

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

## Advanced Matrix Techniques

### 1. Excluding Specific Combinations

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

### 2. Including Additional Combinations

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

### 3. Combining Exclude and Include

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]
    node-version: [20, 22]
    # Base: 6 jobs
    
    exclude:
      - os: macos-latest
        node-version: 20
    # After exclude: 5 jobs
    
    include:
      - os: ubuntu-latest
        node-version: 18
        allow-failure: true
    # Final: 6 jobs (5 + 1 experimental)
```

---

## Fail-Fast Strategy

### What is Fail-Fast?

Controls whether to cancel remaining jobs when one fails.

```yaml
strategy:
  fail-fast: true  # Default behavior
  matrix:
    # ...
```

### Behavior Comparison

**`fail-fast: true` (default):**
```
Job 1: ✅ Pass
Job 2: ❌ Fail  → Immediately cancels Jobs 3, 4, 5
Job 3: 🚫 Canceled
Job 4: 🚫 Canceled
Job 5: 🚫 Canceled
```

**`fail-fast: false`:**
```
Job 1: ✅ Pass
Job 2: ❌ Fail  → Other jobs continue
Job 3: ✅ Pass
Job 4: ✅ Pass
Job 5: ❌ Fail
```

### When to Use Each

**Use `fail-fast: true` (default) when:**
- ✅ You want fast feedback (stop on first failure)
- ✅ CI cost optimization (save compute minutes)
- ✅ Production deployments (one failure = broken build)

**Use `fail-fast: false` when:**
- ✅ Debugging (need to see which environments fail)
- ✅ Comprehensive testing (want all results)
- ✅ Flaky tests (one failure shouldn't block others)

---

## My Matrix Configuration

### Final Working Configuration

```yaml
strategy:
  fail-fast: false  # See all results, not just first failure
  matrix:
    os: [ubuntu-latest, windows-latest]
    node-version: [20, 22]
    include:
      - os: macos-latest
        node-version: 22  # Only latest Node on macOS (save CI minutes)
```

**Result:** 5 jobs
- ubuntu-latest + Node 20
- ubuntu-latest + Node 22
- windows-latest + Node 20
- windows-latest + Node 22
- macos-latest + Node 22

**Why this configuration?**
1. **Ubuntu/Windows:** Test both popular dev environments
2. **Node 20/22:** Current LTS + bleeding edge
3. **macOS limited:** Expensive runners, only test latest Node
4. **fail-fast: false:** See all failures during development

---

## Real-World Discovery: Node 18 Incompatibility

### The Problem
When testing with Node 18 in matrix builds, all jobs failed with:
```
TypeError: Cannot read properties of undefined (reading 'get')
at webidl-conversions/lib/index.js:325:94
```

### Root Cause
- Vitest 4.x depends on `webidl-conversions`
- This package requires Node.js 18.12+ or 20+
- Node 18 early versions (18.0-18.11) have `structuredClone` bugs

### Decision: Drop Node 18 Support
**Reasoning:**
1. Node 18 enters maintenance mode (October 2024)
2. Vitest 4.x requires Node 20+ for full compatibility
3. Node 20 is current LTS (Long Term Support)
4. Modern tooling (Vite, Vitest) targets latest Node versions
5. Simpler CI matrix (5 jobs vs 7) = faster builds

**Target versions:** Node 20, 22 on Ubuntu/Windows, Node 22 on macOS

### Lesson Learned
**Matrix testing reveals real compatibility issues!**
- Without matrix builds, we'd never know Node 18 was broken
- Users on Node 18 would face cryptic errors
- Better to fail in CI than in production

**Always consider:**
- What Node versions do your dependencies support?
- What Node versions do your users actually use?
- What's the maintenance burden vs compatibility benefit?

---

## Common Pitfalls & Solutions

### Pitfall 1: Array Syntax in Exclude
❌ **Wrong:**
```yaml
exclude:
  - os: macos-latest
    node-version: [18, 20]  # Arrays don't work!
```

✅ **Correct:**
```yaml
exclude:
  - os: macos-latest
    node-version: 18
  - os: macos-latest
    node-version: 20
```

---

### Pitfall 2: Forgetting to Use Matrix Variables
❌ **Wrong:**
```yaml
runs-on: ubuntu-latest  # Hardcoded!
steps:
  - uses: actions/setup-node@v4
    with:
      node-version: 20  # Hardcoded!
```

✅ **Correct:**
```yaml
runs-on: ${{ matrix.os }}  # Dynamic
steps:
  - uses: actions/setup-node@v4
    with:
      node-version: ${{ matrix.node-version }}  # Dynamic
```

---

### Pitfall 3: Over-Testing
**Problem:** Testing 5 OS × 5 Node versions = 25 jobs!

**Impact:**
- 💰 High CI costs (minutes add up)
- ⏱️ Slower feedback (queue limits)
- 😵 Difficult to debug (too many logs)

**Solution:** Be strategic
```yaml
# Good balance: 5 jobs
matrix:
  os: [ubuntu-latest, windows-latest]
  node-version: [20, 22]
  include:
    - os: macos-latest
      node-version: 22
```

---

## Matrix Build Patterns

### Pattern 1: Primary + Experimental
Test stable versions widely, experimental versions narrowly

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest]
    node-version: [20]  # LTS only
    include:
      - os: ubuntu-latest
        node-version: 22  # Test bleeding edge on one OS
        experimental: true
```

---

### Pattern 2: OS-Specific Configurations
```yaml
strategy:
  matrix:
    include:
      - os: ubuntu-latest
        node-version: 20
      - os: ubuntu-latest
        node-version: 22
      - os: windows-latest
        node-version: 20
      - os: macos-latest
        node-version: 22  # macOS only on latest
```

---

### Pattern 3: Exclude Expensive Combinations
```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]
    node-version: [20, 22]
    exclude:
      # macOS runners are 10x more expensive!
      - os: macos-latest
        node-version: 20
```

---

## Performance Optimization Tips

### 1. Minimize macOS Jobs
- **Cost:** macOS runners = 10× Ubuntu pricing
- **Strategy:** Only test critical macOS-specific features

### 2. Use Caching
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: ${{ matrix.node-version }}
    cache: 'npm'  # Cache per OS/Node combo
```

### 3. Strategic fail-fast
- Development: `fail-fast: false` (see all issues)
- Production: `fail-fast: true` (fast feedback)

---

## Key Takeaways

### What I Learned

1. **Matrix builds test combinations in parallel** ⚡
   - Dramatically reduces CI time vs sequential testing
   - Each combination is an independent job

2. **Cartesian product creates all combinations** 🧮
   - 3 OS × 3 versions = 9 jobs
   - Use `exclude` to skip unwanted combos
   - Use `include` to add specific combos

3. **Syntax matters: No arrays in exclude!** 🚨
   - Each exclude entry = ONE combination
   - Must list each exclusion separately

4. **fail-fast controls cancellation behavior** 🛑
   - `true` = stop on first failure (saves CI minutes)
   - `false` = run all jobs (better for debugging)

5. **Real-world compatibility testing is invaluable** 🔍
   - Discovered Node 18 incompatibility
   - Would have been a production bug without matrix testing
   - Better to fail in CI than in user's hands

6. **Balance coverage vs cost** ⚖️
   - Test what users actually run
   - macOS runners are expensive (10× Ubuntu)
   - More jobs ≠ better (diminishing returns)

7. **Dependencies dictate requirements** 📦
   - Vitest 4.x needs Node 20+
   - Can't support Node 18 without downgrading tools
   - Modern tooling often requires latest Node LTS

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
- `fail-fast: true` is enabled (default)
- One job failed → GitHub canceled remaining jobs
- Solution: Set `fail-fast: false` to see all results

**Q: Can I pass custom variables through the matrix?**
```yaml
matrix:
  include:
    - os: ubuntu-latest
      node-version: 20
      custom-flag: 'production'  # ✅ Yes!
# Access: ${{ matrix.custom-flag }}
```

**Q: What's the maximum number of matrix jobs?**
- GitHub Actions limit: **256 jobs per matrix**
- Practical limit: 10-20 jobs (cost/queue time)

---

## Next Steps

- ✅ Matrix builds working (5 jobs, all passing)
- ✅ Understand exclude/include syntax
- ✅ Documented real-world Node 18 issue
- 🔜 **Next:** Artifacts & Job Dependencies (saving build outputs)

---

## Additional Resources

- [GitHub Actions Matrix Strategy](https://docs.github.com/en/actions/using-jobs/using-a-matrix-for-your-jobs)
- [Node.js Release Schedule](https://github.com/nodejs/release#release-schedule)
- [GitHub Actions Pricing](https://docs.github.com/en/billing/managing-billing-for-github-actions/about-billing-for-github-actions)

---

**Status:** ✅ Phase 1 Complete - Ready for Lesson 4!