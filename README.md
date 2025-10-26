# 🚀 CI/CD Pipeline Learning Journey

> Hands-on exploration of Continuous Integration and Continuous Deployment using GitHub Actions.

[![Frontend CI](https://github.com/atinder-harika/ci-cd-pipeline/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/atinder-harika/ci-cd-pipeline/actions)
[![Artifact CI](https://github.com/atinder-harika/ci-cd-pipeline/actions/workflows/artifacts-ci.yml/badge.svg)](https://github.com/atinder-harika/ci-cd-pipeline/actions)
[![Backend CI](https://github.com/atinder-harika/ci-cd-pipeline/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/atinder-harika/ci-cd-pipeline/actions)
[![Full Stack CI](https://github.com/atinder-harika/ci-cd-pipeline/actions/workflows/full-stack-ci.yml/badge.svg)](https://github.com/atinder-harika/ci-cd-pipeline/actions)

---

## 📖 About

A practical workshop for mastering CI/CD concepts through real-world implementation. Each lesson builds production-ready pipelines for full-stack applications.

**What I Learned:**
- Pipeline as Code (YAML workflows)
- Matrix builds (multi-environment testing)
- Artifact management (build output storage)
- Dependency caching (build optimization)
- Job dependencies (multi-stage pipelines)
- Full-stack monorepo CI/CD

---

## 🏗️ Project Structure

```
ci-cd-pipeline/
├── .github/workflows/
│   ├── frontend-ci.yml        # React + Vite + Vitest (5 matrix jobs)
│   ├── backend-ci.yml         # Spring Boot + Maven + JUnit
│   ├── artifacts-demo.yml     # Multi-stage pipeline demo
│   └── full-stack-ci.yml      # Combined frontend + backend
├── frontend/                  # React 18 + TypeScript + Vite
├── backend/                   # Spring Boot 3 + Java 17
├── docs/
│   ├── 01-pipeline-as-code.md
│   ├── 02-matrix-builds.md
│   ├── 03-artifacts-dependencies.md
│   └── 04-backend-maven-ci.md
└── LICENSE                    # MIT License
```

---

## 📝 Learning Log

### Phase 1: Frontend CI (JavaScript/TypeScript)
**Status:** 🚧 In Progress


---

## 📝 Learning Phases

### Phase 1: Frontend CI ✅
- GitHub Actions YAML syntax and workflow structure
- Working directory configuration for monorepos
- Dependency caching with npm (21% speedup)
- Matrix builds across OS (Ubuntu, Windows, macOS) and Node versions (20, 22)
- Discovered Node 18 incompatibility with Vitest 4.x

**Workflows:** `frontend-ci.yml` (5 parallel jobs)

---

### Phase 2: Artifacts & Dependencies ✅
- Multi-stage pipelines (build → test → deploy)
- Artifact upload/download for build outputs
- Job dependencies with `needs` keyword
- Conditional deployment (main branch only)

**Workflows:** `artifacts-demo.yml`

---

### Phase 3: Backend CI ✅
- Maven lifecycle and wrapper (`mvnw`)
- Java 17 setup with Temurin distribution
- Maven dependency caching (21% speedup)
- JAR artifact management
- Full-stack integration (frontend + backend)

**Workflows:** `backend-ci.yml`, `full-stack-ci.yml`

---

## 🎓 Key Takeaways

1. **Pipeline as Code** - Version-controlled, reproducible CI/CD configurations
2. **Matrix Builds** - Test across environments in parallel (4 min vs 14 min sequential)
3. **Caching Strategy** - Significant speedups with `actions/setup-node` and `actions/setup-java`
4. **Artifact Management** - Share build outputs between jobs (build once, deploy many)
5. **Job Dependencies** - Multi-stage pipelines with `needs` for controlled deployment gates

---

## 🔗 Real-World Application

Skills developed here will be applied to:  
**[service-status](https://github.com/atinder-harika/service-status)** - Full-stack observability platform

---

## 🛠️ Tech Stack

**CI/CD:** GitHub Actions  
**Frontend:** React 18, TypeScript, Vite, Vitest  
**Backend:** Spring Boot 3, Java 17, Maven, JUnit 5

---

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Matrix Strategy Guide](https://docs.github.com/en/actions/using-jobs/using-a-matrix-for-your-jobs)
- [Node.js Release Schedule](https://github.com/nodejs/release#release-schedule)

---

## 📄 License

MIT © 2025 Atinder Singh Hari  
See [LICENSE](LICENSE) for details.