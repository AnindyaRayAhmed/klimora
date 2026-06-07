# Klimora Backend

This backend is the production-oriented foundation for Klimora, an AI-powered climate intelligence platform. It is intentionally a skeleton: it defines boundaries, contracts, route modules, providers, agents, events, and jobs without implementing business logic or external API calls.

## Architecture

- **Runtime:** Node.js + TypeScript on Google Cloud Run.
- **HTTP API:** Fastify route modules under `src/api/routes`.
- **Database/Auth/Storage:** Supabase.
- **AI:** Gemini and Gemini Vision provider boundaries.
- **Data Providers:** Planet, OpenWeather, and Google Maps provider boundaries.
- **Jobs:** Cloud Scheduler and Cloud Run jobs target files under `src/jobs`.
- **Events:** Durable event workflow scaffolding under `src/events`.

## Folder Responsibilities

- `src/config`: environment parsing, constants, provider configuration contracts.
- `src/api`: Fastify route registration and middleware.
- `src/modules`: domain services, repositories, and types.
- `src/modules/agents`: Rit, verification, and recommendation agent boundaries.
- `src/providers`: external system client boundaries.
- `src/events`: event types, dispatcher, and handler placeholders.
- `src/jobs`: scheduled/background job entry placeholders.
- `src/cache`: cache key and policy definitions.
- `src/security`: auth, permission, signed URL, and audit boundaries.
- `src/shared`: common errors, logging, validators, pagination, and time utilities.
- `src/tests`: future test harness location.

## Implementation Roadmap

1. Wire validated environment loading in `src/config/env.ts`.
2. Register route modules from `src/app.ts` under `/api/v1`.
3. Add Supabase schema migrations and row-level security policies.
4. Implement repositories with Supabase queries.
5. Implement deterministic Climate Health Score logic in `modules/climate`.
6. Add provider clients for Planet, OpenWeather, Google Maps, and Gemini.
7. Implement event persistence and worker dispatch.
8. Implement Rit retrieval-grounded agent flow.
9. Implement mission verification orchestration using deterministic rules plus Gemini Vision evidence analysis.
10. Add integration tests and Cloud Run deployment manifests.

## MVP Read API

The current implementation exposes the first database-backed MVP endpoints:

- `GET /api/v1/localities`
- `GET /api/v1/localities/:id`
- `GET /api/v1/climate/localities/:localityId/latest`
- `GET /api/v1/missions`

These routes read from Supabase through repository and service layers. Provider integrations, uploads, Gemini verification, and Rit are intentionally not implemented yet.

## MVP Migrations

MVP schema and seed migrations live in `supabase/migrations`:

- `001_mvp_schema.sql`
- `002_mvp_seed.sql`

The seed migration creates five Bengaluru localities, sample deterministic climate scores, and the initial mission catalog.

## Important Design Rules

- Do not calculate Climate Health Score with an LLM.
- Keep scoring deterministic, versioned, and auditable.
- Treat AI output as advisory evidence, not authoritative state.
- Keep provider clients isolated from domain logic.
- Store every consequential workflow decision in the database for explainability.
