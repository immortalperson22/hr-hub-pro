---
description: Pre-deployment checklist to verify everything is ready
---

# Deploy Check

1. **Build check:**
```bash
cd /home/JerutaX/Downloads/hr-hub-pro-main && npm run build
```
Must complete with zero errors.

2. **Lint check:**
```bash
cd /home/JerutaX/Downloads/hr-hub-pro-main && npm run lint
```
Must pass with no errors (warnings acceptable).

3. **Environment check:**
   - Verify `.env` contains `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
   - Confirm values match the production Supabase project

4. **Database check (via Supabase MCP):**
   - Run `list_tables` — verify all expected tables exist
   - Run `get_advisors` (security) — check for RLS issues
   - Run `get_advisors` (performance) — check for performance issues

5. **Update documentation:**
   - Bump version in `DOCUMENTATION.md`
   - Ensure version history is up to date
   - Record deployment in `OPERATIONS.md`
