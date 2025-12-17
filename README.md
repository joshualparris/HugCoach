# HugCoach

Local-first learning loops for relationship growth, built with Next.js, Prisma, and Postgres.

## Local Development (Postgres)

1. Create a Postgres database (local Docker or hosted).
2. Copy the env file and update values:

```bash
cp .env.example .env
```

Set:
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`

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

## Deploy to Vercel (Easiest)

1. Push this repo to GitHub.
2. In Vercel, create a new project from the repo.
3. In Vercel, open **Storage** and create a **Postgres** database, then attach it to the project.
   - This auto-injects `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING`.
4. Redeploy. The build runs `prisma migrate deploy` automatically.
5. Seed the database once (run locally using the Vercel DB URLs):

```bash
POSTGRES_PRISMA_URL="your_vercel_postgres_prisma_url" \
POSTGRES_URL_NON_POOLING="your_vercel_postgres_non_pooling_url" \
  npx prisma db seed
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
