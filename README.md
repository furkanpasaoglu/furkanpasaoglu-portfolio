# furkanpasaoglu-portfolio

[![Live Site](https://img.shields.io/badge/Live%20Site-furkanpasaoglu.com-blue?style=flat-square)](http://furkanpasaoglu.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![.NET](https://img.shields.io/badge/.NET-9-512BD4?style=flat-square&logo=dotnet)](https://dotnet.microsoft.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-compose-2496ED?style=flat-square&logo=docker)](https://docs.docker.com/compose/)

---

## About

Personal portfolio + admin CMS for **Furkan Paşaoğlu**, Senior Software Developer based in Istanbul.

The public site is **"The Compiler & Architecture Blueprint"**: a technical drawing set instead of a landing page — numbered sheets, a CAD grid that warps under the pointer, projects drawn as a dependency graph, and a terminal you can navigate with. Every word, project, note and setting in it comes from the database and is edited in a panel built for this site alone. Nothing here needs a redeploy to change.

## Hakkında

**Furkan Paşaoğlu**'nun kişisel portföy + admin CMS uygulaması.

Public site **"The Compiler & Architecture Blueprint"**: açılış sayfası yerine bir teknik çizim seti — numaralı paftalar, imleçle bükülen CAD ızgarası, bağımlılık şeması olarak çizilen projeler ve içinde gezinebildiğin bir terminal. Sitedeki her metin, proje, not ve ayar veritabanından gelir ve yalnızca bu site için yazılmış bir panelden düzenlenir. Hiçbiri için redeploy gerekmez.

---

## Architecture / Mimari

```
┌────────────────────────────────────────────────────────┐
│  nginx (client container)                               │
│  ├── Blueprint SPA        ───  /, /projects, /blog/<slug>   │
│  ├── React admin SPA     ───  /admin/*                   │
│  └── Reverse proxy to server:                            │
│      /api/*, /media/*, /scalar/*, /openapi/*             │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  ASP.NET Core 9 Minimal API (server container)          │
│  ├── Keycloak OIDC — auth code + PKCE (BFF pattern)     │
│  ├── Tokens in httpOnly cookies + rate limiter          │
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

### Public site — "The Compiler & Architecture Blueprint"

The site is a technical drawing set rather than a scrolling page. Seven
numbered **sheets** replace sections; the viewport never scrolls; navigation
is the rail, the number keys, or a terminal that takes `ls` and `cd`.

- **Boot sequence** — a 1.5s runtime log of facts that are actually true of
  this deployment (.NET 9, PostgreSQL 17, applied migrations, Keycloak)
- **Sheets:** Index · About · Projects · Background · Skills · Notes · Contact
- **Projects as a dependency graph** — every component and the libraries it
  pulls in, drawn from the tags in the database, wires included
- **Skills as a polar diagram** — three domains as sectors, two grades as rings
- **Terminal** — `ls`, `cd <sheet>`, `lang`, `open`, `dotnet --info`, plus any
  command written in the admin panel
- **A `NullReferenceException` instead of a 404**, with a stack trace naming
  the sheet you asked for
- **Bilingual TR/EN** — instant toggle, content served from DB per request
- **Notes are addressable** — `/blog/<slug>` opens that note directly, which
  is what the sitemap advertises
- **Contact form** with SMTP delivery + optional auto-reply
- **SEO managed from admin** — meta tags, Open Graph, JSON-LD schema, sitemap,
  robots.txt all generated from DB
- **Maintenance mode** and per-sheet visibility, both switched from the panel

### Admin CMS (`/admin`)

- **Keycloak OIDC** — authorization code + PKCE in a **BFF pattern**: the code-to-token exchange happens server-side and access/refresh tokens live in httpOnly cookies, never in the browser. Refresh rotation, Keycloak realm roles mapped to app roles, 5/min login rate limit
- **Full CRUD** for: projects, experience, skills, blog posts, translations, personal info
- **Rich text editor** (TipTap) for note bodies and long descriptions — stored as a document, never as HTML, so nothing rendered on the public site can become markup
- **Site Settings:** SEO · Social · Schema.org · Branding · Operations · Security (CSP) · Communications (SMTP)
- **Dashboard** — system info, uptime, content counts, cache clear + manual site re-render
- **Messages inbox** — contact form submissions with read/unread toggle and auto-reply config
- **CV upload** (PDF, stored in `uploads` volume)
- **Maintenance mode** toggle + per-sheet visibility switches
- **Terminal commands** — add a command the site's terminal answers to, with a
  bilingual reply and a live preview of how it will print

---

## Tech Stack

### Backend (`server/Portfolio.Api/`)

| Package | Purpose |
|---|---|
| .NET 9 Minimal API | HTTP host |
| Entity Framework Core + Npgsql | ORM with JSONB support |
| FluentValidation | Request validation on every admin endpoint |
| Microsoft.AspNetCore.Authentication.JwtBearer | Validates Keycloak-issued access tokens (read from the httpOnly cookie) |
| Scalar | API docs at `/scalar/v1` (dev only) |

### Frontend (`client/`)

| Package | Purpose |
|---|---|
| React 19 + Vite 6 | Public SPA + admin SPA |
| React Router | Admin routing |
| TanStack Query | Data fetching + cache |
| TipTap | Rich text editor in the admin — writes a document, not HTML |
| Zod | Form validation (the admin's form engine is its own ~90 lines) |
| React Icons | Icons |

The admin panel has no UI framework: buttons, fields, tables, toasts and the
confirm dialog are plain elements in `client/src/admin/ui/`, sharing the
public site's design tokens so the two cannot drift apart.

### Infra

| | |
|---|---|
| Keycloak | Identity provider — OIDC (authorization code + PKCE) |
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
│   │   ├── blueprint/             # The public site — sheets, terminal, CAD grid
│   │   ├── admin/                 # Admin SPA — own UI primitives, no framework
│   │   ├── api/                   # publicApi / adminApi / endpoints
│   │   ├── context/               # Language + SiteMeta providers
│   │   ├── utils/                 # Rich document model, URL allow-listing
│   │   └── hooks/                 # usePublicData, useSiteOperations
│   ├── Dockerfile                 # Multi-stage: build → nginx
│   └── nginx.conf                 # Proxies /api, /media, /scalar, /openapi
│
├── server/Portfolio.Api/          # .NET 9 Minimal API
│   ├── Endpoints/                 # One static class per resource
│   ├── Domain/                    # POCOs with data_tr / data_en JSONB
│   ├── Contracts/                 # DTOs grouped by feature
│   ├── Validators/                # FluentValidation classes
│   ├── Services/                  # SiteRenderer, EmailSender, MaintenanceMiddleware, …
│   ├── Options/                   # KeycloakOptions, WebStaticOptions
│   ├── Data/                      # AppDbContext, Seeder, EF Core migrations
│   ├── Common/                    # Lang + slug helpers
│   └── SeedData/                  # First-boot JSON seed
│
├── server/Portfolio.Api.Tests/    # xUnit — validation and contract rules
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
#    http://localhost/admin      (admin — sign in through Keycloak)
#    http://localhost:8080/scalar/v1  (API docs)
```

The override file binds Postgres to `127.0.0.1:5432` and the server to `127.0.0.1:8080` for easy local inspection. It is **gitignored** so it never reaches production.

### Tests

```bash
dotnet test                  # server: validation and contract rules
cd client && npm run lint    # client
```

The suite covers the rules that are easy to get quietly wrong: URL scheme
allow-listing, required rich-text content, terminal command names, and the
section-toggle contract.

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
