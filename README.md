# FlatBuddy

FlatBuddy is a student housing marketplace that connects tenants and owners with listings, search filters, map discovery, favorites, chat, and appointment handling.

## Highlights

- Authentication for tenants, owners, and admins
- Listings search with filters and map-based browsing
- Favorites, conversations, and appointment workflows
- Owner dashboard for listing management and image uploads
- React frontend, Express backend, Prisma, PostgreSQL, and Socket.io

## Stack

- React
- Vite
- TypeScript
- Express
- Prisma
- PostgreSQL
- Socket.io
- Tailwind CSS

## Project Structure

```text
flatbuddy/
  client/
  server/
  screenshots/
```

## Notes

- The app includes demo data for showcasing core flows.
- Images are stored in the server upload folder.
- Messages are delivered in real time and persisted to the database.

## Quick Start

```bash
docker compose up -d
cd server && npm install && npm run dev
cd ../client && npm install && npm run dev
```
