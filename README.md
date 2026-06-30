# FlatBuddy

FlatBuddy is a student housing marketplace for tenants and owners. It combines listings search, map-based discovery, favorites, conversations, and appointment handling in one full-stack app.

## Project Overview

FlatBuddy is built with a React frontend, an Express + TypeScript backend, Prisma, PostgreSQL, and Socket.io. It supports property discovery across campus areas, owner-managed listings, real-time messaging, and appointment workflows.

## Features

- Student and owner registration with JWT auth
- Listings search with rent, city, bedroom, campus, amenities, and distance filters
- Distance calculation from fixed campus centers using Haversine
- Map view powered by React Leaflet and OpenStreetMap tiles
- Favorites and saved listings
- Real-time conversations with typing indicators
- Appointment requests with owner confirm/decline and tenant cancel
- Owner dashboard for listing management and image uploads
- File uploads stored under `server/uploads`
- Prisma + PostgreSQL data model with seed data

## Tech Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL, Prisma ORM
- Auth: JWT, bcrypt
- Realtime: Socket.io
- Maps: React Leaflet, Leaflet, OpenStreetMap
- Validation: Zod
- Uploads: Multer
- Testing: Vitest

## Folder Structure

```text
flatbuddy/
  docker-compose.yml
  README.md
  server/
    prisma/
    src/
    uploads/
  client/
    src/
```

## Setup

1. Start Postgres:

```bash
docker compose up -d
```

2. Install backend dependencies:

```bash
cd server
npm install
```

3. Create the backend environment file:

```bash
cp .env.example .env
```

4. Run Prisma migrations:

```bash
npx prisma migrate dev
```

5. Seed the database:

```bash
npm run seed
```

6. Start the backend:

```bash
npm run dev
```

7. In a second terminal, install frontend dependencies:

```bash
cd ../client
npm install
```

8. Start the frontend:

```bash
npm run dev
```

## Demo Accounts

The seed data includes demo admin, owner, and tenant accounts with the shared password `Password123!`.

## API Overview

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Listings

- `GET /api/listings`
- `GET /api/listings/:id`
- `POST /api/listings`
- `PUT /api/listings/:id`
- `DELETE /api/listings/:id`
- `POST /api/listings/:id/images`

### Favorites

- `GET /api/favorites`
- `POST /api/favorites/:listingId`
- `DELETE /api/favorites/:listingId`

### Conversations

- `GET /api/conversations`
- `POST /api/conversations`
- `GET /api/conversations/:id/messages`
- `POST /api/conversations/:id/messages`

### Appointments

- `GET /api/appointments`
- `POST /api/appointments`
- `PATCH /api/appointments/:id/status`

## Socket.io Overview

Socket connections authenticate with the same JWT used by the REST API.

Events:

- `conversation:join`
- `message:send`
- `message:new`
- `typing:start`
- `typing:stop`

Messages are persisted to Postgres before the server emits `message:new` to the correct conversation room.

## Campus Distance Logic

Listings are matched against fixed campus center coordinates for:

- USC
- UCLA
- NYU
- Columbia
- Boston University

Distance is computed with the Haversine formula. No geocoding APIs are used.

## Uploads

Images are stored in `server/uploads` and served from `/uploads`.

Allowed file types:

- jpg
- jpeg
- png
- webp

Maximum file size:

- 5 MB

## Testing

Backend utility test:

```bash
cd server
npm test
```

## Troubleshooting

- If Prisma reports `DATABASE_URL` missing, copy `server/.env.example` to `server/.env`.
- If `docker compose up -d` fails, make sure Docker Desktop is running.
- If Leaflet map tiles do not appear, confirm the browser has internet access for OpenStreetMap tiles.
- If uploaded images do not show, check that the backend is running on port `4000` and that the file exists in `server/uploads`.
