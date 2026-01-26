# Render Deployment Guide

This guide details how to deploy your Laravel Backend to Render (Free Tier) using Docker.

## 1. Create a New Web Service

1. Go to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository: `ExpenseTracker`.

## 2. Configuration Settings

Fill in the following details:

| Field              | Value                                    |
| ------------------ | ---------------------------------------- |
| **Name**           | `expense-tracker-backend` (or similar)   |
| **Region**         | Closest to you (e.g., Frankfurt, Oregon) |
| **Branch**         | `main`                                   |
| **Root Directory** | `backend` (Important!)                   |
| **Runtime**        | `Docker`                                 |
| **Instance Type**  | `Free`                                   |

## 3. Environment Variables (Required)

Add the following Environment Variables in the **Environment** tab:

| Key             | Value                                    | Notes                                                                                                            |
| --------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `APP_NAME`      | `ExpenseTracker`                         |                                                                                                                  |
| `APP_ENV`       | `production`                             |                                                                                                                  |
| `APP_KEY`       | `base64:...`                             | Run `php artisan key:generate --show` locally to get one, or generate a random 32-char string encoded in base64. |
| `APP_DEBUG`     | `false`                                  |                                                                                                                  |
| `APP_URL`       | `https://your-service-name.onrender.com` | Update this after first deploy when you get the URL.                                                             |
| `DB_CONNECTION` | `sqlite`                                 |                                                                                                                  |
| `DB_DATABASE`   | `/var/www/database/database.sqlite`      | **MUST** match this path exactly.                                                                                |
| `LOG_CHANNEL`   | `stderr`                                 | Sends logs to Render console.                                                                                    |

## 4. Important Considerations for Free Tier

- **Ephemeral Filesystem**: Render Free Tier (and most container services) have **ephemeral filesystems**. This means **your SQLite database will be reset** every time you deploy or if the instance restarts (which happens on free tier for inactivity).
- **Persistence**: To keep data permanently, you would technically need a Render Disk (Paid) or an external database (Render Postgres Free Tier).
- **Workaround**: The current setup re-creates the database structure on every boot (`php artisan migrate --force`).

## 5. Deployment Process

1. Click **Create Web Service**.
2. Render will pull your code, build the Docker image, and start the service.
3. The `docker-entrypoint.sh` script will automatically:
    - Create the database file.
    - Run migrations.
    - Cache configuration.
    - Start the server.

## 6. Accessing the API

Once deployed, your API will be available at:
`https://your-service-name.onrender.com/api/health`
