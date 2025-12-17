# HugCoach

Local-first learning loops for relationship growth, built with Next.js, Prisma, and Postgres.

## Local Development (Postgres)

1. Create a Postgres database (local Docker or hosted).
2. Copy the env file and update values:

```bash
cp .env.example .env
```

3. Install dependencies and run migrations:

```bash
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

4. Start the dev server:

```bash
npm run dev
```

## Deploy to Vercel (Persistent)

1. Push this repo to GitHub.
2. In Vercel, create a new project from the repo.
3. Add a **Vercel Postgres** database from the Storage tab.
4. Set environment variables in Vercel:
   - `DATABASE_URL` = `POSTGRES_PRISMA_URL`
   - `DIRECT_URL` = `POSTGRES_URL_NON_POOLING`
5. Deploy. The build runs `prisma migrate deploy` automatically.
6. Seed the database once (run locally using the Vercel DB URL):

```bash
DATABASE_URL="your_vercel_postgres_prisma_url" DIRECT_URL="your_vercel_postgres_non_pooling_url" npx prisma db seed
```

## Useful Commands

```bash
npm run dev
npm run build
npm run start

npx prisma migrate dev
npx prisma migrate deploy
npx prisma db seed
```
