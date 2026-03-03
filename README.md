# furkanpasaoglu-portfolio

[![Live Site](https://img.shields.io/badge/Live%20Site-furkanpasaoglu.com-blue?style=flat-square&logo=vercel)](http://furkanpasaoglu.com/)
[![React](https://img.shields.io/badge/React-19.1-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.3-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![GSAP](https://img.shields.io/badge/GSAP-3.14-88CE02?style=flat-square&logo=greensock)](https://gsap.com/)

---

## About

A personal portfolio SPA for **Furkan Paşaoğlu**, Senior Software Developer based in Istanbul.
The site showcases his professional identity, technical skills, work experience, projects, and a bilingual technical blog — all wrapped in a smooth, animation-driven single-page experience.

---

## Hakkında

**Furkan Paşaoğlu**'nun kişisel portföy sitesi. İstanbul merkezli bir Senior Software Developer olarak profesyonel kimliğini, teknik becerilerini, iş deneyimlerini, projelerini ve iki dilli teknik blogunu tek sayfalık animasyonlu bir deneyimde sunar.

---

## Features

- **Bilingual UI** — full Turkish / English support with instant toggle (auto-detects browser language)
- **Dark / Light theme** — persists to `localStorage`, respects `prefers-color-scheme`
- **Animated Loading Screen** — GSAP-driven particles, rings, counter and progress bar
- **Scroll animations** — GSAP `ScrollTrigger` used across all sections
- **Hero parallax** — mouse-movement parallax on background orbs
- **Slide-in detail panels** — Projects, Experience and Blog posts open in a right-side GSAP panel (body scroll locked, Escape to close)
- **Blog** — 6 bilingual articles with real C# code examples; full-screen searchable + filterable post list
- **Contact form** — client-side form with send confirmation
- **No router** — pure single-page scroll with anchor links
- **CV download** — links to `/Furkan-Pasaoglu-Senior-Software-Developer-CV.pdf`

## Özellikler

- **İki dil desteği** — Türkçe / İngilizce anlık geçiş (tarayıcı dili otomatik algılanır)
- **Koyu / Açık tema** — `localStorage`'a kaydedilir, `prefers-color-scheme` desteklenir
- **Animasyonlu Yükleme Ekranı** — GSAP ile partiküller, dönen halkalar, sayaç ve progress bar
- **Kaydırma animasyonları** — Tüm bölümlerde GSAP `ScrollTrigger` kullanılır
- **Hero paralaks** — Arka plan orb'ları fare hareketiyle paralaks
- **Sağdan açılan paneller** — Projeler, Deneyim ve Blog yazıları sağ taraftan açılan GSAP panelinde görüntülenir (body scroll kilitlenir, Escape ile kapatılır)
- **Blog** — Gerçek C# kod örnekleri içeren 6 iki dilli makale; tam ekran arama + filtreli yazı listesi
- **İletişim formu** — Client-side gönderim onaylı form
- **Router yok** — Saf tek sayfalık scroll, anchor linklerle
- **CV indirme** — `/Furkan-Pasaoglu-Senior-Software-Developer-CV.pdf` bağlantısı

---

## Tech Stack

| Package | Version | Purpose |
|---|---|---|
| `react` | ^19.1.0 | UI framework |
| `react-dom` | ^19.1.0 | DOM rendering |
| `gsap` | ^3.14.2 | Animations & ScrollTrigger |
| `@gsap/react` | ^2.1.2 | GSAP React integration |
| `react-icons` | ^5.5.0 | Icon library |
| `vite` | ^6.3.5 | Build tool & dev server |
| `@vitejs/plugin-react` | ^4.4.1 | Babel Fast Refresh for Vite |
| `eslint` | ^9.25.0 | Linting |

---

## Project Structure / Proje Yapısı

```
src/
├── main.jsx               # Entry point
├── App.jsx                # Root — ThemeProvider → LanguageProvider → LoadingScreen → App
├── components/
│   ├── LoadingScreen       # Animated intro screen
│   ├── Navbar              # Fixed top nav, theme & language toggles, mobile hamburger
│   ├── Hero                # Full-viewport landing, parallax background, social links
│   ├── About               # Bio, avatar placeholder, stat cards
│   ├── Skills              # Skill chips by category (Backend / DB / DevOps+Frontend)
│   ├── Projects            # Project cards grid + ProjectPanel slide-in
│   ├── ProjectPanel        # Right-side project detail panel
│   ├── Experience          # Alternating vertical timeline + ExperiencePanel slide-in
│   ├── ExperiencePanel     # Right-side experience detail panel
│   ├── Blog                # Featured posts + BlogAllPosts modal + BlogPostPanel
│   ├── BlogAllPosts        # Full-screen post list with search & category filter
│   ├── BlogPostPanel       # Right-side article reader (renders blogContent.js)
│   ├── Contact             # Info panel + contact form
│   └── Footer              # Logo, credits, socials, scroll-to-top
├── context/
│   ├── ThemeContext.jsx    # Dark/light theme context & hook
│   ├── LanguageContext.jsx # TR/EN language context & hook
│   ├── en.js               # English translation strings
│   └── tr.js               # Turkish translation strings
└── data/
    └── blogContent.js      # Full bilingual article content (6 posts, TR + EN)
```

---

## Getting Started / Kurulum

### Prerequisites / Gereksinimler

- Node.js ≥ 18
- npm ≥ 9

### Installation & Running / Kurulum ve Çalıştırma

```bash
# Install dependencies / Bağımlılıkları yükle
npm install

# Start development server / Geliştirme sunucusunu başlat
npm run dev

# Build for production / Prodüksiyon için derle
npm run build

# Preview production build / Prodüksiyon derlemesini önizle
npm run preview
```

---

## Sections / Bölümler

| Section | Description | Açıklama |
|---|---|---|
| **Hero** | Full-viewport landing with animated title, social links, parallax orbs | Animasyonlu başlık, sosyal linkler ve paralaks arka planla tam sayfa giriş |
| **About** | Bio, "FP" avatar with animated rings, 4 stat cards, CV link | Biyografi, animasyonlu "FP" avatar, 4 istatistik kartı, CV linki |
| **Skills** | ~19 technologies in 3 categories: Backend & .NET, Database & Integration, DevOps & Frontend | 3 kategoride ~19 teknoloji |
| **Projects** | 9 real-world projects; slide-in panel with stack, highlights and links | 9 gerçek proje; stack, öne çıkanlar ve linklerle sağdan açılan panel |
| **Experience** | 3-entry alternating timeline: BBS (2021–Present), Bootcamp, University | 3 girişli alternatif zaman çizelgesi: BBS, Bootcamp, Üniversite |
| **Blog** | 6 bilingual articles (Clean Architecture, CQRS, Hangfire, Semantic Kernel, Health Checks, EF Core) | 6 iki dilli makale |
| **Contact** | Info panel + client-side contact form | Bilgi paneli + client-side iletişim formu |
| **Footer** | Credits, GitHub/LinkedIn links, scroll-to-top | Kredi, sosyal linkler, yukarı çık butonu |

---

## Live Site / Canlı Site

**[furkanpasaoglu.com](http://furkanpasaoglu.com/)**

---

## License / Lisans

MIT © Furkan Paşaoğlu
