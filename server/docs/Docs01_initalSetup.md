## Initial setup — Server

This document explains how to set up and run the server locally and in production. It lists prerequisites, installation steps, required environment variables, available npm scripts, and the main packages used by the project.

## Quick summary

- Prerequisites: Node (LTS >= 18), npm, MongoDB (or a MongoDB URI)
- Install: `npm install`
- Dev run: `npm run dev`
- Build: `npm run build`
- Start (production): `npm start`

> Note: Commands below assume you're running in a bash-like shell (Git Bash, WSL) on Windows. Adjust for PowerShell/cmd if needed.

## Prerequisites

- Node.js (LTS recommended) — verify with:

```bash
node -v
npm -v
```

- Recommended: Node >= 18
- MongoDB: either a local MongoDB server or a hosted URI (e.g., MongoDB Atlas)

## Clone the repo

```bash
git clone <your-repo-url>
cd "Complate Projects/eduApp/server"
```

## Install dependencies

Install project dependencies with npm:

```bash
npm install
```

This installs both the runtime dependencies and the dev dependencies listed in `package.json`.

## Environment variables

Copy the `.env.example` (or create `.env`) in the project root and set the values. Example:

```ini
# .env.example
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://localhost:27017/eduApp
LOG_DIR=./logs
CLIENT_URL=http://localhost:3001
```

Important variables (validated in `src/configs/_config.ts`):
- NODE_ENV — `development` | `production` | `test`
- PORT — port number the server will listen on (default 3000)
- MONGO_URI — MongoDB connection string
- LOG_DIR — directory for writable logs (default `./logs`)
- CLIENT_URL — optional client URL (CORS / allowed origin)

Make sure your MongoDB is accessible from the server. For local MongoDB, the default `MONGO_URI` above should work if MongoDB is running.

## NPM scripts

Open `package.json`. The important scripts are:

- `npm run dev` — build TypeScript, run `tsc-alias`, and start `nodemon` on `dist/server.js` (recommended for development)
- `npm run build` — compile TypeScript and run `tsc-alias` (prepare `dist/` for production)
- `npm start` — run the compiled `dist/server.js` with `node` (production)

Example usage:

```bash
# development
npm run dev

# build for production
npm run build
npm start
```

## Common project packages (what they do)

Below are the dependencies and why they are included (as of this project):

- express — Fast, minimal web framework for Node.js
- dotenv — Load environment variables from a `.env` file
- mongoose — MongoDB ODM (models and DB connection)
- zod — Runtime schema validation for request/config validation
- cors — Cross-Origin Resource Sharing middleware
- helmet — Security-related HTTP headers
- express-rate-limit — Basic rate limiting middleware
- compression — Gzip compression for responses
- cookie-parser — Parse cookies from requests
- morgan — HTTP request logger (development)
- winston + winston-daily-rotate-file — Application logging and rotating log files
- express-async-handler — Helper to use async route handlers without try/catch boilerplate

Dev dependencies (tools used during development):

- typescript — TypeScript compiler
- tsc-alias — Rewrite compiled import paths (if using path aliases)
- tsx — TypeScript execution environment for Node.js
- nodemon — Auto-restart server during development
- @types/* — Type definitions for Node / Express / other libs

These are listed in `package.json` and will be installed by `npm install`.

## TypeScript build notes

This repo uses TypeScript. `npm run build` will run `tsc` and then `tsc-alias` to rewrite path aliases. The compiled files are placed in `dist/` and `npm start` runs `node dist/server.js`.

## Logs

Logs are written to the directory defined by `LOG_DIR` (default `./logs`). Ensure the process has write permissions to that path.

## Database setup

This project uses MongoDB (via Mongoose). There are no project-specific migration scripts in the repo by default. To set up the DB:

1. Start a MongoDB instance locally, or create a cluster in MongoDB Atlas and copy the connection URI.
2. Set `MONGO_URI` to point to your DB in `.env`.
3. The server connects on startup (see `src/db/database.ts`) and will create collections when documents are first saved.

If you plan to use seeds or migrations, add tools (e.g., `migrate-mongo`, `umzug` with scripts) and document them here.

## Tests & linting

This project does not include a test runner or linter by default. You can add tests (Jest, Vitest) and linters (ESLint) as needed. If you add them, update `package.json` scripts accordingly.

## Troubleshooting

- Port already in use: set a different `PORT` in `.env` or stop the process using the port.
- MongoDB connection error: verify `MONGO_URI`, network access, and credentials (if using Atlas, allow your IP or use proper connection string).
- Invalid config on startup: `src/configs/_config.ts` validates environment variables with zod — check the error printed to the console and fix missing/incorrect values.

## Helpful commands (copy/paste)

```bash
# install deps
npm install

# run in dev (auto rebuild & restart)
npm run dev

# build and run in production
npm run build
npm start
```

## Next steps
 - Building RBAC (Role-Based Access Control) system
 - Building api for authentication 
 - Building api for user management
 - Building api for user roles and permissions
 - Building api for course management
 - Building api for course content management
 - Building api for progress tracking
 - Building api for assessments and quizzes
 - Integrating third-party services (e.g., payment gateways, email services)
 - Implementing frontend to interact with these apis
