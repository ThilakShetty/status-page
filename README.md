# Status Page Application

A full-stack status page application built for monitoring services and incidents.

## Tech Stack

**Backend:**
- Node.js + Express + TypeScript
- Prisma ORM + SQLite
- Socket.IO for real-time updates
- Clerk for authentication (optional)

**Frontend:**
- React + Vite + TypeScript
- React Router for routing
- Axios for API calls

## Setup Instructions

### Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Backend runs on: `http://localhost:5000`

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

## Environment Variables

### Backend `.env`
```
DATABASE_URL="file:./dev.db"
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env`
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Features

- ✅ Service monitoring dashboard
- ✅ Incident management
- ✅ Real-time updates via WebSocket
- ✅ Public status page
- ✅ Multi-tenant support

## API Endpoints

- `GET /health` - Health check
- `GET /api/organizations/:orgId/services` - List services
- `POST /api/organizations/:orgId/services` - Create service
- `PATCH /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service
- `GET /api/public/status/:slug` - Public status page

## Organization ID

Current test org ID: `cmlahot3g0000109tmyku278d`
Current test slug: `acme-corp`

Update these in frontend pages if needed.
