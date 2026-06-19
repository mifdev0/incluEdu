# Production setup

## 1. Supabase

1. Create a Supabase project.
2. Open SQL Editor and run `supabase/migrations/202606190001_initial_production_schema.sql`.
3. Copy the project URL and anon key into `.env.local`.
4. Keep the service-role key server-only. Never prefix it with `NEXT_PUBLIC_`.
5. In Authentication settings, configure the production site URL and allowed redirect URLs.

## 2. DeepSeek

Set `DEEPSEEK_API_KEY` as a server environment variable. AI requests go through `/api/ai`; the key is never sent to the browser.

AI-supported workflows:

- assisted learning-needs identification;
- draft PPI goals and teaching strategies;
- observation analysis and narrative reports.

AI output must be reviewed by the teacher and must not be treated as a medical diagnosis.

## 3. Deployment

Add all variables from `.env.example` to the hosting provider, apply the database migration, then run:

```bash
npm run build
npm start
```

Before accepting real student data, review privacy notices, retention rules, access control, backups, and institutional consent requirements.
