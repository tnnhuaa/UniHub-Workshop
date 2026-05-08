# Project Context

## Domain Summary

UniHub Workshop manages workshop registration, payment holds, offline check-in, AI summaries, and nightly CSV sync.

## Core Constraints

- Prevent oversell under concurrency.
- Handle payment instability via circuit breaker and idempotency.
- Support offline check-in with dedupe on sync.
- Import student data nightly from CSV.

## Architecture Summary

- Modular monolith backend with background workers.
- PostgreSQL for transactional data, Redis for ephemeral state.
- RabbitMQ for async jobs (notifications, AI summary, CSV sync).
- Object storage for PDFs and AI artifacts.
