# furkanpasaoglu-portfolio

[![Live Site](https://img.shields.io/badge/Live%20Site-furkanpasaoglu.com-blue?style=flat-square)](http://furkanpasaoglu.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![.NET](https://img.shields.io/badge/.NET-9-512BD4?style=flat-square&logo=dotnet)](https://dotnet.microsoft.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-compose-2496ED?style=flat-square&logo=docker)](https://docs.docker.com/compose/)

---

## About

Full-stack personal portfolio + admin CMS for **Furkan Paşaoğlu**, Senior Software Developer based in Istanbul. Every piece of content on the public site (projects, experience, skills, blog posts, SEO metadata, contact form settings) is driven by a custom admin panel — no redeploy needed to change content.

## Hakkında

**Furkan Paşaoğlu**'nun kişisel portföy + admin CMS uygulaması. Public site'taki tüm içerik (projeler, deneyim, yetenekler, blog yazıları, SEO metadata, iletişim form ayarları) özel bir admin panel üzerinden yönetilir — içerik değişikliği için redeploy gerekmez.

---

## Architecture / Mimari

```
┌─────────────────────────────────────────────────────────┐
│  nginx (client container)                               │
│  ├── React SPA           ───  /                          │
│  ├── React admin SPA     ───  /admin/*                   │
│  └── Reverse proxy to server:                            │
│      /api/*, /media/*, /scalar/*, /openapi/*             │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  ASP.NET Core 9 Minimal API (server container)          │
│  ├── JWT auth via httpOnly cookies (SameSite=Strict)    │
│  ├── BCrypt password hashing + rate limiter             │
│  ├── FluentValidation on every admin mutation           │
│  ├── EF Core + Npgsql (JSONB for bilingual data)        │
│  └── Dynamic site renderer → writes index.html+sitemap  │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  PostgreSQL 17 (internal network only — not exposed)    │
│  └── Bilingual entities via data_tr / data_en JSONB     │
└─────────────────────────────────────────────────────────┘
```

---

## Features / Özellikler

### Public site

- **Bilingual TR/EN** — instant language toggle, content served from DB per request
- **Dark / Light theme** — persists to `localStorage`, respects `prefers-color-scheme`
- **Dynamic content** — every section is DB-driven; admin panel edits appear live after re-render
- **Sections:** Hero · About · Skills · Projects · Experience · Blog · Contact
- **Blog** with block editor (paragraph, heading, code, note) — bilingual per post
- **Contact form** with SMTP delivery + optional auto-reply
- **SEO managed from admin** — meta tags, Open Graph, JSON-LD schema, sitemap, robots.txt all generated from DB

### Admin CMS (`/admin`)

- **JWT auth** (httpOnly cookies, rotating refresh tokens, 5/min login rate limit)
- **Full CRUD** for: projects, experience, skills, blog posts, translations, personal info
- **Blog block editor** — reorderable blocks, per-language content
- **Site Settings:** SEO · Social · Schema.org · Branding · Operations · Security (CSP) · Communications (SMTP)
- **Dashboard** — system info, uptime, content counts, cache clear + manual site re-render
- **Messages inbox** — contact form submissions with read/unread toggle and auto-reply config
- **CV upload** (PDF, stored in `uploads` volume)
- **Maintenance mode** toggle + per-section visibility switches

---

## Tech Stack

### Backend (`server/Portfolio.Api/`)

| Package | Purpose |
|---|---|
| .NET 9 Minimal API | HTTP host |
| Entity Framework Core + Npgsql | ORM with JSONB support |
| FluentValidation | Request validation on every admin endpoint |
| BCrypt.Net | Password hashing |
| System.IdentityModel.Tokens.Jwt | JWT issue/validate |
| Scalar | API docs at `/scalar/v1` (dev only) |

### Frontend (`client/`)

| Package | Purpose |
|---|---|
| React 19 + Vite 6 | Public SPA + admin SPA |
| React Router | Admin routing |
| TanStack Query | Data fetching + cache |
| Mantine 7 | Admin UI kit (scoped to `/admin` only) |
| Zod + @mantine/form | Form validation |
| React Icons / Tabler Icons | Icons |

### Infra

| | |
|---|---|
| PostgreSQL 17 | Data store (internal docker network only) |
| Docker Compose | 3-service orchestration |
| nginx | SPA serve + reverse proxy |
| Dokploy | Deployment target (Traefik for TLS/routing) |

---

## Repository structure

```
.
├── client/                        # React (public + admin) + Vite + nginx
│   ├── src/
│   │   ├── components/sections/   # Public sections (Hero, About, Projects, …)
│   │   ├── admin/                 # Admin SPA (Mantine scoped here)
│   │   ├── api/                   # publicApi / adminApi / endpoints
│   │   ├── context/               # Theme, Language, SiteMeta providers
│   │   └── hooks/                 # usePublicData, useSelectableDetail, …
│   ├── Dockerfile                 # Multi-stage: build → nginx
│   └── nginx.conf                 # Proxies /api, /media, /scalar, /openapi
│
├── server/Portfolio.Api/          # .NET 9 Minimal API
│   ├── Endpoints/                 # One static class per resource
│   ├── Domain/                    # POCOs with data_tr / data_en JSONB
│   ├── Contracts/                 # DTOs grouped by feature
│   ├── Validators/                # FluentValidation classes
│   ├── Services/                  # JwtService, SiteRenderer, EmailSender, …
│   ├── Data/                      # AppDbContext, Seeder
│   ├── Common/                    # Lang + slug helpers
│   ├── Migrations/                # EF Core migrations
│   └── SeedData/                  # First-boot JSON seed
│
├── docker-compose.yml                   # Base (postgres + server + client)
├── docker-compose.override.yml.example  # Dev template (loopback ports)
└── .env.example                         # Env var template
```

---

## Getting started / Kurulum

### Prerequisites

- Docker + Docker Compose
- Node.js ≥ 22 (optional — for running client outside Docker)
- .NET SDK 9 (optional — for running server outside Docker)

### Local development

```bash
# 1. Copy env templates
cp .env.example .env
cp docker-compose.override.yml.example docker-compose.override.yml

# 2. Edit .env with local-friendly values (defaults are fine for localhost)

# 3. Start everything
docker compose up -d

# 4. Open
#    http://localhost/           (public site)
#    http://localhost/admin      (admin login — credentials from .env)
#    http://localhost:8080/scalar/v1  (API docs)
```

The override file binds Postgres to `127.0.0.1:5432` and the server to `127.0.0.1:8080` for easy local inspection. It is **gitignored** so it never reaches production.

---

## Deployment

Deployed via **Dokploy** (which bundles Traefik for TLS + routing). Short path:

1. Point Dokploy at this repo (Compose service type).
2. Compose file: `docker-compose.yml` only — do **not** include the override.
3. Set env vars in the Dokploy panel (see `.env.example`) — generate strong values with `openssl rand -base64 32` etc.
4. Add domain + enable HTTPS in Dokploy Domains; route to service `client`, port `80`.
5. Deploy.

Base `docker-compose.yml` never publishes Postgres or the API port — they live only on the internal docker network. TLS termination, domain routing, and log viewing are handled by Dokploy/Traefik.

---

## License / Lisans

MIT © Furkan Paşaoğlu
