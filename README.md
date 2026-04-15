# CareerAI — AI-Powered Resume Assistant

CareerAI is a full-stack web application that helps users improve their resumes through AI-driven conversations. Upload your resume, chat with an LLM, and receive tailored suggestions — all within a secure, authenticated platform.

🌐 **Live:** [https://d3g2bs3w8mqk4z.cloudfront.net](https://d3g2bs3w8mqk4z.cloudfront.net)

---

## Architecture

```mermaid
flowchart TD
    User(["User browser"])

    User -->|HTTPS| CF["CloudFront CDN\nCaches static assets · proxies /api/* to EC2"]

    CF -->|Static assets| S3["AWS S3\nReact + Vite static build"]
    CF -->|/api/* proxy| Express

    subgraph EC2["EC2 · Ubuntu 22.04 · Docker Compose"]
        Express["Node.js / Express\nJWT auth · rate limiting · REST API"]

        Express --> MongoDB["MongoDB 7\nUsers · sessions"]
        Express --> Redis["Redis 7\nQueue · caching"]

        Redis --> Worker["BullMQ worker\nAsync email dispatch"]
    end

    Worker --> SMTP["SendGrid SMTP"]

    subgraph CICD["GitHub Actions CI/CD — triggered on push to main"]
        FE["deploy-frontend\nVite build → S3 sync → CloudFront invalidation"]
        BE["deploy-backend\nSSH into EC2 → git pull → docker compose up"]
    end

    FE -.->|deploys to| S3
    BE -.->|deploys to| EC2
```

> **Note:** All external traffic enters through CloudFront. The EC2 Security Group accepts inbound requests from CloudFront IP ranges only — the backend is never directly reachable from the public internet.

---

## Features

- Landing page with product introduction
- User registration and login with JWT authentication
- Access token & refresh token stored in HTTP-only cookies (XSS protection)
- Forgot password flow — email verification code dispatch, code verification, and password reset
- 6-digit OTP input with auto-focus, auto-advance, and paste support
- SendGrid email integration with dynamic templates for welcome and password reset emails
- Redis cache layer on registration to short-circuit duplicate email checks without hitting MongoDB
- Rate limiting to prevent brute-force attacks, spam registrations, and reset code flooding
- Async post-registration flow with email notifications (BullMQ + Redis)
- AI-powered chat interface for resume feedback (LLM integration)
- Resume upload and analysis
- Secure, containerized backend deployed on AWS

---

## Tech Stack

**Frontend**
- React + Vite
- React Context API for authentication state management
- AWS S3 + CloudFront (production)

**Backend**
- Node.js + Express
- RESTful API with `/api` prefix
- JWT authentication (access token + refresh token)
- Rate limiting middleware
- Error handling middleware
- Jest unit tests + ESLint code style checks

**Database & Cache**
- MongoDB with Mongoose ODM
- Docker Volume for data persistence
- Redis for job queue and caching

**Queue**
- BullMQ + Redis for async job processing (e.g. post-registration welcome email, password reset code dispatch)

**Email**
- SendGrid transactional email with dynamic templates
- Welcome email dispatched asynchronously via BullMQ after registration
- Password reset code email dispatched via BullMQ on forgot-password request

**Testing** *(planned)*
- Jest + Supertest for backend unit and integration tests
- React Testing Library for frontend component tests
- ESLint for code style enforcement on both frontend and backend

**File Storage** *(planned)*
- AWS S3 for user-uploaded files (profile pictures, resumes)
- S3 presigned URLs for secure direct uploads
- CloudFront for serving uploaded assets

**DevOps**
- Docker & Docker Compose
- AWS EC2 with Elastic IP (backend + database + Redis)
- AWS S3 + CloudFront (frontend)
- GitHub Actions CI/CD pipeline
- EC2 Security Group configured to accept only CloudFront IP ranges

---

## Project Structure

```
trial-project/
  .env
  .env.example
  compose.yaml
  README.md
  trial-backend/
    Dockerfile
    server.js
    package.json
    auth/
      auth.routes.js         # /api/auth route definitions
    config/
      redis.js               # Redis client setup
    exceptions/
      AppError.js            # Base error class
      ConflictError.js
      NotFoundError.js
      UnauthorizedError.js
      ValidationError.js
      index.js               # Centralised exception exports
    middleware/
      auth.js                # JWT verification middleware
      auth.validation.js     # Request body validation for auth routes
      errorHandler.js        # Global error handling middleware
      rateLimiter.js         # Rate limiting for auth endpoints
    models/
      Todo.js                # (legacy - to be removed)
    queues/
      emailQueue.js          # BullMQ queue definition
    user/
      user.model.js          # Mongoose User schema
      user.routes.js         # /api/user route definitions
      user.validation.js     # User input validation
    utils/
      auth.validation.js     # Shared auth validation helpers
    workers/
      emailWorker.js         # BullMQ worker: SendGrid email dispatch
  trial-frontend/
    Dockerfile
    nginx.conf               # Local dev reverse proxy config
    vite.config.js
    eslint.config.js
    index.html
    public/
      favicon.svg
      icons.svg
    src/
      App.jsx
      main.jsx
      context/
        AuthContext.jsx      # React Context API — auth state & token logic
      features/
        auth/
          SignIn.jsx         # Login form
          SignUp.jsx         # Registration form
          ForgotPassword.jsx # Email input — triggers reset code dispatch
          VerifyCode.jsx     # 6-digit OTP input with auto-focus and paste support
          ResetPassword.jsx  # New password input with confirmation
          Auth.css
        todos/               # (legacy - to be removed)
          TodoForm.jsx
          TodoList.jsx
      pages/
        LandingPage/
          LandingPage.jsx
          LandingPage.css
        ToDoPage/            # (legacy - to be removed)
          ToDoPage.jsx
          ToDoPage.css
      styles/
        App.css
        index.css
  .github/
    workflows/
      deploy.yml
```

---

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js 24

### Local Development

1. Clone the repository

```bash
git clone git@github.com:your-username/careerAI.git
cd careerAI
```

2. Create `.env` file

```bash
cp careerAI-backend/.env.example careerAI-backend/.env
```

Fill in your values:

```
MONGO_USERNAME=admin
MONGO_PASSWORD=yourpassword
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
REDIS_URL=redis://redis:6379
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxx
EMAIL_FROM=your@email.com
SENDGRID_TEMPLATE_ID_WELCOME=d-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_TEMPLATE_ID_RESET=d-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

3. Start all services

```bash
docker-compose --profile local up --build
```

4. Open browser

```
http://localhost
```

---

## API Endpoints

### Auth

| Method | Endpoint | Description |
|--|--|--|
| POST | /api/auth/register | Register a new user |
| POST | /api/auth/login | Sign in and receive tokens |
| POST | /api/auth/logout | Sign out |
| POST | /api/auth/refresh | Refresh access token using refresh token cookie |
| POST | /api/auth/forgot-password | Send password reset code to email (rate limited) |
| POST | /api/auth/verify-code | Verify the password reset code |
| POST | /api/auth/reset-password | Reset password with verified code |

> More endpoints will be added as features are developed.

---

## Authentication

JWT-based authentication is implemented with two tokens:

- **Access Token** — short-lived, stored in an HTTP-only cookie
- **Refresh Token** — longer-lived, stored in an HTTP-only cookie

Storing tokens in HTTP-only cookies prevents JavaScript access, protecting against XSS attacks. The refresh token flow allows seamless session renewal without requiring the user to re-login.

React Context API wraps the entire application and manages auth state, providing login, logout, and token refresh logic to all child components.

---

## Password Reset Flow

The full forgot-password flow is implemented across three pages and three API endpoints:

1. **ForgotPassword** — user enters their email, a 6-digit reset code is generated and dispatched via SendGrid through BullMQ
2. **VerifyCode** — user enters the 6-digit OTP; the input supports auto-advance on each digit and full paste support for copying codes directly from email
3. **ResetPassword** — user sets a new password; the backend validates the verified code token before accepting the change

Reset codes are short-lived and rate limited to prevent abuse.

---

## Email

SendGrid is used for all transactional emails. Emails are dispatched asynchronously via BullMQ workers so API response times are never blocked by email delivery.

Two dynamic templates are configured in SendGrid:

- **Welcome email** — sent after registration, includes the user's name via `{{fullName}}`
- **Password reset email** — sent on forgot-password request, includes the reset code via `{{code}}`

The worker retries failed jobs up to 3 times with exponential backoff before marking them as failed.

---

## Queue & Async Jobs

After a user registers, a BullMQ job is dispatched to a Redis-backed queue. A background worker processes the job asynchronously to send a welcome or verification email. This keeps the registration endpoint fast and decoupled from email delivery.

---

## Rate Limiting

Express rate limiting middleware is applied to sensitive endpoints to prevent brute-force attacks and automated spam. Two separate limiters are configured:

- **Auth endpoints** (`/register`, `/login`) — general per-IP limit to block credential stuffing and spam registrations
- **`/forgot-password`** — stricter dedicated limit to prevent abuse of the email code dispatch (e.g. flooding a victim's inbox)

---

## Docker Setup

### Local (four services)

| Service | Image | Port |
|--|--|--|
| frontend | nginx:alpine | 80 |
| backend | node:24 | 5000 |
| mongodb | mongo:7 | 27017 (internal only) |
| redis | redis:7 | 6379 (internal only) |

### Production (three services)

| Service | Image | Port |
|--|--|--|
| backend | node:24 | 5000 |
| mongodb | mongo:7 | 27017 (internal only) |
| redis | redis:7 | 6379 (internal only) |

The `frontend` service uses a Docker Compose profile and is only started locally:

```bash
docker compose --profile local up --build   # starts all four services
docker compose up -d --build                # starts backend, mongodb, and redis only
```

> Note: MongoDB and Redis bind to `127.0.0.1` only — ports are not accessible from outside the host.

---

## CI/CD Pipeline

**GitHub Actions** (`/.github/workflows/deploy.yml`)  
Triggered on every push to the `main` branch. Runs two independent jobs in parallel.

**Frontend job (`deploy-frontend`):**
- Checkout code and set up Node.js 24 (with npm cache)
- Install dependencies and build with Vite (`VITE_API_KEY` injected from secrets)
- Configure AWS credentials (region: `ap-southeast-2`)
- Sync `dist/` to S3:
  - Static assets (`js`, `css`, images) — `Cache-Control: public, max-age=31536000, immutable`
  - `index.html` — `Cache-Control: no-cache, no-store, must-revalidate`
- Invalidate CloudFront cache (`/*`)

**Backend job (`deploy-backend`):**
- SSH into EC2 via `appleboy/ssh-action`
- `git pull` latest code
- Write `MONGO_USERNAME` and `MONGO_PASSWORD` to root `.env`
- Write full backend environment (`BACKEND_ENV` secret) to `trial-backend/.env`
- Run `docker-compose down && docker-compose up -d --build`

All AWS credentials, SSH keys, and environment values are stored as GitHub Actions secrets and never hardcoded in the workflow file.

---

## Deployment

### AWS S3 + CloudFront Setup

1. Create S3 bucket with all public access blocked
2. Create CloudFront distribution pointing to S3 with OAC enabled
3. Add CloudFront Behavior for `/api/*` forwarding to EC2:5000
4. Set Error Pages 403/404 → `/index.html` with response code 200 (SPA routing)
5. Update S3 Bucket Policy with the policy provided by CloudFront

### AWS EC2 Setup

1. Launch EC2 instance (Ubuntu 22.04, t2.micro)
2. Allocate and associate Elastic IP
3. Configure Security Group to allow inbound traffic only from CloudFront IP ranges
4. Install Docker and Docker Compose
5. Clone `careerAI-backend` repository to server
6. Create `.env` file on server
7. Run `docker-compose up -d --build`

### GitHub Actions Setup

Add the following secrets to your GitHub repository:

```
SSH_PRIVATE_KEY                      - EC2 private key
SSH_HOST                             - EC2 Elastic IP
SSH_USERNAME                         - ubuntu
MONGO_USERNAME                       - MongoDB username
MONGO_PASSWORD                       - MongoDB password
JWT_ACCESS_SECRET                    - JWT access token secret
JWT_REFRESH_SECRET                   - JWT refresh token secret
AWS_ACCESS_KEY_ID                    - IAM Access key
AWS_SECRET_ACCESS_KEY                - IAM Secret key
AWS_CLOUDFRONT_DISTRIBUTION_ID       - CloudFront Distribution ID
S3_BUCKET_NAME                       - S3 bucket name
SENDGRID_API_KEY                     - SendGrid API key
EMAIL_FROM                           - Verified sender email address
SENDGRID_TEMPLATE_ID_WELCOME         - SendGrid welcome email template ID
SENDGRID_TEMPLATE_ID_RESET           - SendGrid password reset email template ID
```

---

## Security

- MongoDB and Redis ports are not exposed to the public
- Backend is not directly accessible — all traffic routes through CloudFront
- EC2 Security Group restricts inbound access to CloudFront IPs only
- JWT tokens stored in HTTP-only cookies (no JavaScript access)
- Rate limiting applied to auth endpoints
- SSH tunneling required to access MongoDB or Redis locally
- Password reset codes are short-lived and single-use

### SSH Tunnel (MongoDB Compass access)

```bash
ssh -i your-key.pem -L 27017:localhost:27017 ubuntu@your-elastic-ip
```

Then connect with MongoDB Compass:

```
mongodb://admin:yourpassword@localhost:27017
```

---

## Environment Variables

### Root `.env` — Docker Compose (MongoDB credentials)

| Variable | Description | Example |
|--|--|--|
| `MONGO_USERNAME` | MongoDB root username | `admin` |
| `MONGO_PASSWORD` | MongoDB root password | `yourpassword` |

Used by `compose.yaml` to initialise the MongoDB container and auto-construct the `MONGO_URL` connection string passed to the backend:
```
mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@mongodb:27017/trial-project?authSource=admin
```

---

### `trial-backend/.env` — Backend service

| Variable | Description | Example |
|--|--|--|
| `NODE_ENV` | Runtime environment | `development` / `production` |
| `PORT` | Express server port | `5000` |
| `MONGO_URL` | Full MongoDB connection string | `mongodb://localhost:27017/todos` (local) — auto-overridden by compose in production |
| `JWT_SECRET` | Secret key for signing access tokens (15 min expiry) | 64-char random string |
| `REFRESH_SECRET` | Secret key for signing refresh tokens (7 day expiry) | 64-char random string |
| `REFRESH_COOKIE_MAX_AGE` | Refresh token cookie max age in milliseconds | `604800000` (7 days) |
| `CLOUDFRONT_URL` | Allowed CORS origin (CloudFront frontend URL) | `https://xxxx.cloudfront.net` |
| `REDIS_URL` | Redis connection URL — injected by compose in production | `redis://redis:6379` |
| `SENDGRID_API_KEY` | SendGrid API key for transactional email | `SG.xxxxxxxxxx` |
| `EMAIL_FROM` | Verified sender address | `you@gmail.com` |
| `SENDGRID_TEMPLATE_ID_WELCOME` | SendGrid dynamic template ID for welcome email | `d-xxxxxxxx` |
| `SENDGRID_TEMPLATE_ID_RESET` | SendGrid dynamic template ID for password reset email | `d-xxxxxxxx` |

> In production, `MONGO_URL` and `REDIS_URL` are injected directly by `compose.yaml` via the `environment` block, overriding whatever is in the `.env` file.

---

### `trial-frontend/.env` — Frontend (Vite)

| Variable | Description | Example |
|--|--|--|
| `VITE_API_KEY` | API base path used by all frontend requests | `/api` |

Because CloudFront proxies `/api/*` to EC2, the frontend never needs to know the backend's actual URL — `/api` works in both local (Nginx proxy) and production (CloudFront behavior) environments.

---

### GitHub Actions Secrets

These secrets are set in the repository's **Settings → Secrets and variables → Actions** and injected at deploy time. The backend `.env` is written to the EC2 instance during deployment via the `BACKEND_ENV` secret.

| Secret | Used in | Description |
|--|--|--|
| `VITE_API_URL` | Frontend build | Value of `VITE_API_KEY` at build time |
| `AWS_ACCESS_KEY_ID` | Frontend & backend deploy | IAM access key |
| `AWS_SECRET_ACCESS_KEY` | Frontend & backend deploy | IAM secret key |
| `S3_BUCKET_NAME` | Frontend deploy | S3 bucket for static assets |
| `AWS_CLOUDFRONT_DISTRIBUTION_ID` | Frontend deploy | CloudFront distribution ID for cache invalidation |
| `SSH_HOST` | Backend deploy | EC2 Elastic IP address |
| `SSH_USERNAME` | Backend deploy | EC2 SSH user (e.g. `ubuntu`) |
| `SSH_PRIVATE_KEY` | Backend deploy | EC2 private key (PEM) |
| `MONGO_USERNAME` | Backend deploy | Written to root `.env` on EC2 |
| `MONGO_PASSWORD` | Backend deploy | Written to root `.env` on EC2 |
| `BACKEND_ENV` | Backend deploy | Full contents of `trial-backend/.env` written to EC2 |

---

## Roadmap

**AI & Core Features**
- [ ] AI chat interface with LLM integration
- [ ] Resume upload and parsing (PDF/DOCX)
- [ ] Resume scoring and structured feedback
- [ ] Conversation history persistence
- [ ] User profile and resume management dashboard
- [ ] Subscription / pricing tier

**Image Upload**
- [ ] Profile picture upload to S3 via presigned URL
- [ ] Resume/document file upload to S3
- [ ] S3 bucket lifecycle policy for file management
- [ ] CloudFront serving for uploaded assets

**Testing**
- [ ] Jest unit tests for backend utilities, middleware, and exception classes
- [ ] Supertest integration tests for auth API endpoints (`/register`, `/login`, `/refresh`)
- [ ] React Testing Library unit tests for frontend components (SignIn, SignUp, AuthContext)
- [ ] ESLint enforced in CI pipeline on both frontend and backend
- [ ] GitHub Actions test job runs before deploy — blocks deployment on failure

---

## License

MIT

## Last updated on 15/04/2026
