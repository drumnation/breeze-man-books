---
planning_approach: tactical
verification_mode: tactical
verification_threshold: 85
checkpoint_reduction: 0
phases_included: [0,1,2,3,4,5,6,7,8]
generated_date: 2026-04-17
codebase_snapshot: null
---

# Feature: Breezeman Analytics Wiring

**Feature ID**: feat-breezeman-analytics-wiring-001
**Status**: Not Started
**Owner**: Lane-95
**Started**: Not started
**Target Completion**: 2026-04-24 (1 week from now)
**Complexity**: Simple-to-Medium (6-8 files, 2 SDKs, 1 server integration)

## Feature Overview

Wire breezeman to PostHog (self-hosted) and Meta Pixel + Conversions API so PageView, InitiateCheckout, and Purchase events fire with env-var-gated no-op fallback — enabling conversion tracking before paid traffic begins driving to thebrainrotbooks.com.

## Phases

### Phase 00: Research & Discovery
**Status**: N/A
**Plan**: N/A
**Duration**: N/A
**Progress**: 0/0 (N/A)

**Objective**: N/A — BRIEF.md already captures solution, vendor choices, and risks.

**Key Deliverables**: N/A

**Success Criteria**: N/A

---

### Phase 01: Planning (GROVE)
**Status**: Complete (BRIEF equivalent)
**Plan**: [../BRIEF.md](../BRIEF.md)
**Duration**: 0 (pre-written)
**Progress**: N/A

**Objective**: Requirements captured in BRIEF.md including scope, deliverables, verification, non-goals, risks, and dependencies.

**Key Deliverables**:
- BRIEF.md with scope, non-goals, risks, deliverables
- Verification methodology per event surface (Pixel Helper, PostHog UI, CAPI Test Events)

**Success Criteria**:
- Scope fits 1-week implementation: YES
- All 5 event surfaces specified: YES (Client PH + Server PH + Pixel + CAPI + Null fallback)

---

### Phase 02: Architecture
**Status**: N/A (design implied by BRIEF)
**Plan**: N/A
**Duration**: N/A
**Progress**: 0/0 (N/A)

**Objective**: Integration surface already defined — PostHog provider implements existing `AnalyticsService` interface from `packages/analytics/src/types.ts`; Meta Pixel uses standard snippet; CAPI uses Stripe webhook handler at `apps/web/app/routes/api/store/webhook.ts` as event trigger.

**Key Deliverables**: N/A — no new architecture needed; all integration points exist.

**Success Criteria**: N/A

---

### Phase 03: Implementation Planning
**Status**: In Progress
**Plan**: [phase-plans/4-development.plan.md](./phase-plans/4-development.plan.md)
**Duration**: 0.5 day (this document)
**Progress**: 0/1 (0%)

**Objective**: Break down implementation into story-block plan consumable by grove-cli execute.

**Key Deliverables**:
- breezeman-analytics-wiring.phases.md (this file)
- phase-plans/4-development.plan.md (story-block format)

**Success Criteria**:
- arbor-verification score ≥85
- Story-block format validated (Story N: + verification + harness + loop + waves + depends)

---

### Phase 04: Development
**Status**: Not Started
**Plan**: [phase-plans/4-development.plan.md](./phase-plans/4-development.plan.md)
**Duration**: 3-4 days (~20-28 hours)
**Progress**: 0/5 (0%)

**Objective**: Implement PostHog provider (client+server), Meta Pixel client snippet, Meta CAPI server helper, event instrumentation on buy buttons + Stripe webhook, and env-var-empty no-op safety.

**Key Deliverables**:
- `packages/analytics/src/providers/posthog.ts` (client+server exports)
- Meta Pixel snippet in `apps/web/app/root.tsx`
- Meta CAPI helper at `packages/analytics/src/providers/meta-capi.ts`
- Event emission in marketing route BookCard/BundleCta and in `apps/web/app/routes/api/store/webhook.ts`
- `.env.development` with new vars (empty placeholders)

**Success Criteria**:
- `pnpm typecheck` clean
- `pnpm lint` clean
- `pnpm test` green for new unit tests (≥80% coverage on new provider files)
- Empty env vars → Null provider selected, no console errors

---

### Phase 05: Testing
**Status**: Not Started
**Plan**: rolled into Phase 04 per story (tdd-joe loop)
**Duration**: embedded in dev
**Progress**: 0/0 (per-story)

**Objective**: Unit tests for each provider story (written first under tdd-joe loop); manual client+server verification steps documented in runbook.

**Key Deliverables**:
- Unit tests for PostHog provider (mocked SDK) — part of Story 1
- Unit tests for Meta CAPI helper (mocked fetch) — part of Story 4
- Manual verification checklist in `docs/analytics-setup.md`

**Success Criteria**:
- All new tests green
- Manual verification steps documented for PostHog client, PostHog server, Meta Pixel, Meta CAPI Test Events

---

### Phase 06: Documentation
**Status**: Not Started
**Plan**: bundled as Story 5 in development plan
**Duration**: 2 hours (within Phase 04)
**Progress**: 0/1

**Objective**: Write `docs/analytics-setup.md` runbook: how to get PostHog API key, Meta Pixel ID, Meta CAPI token; how to add to Coolify env; how to verify events flow.

**Key Deliverables**:
- `docs/analytics-setup.md` runbook

**Success Criteria**:
- Runbook covers all 4 credential sources
- Verification steps reproducible

---

### Phase 07: Deployment
**Status**: Not Started (Dave plugs keys after merge)
**Plan**: N/A — runbook only
**Duration**: 15 minutes (manual, post-merge by Dave)
**Progress**: N/A

**Objective**: After PR merge, Dave populates POSTHOG_API_KEY, POSTHOG_HOST, META_PIXEL_ID, META_CAPI_ACCESS_TOKEN in Coolify env; service restarts.

**Key Deliverables**:
- Keys set in Coolify (not part of this PR)
- First live events verified in PostHog UI + Meta Events Manager

**Success Criteria**:
- Out of scope for this feature's agent work — tracked as post-merge follow-up.

---

### Phase 08: Post-Launch
**Status**: Not Started
**Plan**: N/A
**Duration**: Follow-up (see BRIEF follow-ups list)
**Progress**: N/A

**Objective**: Validate events flow once keys populated; spawn follow-up feature `analytics-agent-consumer` for weekly Discord report.

**Key Deliverables**:
- First Purchase event confirmed in PostHog + Meta Events Manager
- Follow-up feature queued

**Success Criteria**: N/A in this PR's scope.

---

## Dependencies

**External**:
- PostHog self-hosted service (parallel steward `posthog-self-hosted` standing it up; keys empty until service ready — this PR lands cleanly either way)
- Meta Business ads account (Zubair) — Pixel ID + CAPI token
- Coolify env var injection for prod

**Internal**:
- Existing `@kit/analytics` package with `AnalyticsService` interface
- Existing Stripe webhook handler at `apps/web/app/routes/api/store/webhook.ts`
- Phase 03 (this plan) blocks Phase 04 (development)

## Metrics

- **Total Stories**: 5 (in Phase 04 plan)
- **Completed**: 0
- **In Progress**: 0
- **Blocked**: 0
- **Progress**: 0%

## Agent Coordination

Single steward via `grove-cli execute`. Tdd-joe loop on all testable stories (S1-S4). S5 (docs) uses default loop. No parallel lanes — sequential by dependency.
