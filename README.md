# Full Stack Todo Application

A full-stack Todo application built with React, Node.js, MongoDB, and Docker, deployed on AWS.

---

## Tech Stack

**Frontend**
- React + Vite
- Nginx for static file serving and reverse proxy (local only)
- AWS S3 + CloudFront (production)

**Backend**
- Node.js + Express
- RESTful API with `/api` prefix

**Database**
- MongoDB with Mongoose ODM
- Docker Volume for data persistence

**DevOps**
- Docker & Docker Compose
- AWS EC2 with Elastic IP (backend + database)
- AWS S3 + CloudFront (frontend)
- GitHub Actions CI/CD pipeline
- Cron job for auto-restart on reboot

---

## Features

- Create, read, update, and delete todos
- Data persisted in MongoDB
- Containerized backend with Docker for consistent environments
- Automated deployment via GitHub Actions
- Frontend served globally via CloudFront CDN
- Auto-start on EC2 reboot

---

## Project Structure
```
trial-project/
  docker-compose.yml    (local development only)
  trial-frontend/
    Dockerfile          (local development only)
    nginx.conf          (local development only)
    src/
  trial-backend/
    docker-compose.yml
    Dockerfile
    .env.example
    server.js
    router.js
    models/
      Todo.js
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
git clone git@github.com:your-username/trial-project.git
cd trial-project
```

2. Create `.env` file
```bash
cp trial-backend/.env.example trial-backend/.env
```

Fill in your values:
```
MONGO_USERNAME=admin
MONGO_PASSWORD=yourpassword
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

| Method | Endpoint | Description |
|--|--|--|
| GET | /api/todos | Get all todos |
| POST | /api/todos | Create a todo |
| PUT | /api/todos/:id | Update a todo |
| DELETE | /api/todos/:id | Delete a todo |

---

## Docker Setup

### Local (three services)

| Service | Image | Port |
|--|--|--|
| frontend | nginx:alpine | 80 |
| backend | node:24 | 5000 |
| mongodb | mongo:7 | 27017 (internal only) |

### Production (two services)

| Service | Image | Port |
|--|--|--|
| backend | node:24 | 5000 |
| mongodb | mongo:7 | 27017 (internal only) |

The `frontend` service uses a Docker Compose profile and is only started locally:
```bash
docker-compose --profile local up  # starts all three services
docker-compose up                  # starts backend and mongodb only
```

---

## Nginx Configuration

Nginx is used in local development only. In production, CloudFront handles both responsibilities.

**1. Static File Serving**

Serves the compiled React application from the `dist` folder built by Vite. All non-API requests return `index.html` to support React client-side routing.
```nginx
location / {
    root /usr/share/nginx/html;
    index index.html;
    try_files $uri $uri/ /index.html;
}
```

**2. Reverse Proxy**

All requests starting with `/api` are forwarded to the backend container internally. This means the frontend never hardcodes the backend address — it always requests `/api/todos`, and Nginx handles the forwarding to `backend:5000`.
```nginx
location /api {
    proxy_pass http://backend:5000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
}
```

In production, CloudFront replaces Nginx:
- Static files are served from S3
- `/api/*` requests are forwarded to EC2:5000 via CloudFront Behavior

This approach means:
- The frontend `.env` only needs `VITE_API_KEY='/api'`
- No matter where the app is deployed, the API URL never needs to change
- The backend is not directly accessible from the outside

---

## CI/CD Pipeline

**GitHub Actions** (`/.github/workflows/deploy.yml`)
- Triggered on every push to `main` branch

**Frontend job:**
- Install dependencies and build with Vite
- Sync `dist/` to S3
- Invalidate CloudFront cache

**Backend job:**
- SSH into AWS EC2 server
- Pull latest code from GitHub
- Rebuild and restart Docker containers

**EC2 Auto-restart** (`/etc/crontab`)
- On every EC2 reboot, automatically pulls latest code and starts Docker services

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
3. Install Docker and Docker Compose
4. Clone `trial-backend` repository to server
5. Create `.env` file on server
6. Run `docker-compose up -d --build`

### GitHub Actions Setup
Add the following secrets to your GitHub repository:
```
SSH_PRIVATE_KEY                - EC2 private key
SSH_HOST                       - EC2 Elastic IP
SSH_USERNAME                   - ubuntu
MONGO_USERNAME                 - MongoDB username
MONGO_PASSWORD                 - MongoDB password
AWS_ACCESS_KEY_ID              - IAM Access key
AWS_SECRET_ACCESS_KEY          - IAM Secret key
AWS_CLOUDFRONT_DISTRIBUTION_ID - CloudFront Distribution ID
S3_BUCKET_NAME                 - S3 bucket name
```

---

## Accessing MongoDB

MongoDB port is not exposed to the public for security reasons. Use SSH tunneling to connect via MongoDB Compass.

### SSH Tunnel

Run this command on your local machine:
```bash
ssh -i your-key.pem -L 27017:localhost:27017 ubuntu@your-elastic-ip
```

### Connect with MongoDB Compass
```
mongodb://admin:yourpassword@localhost:27017
```

Keep the SSH tunnel terminal open while using Compass.

---

## Environment Variables

| Variable | Description |
|--|--|
| MONGO_USERNAME | MongoDB root username |
| MONGO_PASSWORD | MongoDB root password |
| MONGO_URL | Full MongoDB connection string (auto-generated) |
| VITE_API_KEY | Frontend API base URL (default: /api) |

---

## License

MIT
