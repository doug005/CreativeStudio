# CreativeStudio

A React (Webpack) + Express content creator portal backed by MongoDB Atlas. Viewers can browse and engage with published work; creators can manage content, scheduling, and comment moderation in a protected dashboard. The frontend is React with React Router; Vite is not used.

## Requirements

- Node.js 20+
- MongoDB Atlas database and connection string
- npm

## Local setup

1. Install dependencies from the repository root with `npm install`.
2. Copy `server/.env.example` to `server/.env` and set `MONGODB_URI`, `JWT_SECRET`, and `CLIENT_URL`.
3. Copy `client/.env.example` to `client/.env` if needed and set `REACT_APP_API_URL` (the default is `http://localhost:5000/api`).
4. Run `npm run seed` once to create the initial creator and demonstration content.
5. Run `npm run dev`; the React client is at http://localhost:3000 and API at http://localhost:5000.

Default seeded login: `creator@creatorspace.local` / `ChangeMe123!`. Change these using `SEED_CREATOR_EMAIL` and `SEED_CREATOR_PASSWORD` before seeding a real environment. Never use the demo password in production.

Creators can also create an account from the **Creator login** section on the homepage. New account passwords must be at least 12 characters; registration is rate limited. The existing seeded account remains available for local demonstration.

## Environment variables

See `server/.env.example` and `client/.env.example`. The server refuses to start without a MongoDB URI and JWT secret. Never commit `.env` files.

## Deployment

- **MongoDB Atlas:** create a free cluster, database user, and network access rule; set the production `MONGODB_URI` on Render.
- **Render:** create a Web Service from this repository. Build command: `npm install`; start command: `npm run start -w server`. Configure `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL` (the deployed Vercel origin), `SEED_CREATOR_EMAIL`, and `SEED_CREATOR_PASSWORD`. Root directory should be the repository root.
- **Vercel:** import the same repository, set the Root Directory to `client` and Framework Preset to Other. Use build command `npm run build` and output directory `dist`. Set `REACT_APP_API_URL` to the Render API origin plus `/api` (for example `https://your-service.onrender.com/api`). `client/vercel.json` handles SPA routes.
- Run the seed command against the production environment once using Render's shell or a trusted local environment configured with production variables. Do not share secrets in source control.

Deployment requires your Atlas, Render, and Vercel accounts and credentials; the app has not been published or pushed anywhere.

## API overview

Public: `GET /api/contents`, `GET /api/contents/:id`, `POST /api/comments`, `GET /api/comments/:contentId`, `POST /api/likes`, `POST /api/contents/:id/view`, `POST /api/auth/login`, `POST /api/auth/register`.
Protected with `Authorization: Bearer <JWT>`: content create/update/delete, dashboard stats, comment moderation.

## Notes

Scheduled content is enforced in API queries and promoted by a periodic database task. Comments are pending moderation by default. Likes are deduplicated using a browser-generated anonymous viewer key. The database, not frontend constants, is the source of content and statistics.
