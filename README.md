# Marrakech Maadine — Moroccan Artisan Marketplace

A full-stack SaaS e-commerce marketplace connecting Moroccan artisans directly with customers worldwide. Built with Laravel 12 (backend API) and Next.js 16 (frontend), with support for English, French, and Arabic (RTL).

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [1. Clone the repository](#1-clone-the-repository)
  - [2. Backend setup (Laravel)](#2-backend-setup-laravel)
  - [3. Frontend setup (Next.js)](#3-frontend-setup-nextjs)
- [Running the project](#running-the-project)
- [Test accounts](#test-accounts)
- [Project structure](#project-structure)

---

## Project Overview

Marrakech Maadine is a multi-vendor artisan marketplace inspired by the craftsmanship of Marrakesh. Sellers create verified stores, list handmade products with images, and manage orders. Customers browse, purchase (Cash on Delivery), review products, and message sellers — all in their preferred language.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Laravel 12, PHP 8.2+ |
| Database | MariaDB 10.4+ (or MySQL 8.0+) |
| Authentication | Laravel Sanctum (SPA cookie-based) |
| Frontend | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| i18n | next-intl (EN / FR / AR + RTL) |
| State | Zustand (cart), React Context (auth) |
| Fonts | Cormorant Garamond, Inter, Cairo |

---

## Features

- **Multi-vendor**: each seller has their own verified store and product listings
- **Product management**: images (up to 10), categories, stock tracking, search (FULLTEXT), filtering and sorting
- **Orders**: Cash on Delivery, multi-seller cart splitting, stock locking at checkout, order status tracking, cancellation with stock reversal
- **Reviews**: verified-purchase only, after delivery, with automatic rating recalculation
- **Wishlist**: saved items per customer
- **Messaging**: real-time-feeling polling chat between customers and sellers, with content filtering (phone numbers, emails, URLs masked automatically)
- **Admin dashboard**: user/seller management, product moderation, order monitoring, conversation moderation, penalty system, platform analytics
- **Trilingual**: English, French, Arabic with full RTL layout support
- **SEO**: server-side rendering, per-locale metadata, `generateStaticParams`
- **Security**: HTTP-only session cookies (no localStorage tokens), CSRF protection, role-based access, ownership guards on all write operations, checkout idempotency

---

## Prerequisites

Make sure the following are installed before you begin:

| Tool | Minimum version | Check |
|---|---|---|
| PHP | 8.2+ | `php -v` |
| Composer | 2.x | `composer -V` |
| Node.js | 18.18+ | `node -v` |
| npm | 9+ | `npm -v` |
| MariaDB / MySQL | 10.4+ / 8.0+ | via XAMPP, Laragon, or standalone |

> **Windows users**: if using XAMPP, make sure MySQL/MariaDB is running in the XAMPP Control Panel before starting the backend. MySQL may not be in your system PATH — that's fine, Laravel connects via TCP, not the CLI.

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/marrakech-maadine.git
cd marrakech-maadine
```

The repository contains two folders:
```
marrakech-maadine/
├── backend/       ← Laravel API
└── frontend/      ← Next.js app
```

---

### 2. Backend setup (Laravel)

#### a) Install PHP dependencies

```bash
cd backend
composer install
```

#### b) Create the environment file

```bash
cp .env.example .env
```

Open `.env` and update the following:

```env
APP_NAME=MarrakechMaadine
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=maadin_marketplace
DB_USERNAME=root
DB_PASSWORD=

SESSION_DRIVER=database
SESSION_DOMAIN=localhost
SANCTUM_STATEFUL_DOMAINS=localhost:3000
FRONTEND_URL=http://localhost:3000
```

> **Note**: If your MariaDB/MySQL uses a password, set `DB_PASSWORD` accordingly. XAMPP default is no password for root.

#### c) Generate the application key

```bash
php artisan key:generate
```

#### d) Create the database

In phpMyAdmin (or any MySQL client), run:

```sql
CREATE DATABASE IF NOT EXISTS maadin_marketplace
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

#### e) Run migrations

```bash
php artisan migrate
```

#### f) Create the storage symlink (for product images)

```bash
php artisan storage:link
```

#### g) (Optional) Seed test data

```bash
php artisan db:seed
```

> If no seeder exists yet, you can create test accounts manually after starting the server — see [Test accounts](#test-accounts) below.

#### h) Start the backend server

```bash
php artisan serve --host=localhost --port=8000
```

The API is now available at `http://localhost:8000`.

---

### 3. Frontend setup (Next.js)

#### a) Install dependencies

```bash
cd ../frontend
npm install
```

#### b) Create the environment file

```bash
cp .env.local.example .env.local
```

Or create `.env.local` manually:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

#### c) Start the frontend server

```bash
npm run dev
```

The app is now available at `http://localhost:3000`.

> **Important**: always start the **backend first**, then the frontend. The frontend makes server-side API calls at build/render time.

---

## Running the project

You need **two terminal windows** running simultaneously:

**Terminal 1 — Backend:**
```bash
cd backend
php artisan serve --host=localhost --port=8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Then open `http://localhost:3000/en` in your browser.

### URL structure

| URL | Description |
|---|---|
| `http://localhost:3000/en` | Homepage (English) |
| `http://localhost:3000/fr` | Homepage (French) |
| `http://localhost:3000/ar` | Homepage (Arabic / RTL) |
| `http://localhost:3000/en/products` | Product listing |
| `http://localhost:3000/en/login` | Login |
| `http://localhost:3000/en/register` | Register |
| `http://localhost:8000/api/...` | Backend API (JSON) |
| `http://localhost/phpmyadmin` | Database UI (XAMPP) |

---

## Test accounts

After running migrations, create test accounts by registering via the UI at `/en/register`, or use the following accounts if you ran the seeder:

| Role | Email | Password | Notes |
|---|---|---|---|
| Admin | `admin@maadin.ma` | `admin12345` | Full platform access |
| Seller | `hassan@maadin.ma` | `password123` | Verified store "Hassan's Carpets" |
| Customer | `fatima@maadin.ma` | `password123` | Has order history and reviews |

### Creating an admin manually (Tinker)

If no admin exists yet:

```bash
cd backend
php artisan tinker
```

```php
\App\Models\User::create([
    'name' => 'Admin',
    'email' => 'admin@maadin.ma',
    'password' => bcrypt('admin12345'),
    'role' => 'admin',
    'status' => 'active',
    'email_verified_at' => now(),
]);
exit
```

---

## Project structure

```
marrakech-maadine/
├── backend/
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   │   ├── Admin/          ← Admin endpoints
│   │   │   ├── Customer/       ← Customer endpoints
│   │   │   ├── Seller/         ← Seller endpoints
│   │   │   └── ...             ← Public endpoints
│   │   ├── Models/             ← 14 Eloquent models
│   │   ├── Services/           ← ContentFilterService
│   │   └── Http/Middleware/    ← EnsureUserIsAdmin, EnsureUserIsSeller
│   ├── database/
│   │   ├── migrations/         ← 14 core tables + Sanctum + idempotency
│   │   └── seeders/
│   ├── routes/
│   │   └── api.php             ← All API routes
│   └── storage/app/public/     ← Uploaded product images
│
└── frontend/
    ├── app/
    │   └── [locale]/           ← All pages under locale routing
    │       ├── (auth)/         ← Login, Register
    │       ├── (shop)/         ← Homepage, Products, Cart, Checkout
    │       └── (dashboard)/    ← Admin, Seller, Customer dashboards
    ├── components/
    │   ├── layout/             ← Navbar, Footer
    │   └── Providers.tsx
    ├── lib/
    │   ├── api.ts              ← Axios instance (withCredentials)
    │   ├── auth-context.tsx    ← Auth state (login/register/logout)
    │   └── types.ts            ← TypeScript interfaces
    ├── store/
    │   └── cartStore.ts        ← Zustand cart (localStorage persisted)
    ├── messages/
    │   ├── en.json             ← English translations
    │   ├── fr.json             ← French translations
    │   └── ar.json             ← Arabic translations
    └── i18n/
        ├── routing.ts          ← Locale routing config
        ├── navigation.ts       ← next-intl Link/router wrappers
        └── request.ts          ← Server-side locale resolution
```

---

## Known limitations (MVP scope)

- **Cash on Delivery only** — no payment gateway integrated yet
- **Email verification** — schema and flow exist, but emails are logged (`MAIL_MAILER=log`), not sent to real inboxes. Configure SMTP in `.env` to enable real emails
- **No rate limiting** — planned for a post-MVP hardening pass
- **No automated tests** — all verification was done manually during development
- **Image storage** — local filesystem only; configure S3/R2 for production via `config/filesystems.php`

---

## License

Private — all rights reserved. Contact the project owner for licensing inquiries.
