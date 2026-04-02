# Supabase Setup Instructions for User

## Prerequisites

- Node.js project at `el-shaddai-revival-centre/`
- Supabase account at [supabase.com](https://supabase.com)

## Step-by-Step Setup

### 1. Create Supabase Project

```
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Enter project name: el-shaddai-revival-centre
4. Set password, region (closest to users), create
5. Wait for project to be ready (~2 min)
```

### 2. Get Credentials

```
Settings > API:
- URL: https://[project-id].supabase.co
- anon/public key: eyJ... (copy full)
- service_role key: eyJ... (copy full, secret!)
```

### 3. Configure Environment ✅

```
cp .env.example .env.local  # Template created by BLACKBOXAI
# Edit .env.local - paste from Supabase Dashboard > Settings > API:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Restart required:** `rm -rf .next && npm run dev`
**Verify:** Console shows "✅ Supabase is configured and ready"

### 4. Create Database Tables

```
1. Dashboard > SQL Editor
2. Copy/paste schema from SUPABASE_SCHEMA.md
3. Run all queries
4. Run additional migrations:
   - SUPABASE_MIGRATION-COUNSELLING-SLOTS.sql
```

### 5. Test Connection

```bash
cd el-shaddai-revival-centre
npm install
npm run dev
```

Check console: Should show "✅ Supabase is configured and ready"

### 6. Test APIs

```bash
curl http://localhost:3000/api/admins
curl http://localhost:3000/api/events
```

### 7. Create Super Admin (run once)

```bash
node scripts/create-super-admin.js
```

### 8. Seed Initial Data (optional)

- Add team members via admin dashboard
- Upload media to Supabase Storage
- Configure settings via API

## Troubleshooting

- "Supabase not configured": Check .env.local vars
- Import errors: `rm -rf .next && npm run dev`
- RLS errors: Check table policies in Supabase
- Schema errors: Verify SUPABASE_SCHEMA.md matches db.ts types

## Next Steps After Setup

- [ ] Test all forms (donations, counselling, testimonies)
- [ ] Migrate data from old MongoDB
- [ ] Remove mongoose: `npm uninstall mongoose`
- [ ] Deploy to Vercel (auto-deploys Supabase integration)

**Setup complete when: npm run dev shows ✅ and APIs return data!**
