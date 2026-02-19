---
description: Apply a database migration to Supabase via MCP
---

# Database Migration

1. **Write the migration SQL** — Use proper DDL (CREATE TABLE, ALTER TABLE, CREATE POLICY, etc.)

2. **Apply via Supabase MCP:**
   - Use the `apply_migration` tool with project_id `gvhiemfhscdepjrscfyw`
   - Name in snake_case (e.g., `add_employee_schedule_table`)
   - Include RLS policies in the same migration

3. **Verify the migration:**
   - Run `list_tables` via MCP to confirm the table exists
   - Run `execute_sql` to check columns and constraints
   - Run `get_advisors` (security) to check for missing RLS

4. **Regenerate TypeScript types:**
   - Run `generate_typescript_types` via MCP
   - Update `src/integrations/supabase/types.ts` with the output

5. **Update documentation:**
   - Add the new table/change to `DOCUMENTATION.md` under Database Schema
   - Record the migration in `OPERATIONS.md`

> **Critical:** Never use `execute_sql` for DDL operations — migrations won't be tracked. Always use `apply_migration`.
