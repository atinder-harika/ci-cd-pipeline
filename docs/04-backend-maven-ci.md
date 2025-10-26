# Backend CI with Spring Boot & Maven

**Status:** ✅ Complete

---

## What is Maven?

Maven is a build automation tool for Java projects. It manages dependencies, compiles code, runs tests, and packages applications into `.jar` files.

**Maven Lifecycle** (sequential phases):
```
validate → compile → test → package → verify → install → deploy
```

**Key insight:** Running a later phase automatically runs earlier ones. For example, `mvnw package` includes compilation and testing!

---

## Maven Syntax

### Common Commands

```bash
./mvnw clean        # Delete target/ folder
./mvnw compile      # Compile Java code
./mvnw test         # Compile + Run tests
./mvnw package      # Compile + Test + Create .jar
./mvnw install      # Package + Install to ~/.m2/
```

### Maven vs npm Comparison

| Aspect | Maven (Java) | npm (Node.js) |
|--------|--------------|---------------|
| Config file | `pom.xml` | `package.json` |
| Dependencies | `~/.m2/repository/` (shared) | `node_modules/` (per project) |
| Wrapper | `./mvnw` | `npx` |
| Build output | `target/*.jar` | `dist/` |
| Run tests | `./mvnw test` | `npm test` |
| Build | `./mvnw package` | `npm run build` |

**Key difference:** Maven shares dependencies across projects, npm duplicates them.

---

## My Backend Workflow

```yaml
name: backend-ci

on:
  push:
    branches: [main, development]
  pull_request:
    branches: [main, development]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          java-version: 17
          distribution: 'temurin'
          cache: 'maven'
      
      - name: Run tests
        run: ./mvnw test
      
      - name: Build JAR
        run: ./mvnw clean package
      
      - name: Upload JAR artifact
        uses: actions/upload-artifact@v4
        with:
          name: backend-jar
          path: backend/target/*.jar
          retention-days: 7
```

---

## Mistakes & Lessons

### Error #1: Permission Denied on `mvnw`

**Problem:** `./mvnw` failed with permission error

**Error:** `Permission denied: ./mvnw`

**Lesson:** Git doesn't always preserve executable permissions when cloning on Windows

**Fix:**
```bash
git update-index --chmod=+x backend/mvnw
git commit -m "Fix mvnw permissions"
```

---

### Error #2: Package Declaration Mismatch

**Problem:** Test file in wrong directory

**Error:** `The declared package "com.cicd.backend" does not match the expected package`

**Lesson:** Java package structure must match directory structure exactly

**Fix:** Ensure structure matches package declaration:
```
src/test/java/com/cicd/backend/  ← Must match package name
└── HealthControllerTest.java
```

---

### Discovery: Maven Wrapper Cross-Platform

**Finding:** On Windows PowerShell, use `./mvnw` (not `mvnw.cmd`)

PowerShell treats `.cmd` and shell scripts interchangeably, so `./mvnw` works on all platforms (Windows, Linux, macOS)!

---

## Why Use Maven Wrapper?

**`mvn` (global install):**
- ❌ Requires Maven installed on system
- ❌ Version can vary between machines
- ❌ Breaks when Maven not available

**`mvnw` (wrapper):**
- ✅ Self-contained, project-specific Maven version
- ✅ No global install needed
- ✅ Downloads Maven automatically if missing
- ✅ Guarantees consistent version across environments

**Essential for CI:**
```yaml
# Without wrapper
- run: mvn test  # ❌ What if runner doesn't have Maven?

# With wrapper
- run: ./mvnw test  # ✅ Always works!
```

---

## Caching Performance

**My results:**
- **First run (cache miss):** 52 seconds
- **Second run (cache hit):** 41 seconds
- **Speedup:** 21% improvement

**What's cached:** `~/.m2/repository/` (all Maven dependencies)

**Cache key:** Hash of `pom.xml` (invalidates when dependencies change)

---

## Quick Reference

### Java Distributions
```yaml
temurin   # Eclipse Adoptium (recommended for CI)
oracle    # Oracle JDK (license required for production)
zulu      # Azul OpenJDK (Azure optimized)
corretto  # Amazon OpenJDK (AWS optimized)
```

### Maven Phases
```yaml
clean     # Delete target/
compile   # Compile source code
test      # Run unit tests
package   # Create .jar (includes test)
install   # Install to ~/.m2/
```

### Full-Stack Pattern
```yaml
jobs:
  frontend:
    # ... build frontend
  backend:
    # ... build backend
  deploy:
    needs: [frontend, backend]  # Wait for both
    if: github.ref == 'refs/heads/main'
```

---

## Key Takeaways

1. **Maven Wrapper** - Essential for reproducible CI (no global install required)
2. **Sequential Phases** - `package` automatically runs `test` and `compile`
3. **Shared Dependencies** - Maven caches in `~/.m2/` (unlike npm's per-project `node_modules/`)
4. **Caching** - Built-in with `setup-java` (21% speedup)
5. **Fat JAR** - Spring Boot packages everything into single executable file
6. **Cross-Platform** - `./mvnw` works on Windows, Linux, macOS

---

## Questions I Can Now Answer

**Q: Why use Temurin over Oracle JDK?**  
**A:** Temurin is free, open source, has LTS support, and doesn't require licensing for production use.

**Q: What's inside a Spring Boot JAR?**  
**A:** Your compiled code, all dependencies, embedded Tomcat server, and application properties. Typical size: 30-50 MB.

**Q: How to run JAR locally?**  
**A:** `java -jar target/backend-0.0.1-SNAPSHOT.jar`

**Q: Why does `mvnw package` run tests?**  
**A:** Maven phases are sequential. `package` phase comes after `test` phase, so tests automatically run first. If tests fail, no `.jar` is created.

---

**Next:** Apply these patterns to production projects! 🚀
