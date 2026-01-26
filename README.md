# 💰 Expense Tracker Monorepo

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Backend](https://img.shields.io/badge/Backend-Laravel%2011-red)
![Mobile](https://img.shields.io/badge/Mobile-React%20Native-blue)
![Database](https://img.shields.io/badge/Database-SQLite-green)
![Deployment](https://img.shields.io/badge/Deploy-Render-purple)

A comprehensive, full-stack Expense Tracker solution featuring a robust Laravel API, a sleek React Native mobile app, and a Laravel-based web dashboard. Designed for performance, scalability, and ease of deployment.

---

## 📂 Project Structure

This monorepo is organized into three main components:

| Directory               | Component         | Description                                            |
| ----------------------- | ----------------- | ------------------------------------------------------ |
| **`/backend`**          | **API Core**      | Laravel 11 API-only. Dockerized, SQLite, Sanctum Auth. |
| **`/mobile`**           | **Mobile App**    | React Native (Expo). iOS & Android compatible.         |
| **`/frontend-laravel`** | **Web Dashboard** | Laravel + Blade + Tailwind. (Under Development)        |

---

## 🚀 Features

### ✅ Backend API

- **Authentication**: Secure Token-based auth (Sanctum) for Mobile & Web.
- **Core Resources**: CRUD for Expenses, Incomes, Categories, Budgets, Loans.
- **Dashboard Logic**: Aggregated statistics, monthly charts, and balance calculation.
- **Dockerized**: Production-ready `Dockerfile` with optimized entrypoint.
- **SQLite**: File-based database for easy zero-config deployment.

### 📱 Mobile App

- **Auth Flow**: Login, Register, Logout with auto-token management.
- **Dashboard**: View balance, recent transactions, and summaries.
- **Resources**: Manage Expenses and Incomes on the go.
- **Tech**: Built with Expo, React Navigation, and Axios.

### 💻 Web Dashboard (Coming Soon)

- Full-featured admin panel using Laravel Blade & Tailwind CSS.
- Visual charts and reports.

---

## 🛠 Getting Started

### 1. Backend Setup

You can run the backend locally using PHP or Docker.

**Option A: Docker (Recommended)**

```bash
cd backend
docker build -t expense-backend .
docker run -p 8000:10000 expense-backend
```

**Option B: Local PHP**

```bash
cd backend
composer install
cp .env.example .env
touch database/database.sqlite
php artisan migrate --seed
php artisan serve
```

_API will be available at `http://localhost:8000`_

### 2. Mobile App Setup

Ensure you have [Node.js](https://nodejs.org/) installed.

```bash
cd mobile
npm install
npx expo start
```

- Scan the QR code with **Expo Go** on your phone.
- Press `a` for Android Emulator or `i` for iOS Simulator.

### 3. Web Frontend Setup

```bash
cd frontend-laravel
composer install
npm install && npm run dev
php artisan serve
```

---

## 📡 API Documentation

A complete **Postman Collection** is included in the root directory:
📄 [`postman_collection.json`](./postman_collection.json)

**Base URL (Production):** `https://expense-backend-tnag.onrender.com/api`

### Key Endpoints

- `POST /api/mobile/login` - Authenticate user
- `GET /api/dashboard` - Get summary stats
- `GET /api/expenses` - List expenses
- `GET /api/incomes` - List income

---

## ☁️ Deployment

The backend is configured for **Render (Free Tier)**.

1.  Push this repo to GitHub.
2.  Create a **Web Service** on Render connected to this repo.
3.  Set **Root Directory** to `backend`.
4.  Set **Environment Variables** (See `backend/RENDER_GUIDE.md`).
5.  Deploy! 🚀

---

## 📝 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
