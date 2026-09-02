# Smart Campus Infrastructure & Issue Intelligence — Master Execution Plan
Repo: TRrajputDEV/Smart_Campus_Infrastructure_and_Issue_Intelligence (currently empty — clean start)

## Strategy (1 paragraph)
Build a lean MERN system where the differentiator — **duplicate/recurring issue detection + asset health scoring** — is rule-based, not AI, so it ships reliably. Backend-first, one vertical slice (Auth → Asset → Issue) built end-to-end before splitting into parallel tracks. AI/notifications/heatmaps are stretch-only; the system must be fully demoable without them.

## Final Architecture
```
React (Vite, Tailwind, RTK/Context) → Axios → Express API
   Routes → Middleware(auth/role/validate) → Controllers → Services → Mongoose Models → MongoDB
Docker Compose (api, web, mongo, nginx, prometheus) | Jenkins CI/CD | Prometheus + node-exporter
```

## Feature Priority Map
| Tier | Features |
|---|---|
| MUST | Auth+roles, Asset CRUD+QR, Issue reporting, Issue lifecycle/status, Department routing, Maintenance history, Duplicate/recurring detection (rule-based), Asset health score, Basic admin dashboard, Docker Compose |
| SHOULD | Feedback loop, Analytics charts, Problem-zone view, Notifications (in-app), Jenkins CI/CD, Prometheus |
| STRETCH | Predictive maintenance, AI classification, AI summaries, Cost tracking, Email notifications |

## Dependency Graph (high-level)
```
Auth → Users/Roles → Asset+Location → Issue → Duplicate Engine → Incident
                                        ↓                ↓
                              Maintenance Workflow   Asset Health Score
                                        ↓                ↓
                                   Analytics Dashboard ←──┘
DevOps(Docker) can start Day 1 parallel to everything. CI/CD needs a working API first.
```

---

## PART 1 — Scope
**Objective:** Web platform linking infra complaints to specific assets, detecting recurring failures, recommending repair vs replace.
**Core differentiator:** Rule-based duplicate/recurring detection + asset health scoring — NOT another ticketing clone.
**Users:** Student, Staff, Maintenance Staff, Dept Manager, Admin.
**Excluded explicitly:** IoT sensors, mobile native app, payment/cost-billing integration, Kubernetes, real AI models (keep as optional LLM call), multi-tenant/multi-university support.

## PART 2 — Roles & Permission Matrix
| Action | Student | Staff | Maint. Staff | Dept Manager | Admin |
|---|---|---|---|---|---|
| Report issue | ✅ | ✅ | ❌ | ❌ | ✅ |
| View own issues | ✅ | ✅ | ✅(assigned) | ✅(dept) | ✅(all) |
| Update issue status | ❌ | ❌ | ✅(assigned) | ✅(dept) | ✅ |
| Register/edit assets | ❌ | ❌ | ❌ | ✅(dept) | ✅ |
| View dept analytics | ❌ | ❌ | ❌ | ✅ | ✅ |
| View global analytics | ❌ | ❌ | ❌ | ❌ | ✅ |
| Manage users/roles | ❌ | ❌ | ❌ | ❌ | ✅ |

## PART 3 — Domain Model
**Issue vs Incident — keep both, but simplified:** an *Issue* = one raw report; an *Incident* = a group of Issues pointing to the same underlying asset problem. Without Incident, "5 reports on the same AC" stays as 5 disconnected rows — you lose the core differentiator. Keep it, but make Incident auto-created (never manual).

| Entity | Purpose | Key Fields | Relations |
|---|---|---|---|
| User | Auth + role | name, email, passwordHash, role, dept | → Dept |
| Asset | Physical item | assetId, type, location, status, healthScore | → Location, → Dept |
| Location | Block/room | building, floor, room | ← Asset |
| Department | Maintenance team | name, category | ← User, ← Asset |
| Issue | Single report | asset, reporter, description, category, priority, status | → Asset, → Incident, → User |
| Incident | Grouped recurring issue | asset, issueIds[], failureCount, status | → Asset, ← Issue[] |
| MaintenanceRecord | Repair log | incident/issue ref, technician, action, cost, date | → Incident, → User |
| Feedback | Post-resolution rating | issue ref, rating, comment | → Issue |
| Notification | Event log | user, type, message, read | → User |

Do NOT add: Vendor, Inventory, Budget entities — out of MVP scope, adds no defensible complexity for a capstone timeline.

## PART 4 — Database Design (MongoDB)
- **Embed:** Location fields inside Asset (rarely queried standalone). Feedback embedded in Issue (1:1, small).
- **Reference:** Issue→Asset, Issue→User, Incident→Issue[], MaintenanceRecord→Incident — all referenced (grow independently, queried separately).
- **Indexes:** `Asset.assetId` (unique), `Issue.asset+status` (compound, for duplicate lookup), `Incident.asset` , `User.email` (unique).
- **Soft delete:** Assets only (`isActive: false`) — never hard-delete, history must survive.
- **Audit:** `statusHistory[]` array embedded in Issue (who/when/what changed) — cheap, avoids a separate audit collection.
- **Scale risk:** Issue collection grows unbounded — plan a `createdAt` TTL/archival strategy only if asked; not needed for capstone scale.

## PART 5 — API Architecture (condensed — expand any block on request)
| Domain | Key Endpoints | Auth |
|---|---|---|
| Auth | POST /auth/register, /auth/login, GET /auth/me | Public / JWT |
| Assets | GET/POST /assets, GET /assets/:id, PATCH /assets/:id, GET /assets/:id/qr | Admin/Dept write, all read |
| Issues | POST /issues, GET /issues, GET /issues/:id, PATCH /issues/:id/status | Auth'd create, role-based update |
| Incidents | GET /incidents, GET /incidents/:id (auto-created, no POST) | Maint/Admin |
| Maintenance | POST /maintenance, GET /maintenance/:incidentId | Maint Staff+ |
| Feedback | POST /issues/:id/feedback | Reporter only |
| Analytics | GET /analytics/summary, /analytics/by-department, /analytics/problem-zones | Manager/Admin |
| Notifications | GET /notifications, PATCH /notifications/:id/read | Owner |
| QR | GET /assets/:id/qr-code (image), POST /qr/scan | Auth'd |

Every route: Zod validation → auth middleware → role middleware → controller → service. No CRUD added without a UI screen that consumes it.

## PART 6 — Backend Layering
Routes (define paths) → Middleware (JWT verify, role check, Zod validate) → Controllers (thin: parse req, call service, format response) → Services (business logic: duplicate detection, health score calc) → Models (Mongoose schemas). Standard response shape: `{ success, data, error }`. Central error handler catches all thrown errors → consistent JSON.

## PART 7 — Frontend Architecture
- **Pages:** Login/Register, StudentDashboard, ReportIssue, IssueDetail, AdminAssetList, AdminDashboard, MaintenanceQueue, Analytics.
- **Layouts:** AuthLayout, StudentLayout, StaffLayout, AdminLayout (role-gated).
- **State:** Context/RTK for auth+user; React Query (or simple hooks) for server data — avoid over-engineering global state.
- **Protected/role routes:** wrapper component checking JWT + role before render.
- **Services layer:** one `api/*.js` file per domain wrapping Axios — no raw axios calls inside components.

---

## PART 8 — Phased Roadmap (compressed)
| Phase | Objective | Core Deliverable | Depends On |
|---|---|---|---|
| 0 | Planning | This document finalized, roles assigned | — |
| 1 | Repo/setup | Monorepo, Docker Compose skeleton, ESLint/Prettier | 0 |
| 2 | Backend foundation | Express app, DB connection, error handler, response format | 1 |
| 3 | DB models | All Mongoose schemas + indexes | 2 |
| 4 | Auth | Register/login, JWT, bcrypt | 3 |
| 5 | Roles | Role middleware, permission matrix enforced | 4 |
| 6 | Asset mgmt | Asset CRUD + Location | 5 |
| 7 | QR system | QR generation + scan-to-report | 6 |
| 8 | Issue reporting | Report form + API, category/priority | 6,7 |
| 9 | Issue lifecycle | Status transitions, assignment, history log | 8 |
| 10 | Duplicate/Recurring engine | Auto Incident creation on repeat reports | 9 |
| 11 | Asset health engine | Score calc from Incident/MaintenanceRecord data | 10 |
| 12 | Maintenance workflow | Technician updates, MaintenanceRecord CRUD | 9 |
| 13 | Analytics | Aggregation queries + dashboard UI | 10,11,12 |
| 14 | Notifications (in-app) | Event triggers on status change | 9 |
| 15 | Feedback | Post-resolution rating | 12 |
| 16 | AI (stretch, optional) | LLM classification/summary behind a flag | 13 |
| 17 | Dockerize | All services containerized, compose file finalized | Ongoing from 1 |
| 18 | CI/CD | Jenkins pipeline: lint→test→build→deploy | 17, working API |
| 19 | Monitoring | Prometheus + node-exporter, basic dashboard | 17 |
| 20 | Testing | Unit (services) + API (auth, issue lifecycle, duplicate engine) | Continuous from Phase 4 |
| 21 | Security hardening | Rate limit, helmet, CORS, input sanitization audit | 20 |
| 22 | Deployment | Deploy to a VM/cloud instance | 18,19,21 |
| 23 | Docs | README, API docs, architecture doc, setup guide | Continuous |
| 24 | Demo/viva prep | Script the end-to-end scenario, rehearse | 22,23 |

Definition of Done per phase = code merged to `dev` + endpoint/UI manually tested + no console errors.

## PART 9 — Team of 6 (functional ownership)
| Dev | Owns | APIs/Models | Depends on |
|---|---|---|---|
| 1 | Asset Registry + QR + Location | Asset, Location, QR routes | Auth (Dev4) |
| 2 | Issue Reporting + Categorization | Issue create/list, category logic | Asset (Dev1) |
| 3 | Duplicate/Recurring Engine + Incident | Incident model, detection service | Issue (Dev2) |
| 4 | Auth + Maintenance Workflow + Admin panel | User, Auth, MaintenanceRecord, Dept | — (starts first) |
| 5 | Analytics + Dashboard + Asset Health | Analytics routes, health-score service | Incident (Dev3), Maintenance (Dev4) |
| 6 | DevOps + Notifications + Reliability | Docker, Jenkins, Prometheus, Notification model | Runs parallel from Day 1 |

**Coordination points:** Dev1↔Dev2 (asset schema contract), Dev2↔Dev3 (issue schema for matching), Dev3↔Dev5 (incident data feeds health score), Dev6 needs a running API early (Phase 2) to containerize incrementally.

## PART 10 — Parallelization
- **Day 1 parallel:** Dev4 (auth scaffold) + Dev6 (Docker skeleton) + everyone agreeing on schema contracts.
- **Blocking:** Dev1 (Asset) must land before Dev2 (Issue) meaningfully starts; Dev2 before Dev3; Dev3 before Dev5's health score.
- **Frontend/backend integration:** after each domain's API is stable (not after everything) — integrate Asset+QR UI as soon as Phase 7 lands, don't wait till the end.
- **Analytics becomes meaningful** only once real Issue/Incident data exists — seed realistic dummy data by Phase 10 so Dev5 isn't blocked.
- **DevOps starts Day 1**, CI/CD activates once Phase 2 API is stable enough to build/test in a pipeline.

## PART 11 — Git Strategy
- Branches: `main` (protected) → `dev` → `feature/<dev-name>-<module>` e.g. `feature/dev1-asset-qr`.
- Commits: Conventional Commits — `feat(asset): add QR generation endpoint`, `fix(auth): correct role check bug`.
- PRs: 1 reviewer minimum, must pass Jenkins build before merge to `dev`.
- `.env.example` committed, real `.env` gitignored. Schema changes require a short migration note in PR description, not silent changes.

## PART 12 — Testing (risk-weighted)
| Area | Priority | Test Type |
|---|---|---|
| Duplicate/recurring engine | Highest | Unit tests, multiple edge-case scenarios |
| Auth/role middleware | High | API tests per role per route |
| Asset health score calc | High | Unit tests with known inputs/outputs |
| Issue lifecycle transitions | Medium | API/integration tests |
| Frontend forms | Low-Medium | Manual + a few component tests |
| Full flow | Medium | One E2E test: report → duplicate → maintenance → resolved |

## PART 13 — Security Checklist
bcrypt password hashing · short-lived JWT + refresh strategy · role middleware on every protected route · Zod validation on all inputs · Mongoose (no raw queries) prevents injection by default · express-rate-limit on auth routes · helmet for headers · CORS locked to frontend origin · secrets in `.env`, never committed · statusHistory doubles as lightweight audit log · QR codes encode only `assetId`, not sensitive data.

## PART 14 — Intelligence Engine (rule-based)
| Feature | Logic |
|---|---|
| Duplicate detection | On new Issue: query open Issues for same `assetId` within N days → if found, link to existing Incident instead of creating new one |
| Recurring detection | Count resolved Issues per asset in last 90 days ≥ threshold (e.g. 3) → flag asset, auto-create/update Incident |
| Frequently failing asset | `failureCount` on Asset ≥ threshold → surfaced in dashboard |
| Asset health score | Weighted formula: `100 - (failureCount×w1) - (daysSinceLastMaintenance factor×w2)`, clamped 0-100 |
| Problem zones | Group Issues by `location.building` → count → rank |
| Repair vs replace | Rule: if `failureCount ≥ X` AND `healthScore < Y` → recommend replacement, else repair |

All thresholds are config constants, not hardcoded — tunable without redeploying logic. AI (optional, Phase 16) only adds free-text classification/summary on top — never a dependency for the above.

## PART 15 — Analytics Metrics
Total assets · active/resolved issues · avg resolution time (resolvedAt - createdAt) · issues by department/category/location · most problematic assets (top N by failureCount) · recurring failures count · asset health distribution · problem zones (from Part 14). All computable via MongoDB aggregation pipelines — no separate analytics DB needed at this scale.

## PART 16 — Notifications
Events: issue created (confirm to reporter) · issue assigned (to maintenance staff) · status changed (to reporter) · resolved (request feedback) · recurring asset flagged (to dept manager). **Start in-app only** (Notification collection + polling/read flag) — email is a Phase-16-tier stretch, not MVP.

## PART 17 — DevOps Pipeline
`Local dev → Docker (per-service Dockerfile) → Docker Compose (api+web+mongo+nginx+prometheus) → Jenkins (lint→test→build→push image) → Deploy (single VM, docker-compose up) → Prometheus scrapes /metrics + node-exporter`. No Kubernetes — unjustified complexity for this scale. Automate: lint, test, build, image push. Keep manual: production deploy trigger (a deliberate `docker-compose pull && up` step, not auto-deploy — safer for a student project).

## PART 18 — Documentation to Maintain
README (setup+run) · ARCHITECTURE.md (this plan, trimmed) · API.md (endpoint reference) · DB_SCHEMA.md · SETUP.md · TESTING.md · one-page team contribution doc (who built what — needed for individual viva grading).

## PART 19 — Capstone Demo Flow
Student scans AC QR → reports "not cooling" → system auto-identifies AC-32-204 → categorized → duplicate check finds 5 prior failures → Incident auto-created/updated → routed to maintenance dept → technician updates status → MaintenanceRecord logged → asset health score drops → admin dashboard updates live → system recommends replacement over repair. This sequence *is* the pitch — it's what separates this from a generic complaint form.

## PART 20 — Priority System
Already captured in the **Feature Priority Map** above (MUST/SHOULD/STRETCH). Removing all STRETCH items must still leave a fully demoable product — verify this explicitly before Phase 24.

## PART 21 — Risk Analysis
| Risk | Mitigation |
|---|---|
| Scope creep | Lock MUST-list at Phase 0, no new features added after Phase 10 without dropping something |
| Duplicate-engine complexity | Start with simple same-asset+time-window rule, refine only if time allows |
| Poor demo data | Seed script with realistic fake issues/assets before Phase 13 |
| 6 devs blocked on 1 person | Dev4 (auth) work must land first and fast — treat it as Day-1 priority |
| AI taking too long | Keep entirely optional, behind a feature flag, last phase |
| Merge conflicts | Strict schema-contract agreement before Phase 6, small frequent PRs |
| Deployment failure late | Get Docker Compose running locally by Phase 2, not saved for the end |

## PART 22 — Final Delivery Checklist
☐ All MUST features working ☐ Role-based auth enforced everywhere ☐ Duplicate/recurring engine demonstrable with seeded data ☐ Asset health score visible ☐ Admin analytics dashboard populated ☐ Docker Compose runs the full stack in one command ☐ Jenkins pipeline green ☐ Prometheus dashboard reachable ☐ Core API/service unit tests passing ☐ README + API docs complete ☐ Individual contribution doc ☐ Demo script rehearsed end-to-end ☐ Viva Q&A prepped per module owner

---

## MASTER BUILD ORDER
1. Finalize schema contracts (Asset, Issue, Incident, User) as a team
2. Repo + Docker Compose skeleton (Dev6)
3. Express app + DB connection + error handling (Dev4)
4. Auth (register/login/JWT/roles) (Dev4)
5. Asset + Location CRUD (Dev1)
6. QR generation + scan endpoint (Dev1)
7. Issue reporting (create/list/detail) (Dev2)
8. Issue lifecycle (status, assignment, history) (Dev2)
9. Duplicate detection service → auto-Incident creation (Dev3)
10. Recurring detection + failureCount tracking (Dev3)
11. Maintenance workflow (technician updates, MaintenanceRecord) (Dev4)
12. Asset health score engine (Dev5)
13. Seed realistic demo data
14. Analytics aggregation APIs + dashboard UI (Dev5)
15. In-app notifications (Dev6)
16. Feedback loop (Dev2/4)
17. Frontend integration pass across all modules (whole team)
18. Jenkins CI/CD pipeline (Dev6)
19. Prometheus monitoring (Dev6)
20. Security hardening pass (whole team)
21. Core test suite (auth, duplicate engine, health score) (whole team)
22. (Optional) AI classification/summary behind flag
23. Documentation finalization
24. Deployment + demo rehearsal
