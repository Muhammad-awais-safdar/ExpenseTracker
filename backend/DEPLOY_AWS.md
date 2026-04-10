## AWS Deployment Guide (Production)

This backend is container-ready and can run on AWS EC2, ECS, or App Runner.

### 1) Prerequisites

- AWS account
- Domain + DNS control (optional but recommended)
- RDS PostgreSQL instance
- EC2 instance (Ubuntu) or ECS/App Runner service
- Docker installed on host

### 2) Environment Setup

1. Copy AWS env template:
   - `cp .env.aws.example .env`
2. Fill required values:
   - `APP_KEY` (leave empty on first run; container auto-generates if missing)
   - `APP_URL`
   - `DB_*` for RDS
   - mail credentials
   - optional S3 credentials
3. Set `APP_DEBUG=false` and `APP_ENV=production`.

### 3) Deploy on EC2 with Docker Compose

From `backend` directory:

1. Build and start:
   - `docker compose -f docker-compose.aws.yml up -d --build`
2. Check logs:
   - `docker logs -f expense-tracker-backend`
3. Verify API:
   - `curl http://<EC2_PUBLIC_IP>/api/health`

### 4) Security Group Rules

- Inbound:
  - `80/tcp` from internet (or ALB only)
  - `443/tcp` from internet (if TLS termination on host/ALB)
  - `22/tcp` from your IP only
- Outbound:
  - allow to RDS port (`5432`) and required external services

### 5) TLS/HTTPS

Recommended:

- Put an AWS Application Load Balancer (ALB) in front of the container.
- Attach ACM certificate to ALB listener `443`.
- Forward to target group on `80`.

### 6) ECS/App Runner Notes

- Container port: `80`
- Health endpoint: `/api/health`
- Inject environment variables from Secrets Manager/SSM Parameter Store.
- Keep migrations enabled at startup only if single instance or controlled rollout.

### 7) Production Checklist

- `APP_DEBUG=false`
- DB backups enabled (RDS automated backups)
- Rotate credentials and use IAM/Secrets Manager
- Monitor container logs and 5xx rates
- Ensure scheduler is active if recurring processing is required

### 8) Rollback

- Keep previous image tag available.
- For EC2 compose:
  - `docker compose -f docker-compose.aws.yml down`
  - redeploy previous image tag and `up -d`.
