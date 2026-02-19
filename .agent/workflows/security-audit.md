---
description: Full security vulnerability audit for Supabase, dependencies, auth, and storage
---

# Security Audit

Run this workflow periodically or before any deployment to check for vulnerabilities.

## 1. Supabase Security Advisors
Use Supabase MCP `get_advisors` with type `security` on project `gvhiemfhscdepjrscfyw`.
- Check for missing RLS policies
- Check for overly permissive policies
- Check for exposed functions

## 2. Supabase Performance Advisors
Use Supabase MCP `get_advisors` with type `performance` on project `gvhiemfhscdepjrscfyw`.
- Check for missing indexes
- Check for slow queries
- Check for bloated tables

## 3. npm Dependency Audit
```bash
cd /home/JerutaX/Downloads/hr-hub-pro-main && npm audit
```
- Review any vulnerabilities found
- Fix critical/high severity issues with `npm audit fix`
- Document any unfixable issues

## 4. Auth Configuration Review
Verify the following:
- [ ] Email verification is required before login
- [ ] MFA is email-only (no SMS/Voice)
- [ ] Password requirements enforced (8+ chars, upper, lower, number, special)
- [ ] Redirect URLs in Supabase dashboard are correct (localhost:8080 only)
- [ ] No open signup without email confirmation

## 5. Secrets & Environment Check
```bash
cd /home/JerutaX/Downloads/hr-hub-pro-main && grep -rn "sbp_\|supabase_\|sk_\|api_key\|secret\|password" --include="*.ts" --include="*.tsx" --include="*.js" src/
```
- Must return zero results (no hardcoded secrets in source)
- Verify `.env` is in `.gitignore`

## 6. Storage Policy Audit
Verify via Supabase MCP or dashboard:
- [ ] Upload buckets enforce PDF-only MIME type (`application/pdf`)
- [ ] Max file size limit is set (10MB)
- [ ] Bucket-level RLS restricts access to file owner
- [ ] Admin override policy exists for review

## 7. RLS Policy Audit per Table
For each table (`profiles`, `user_roles`, `document_uploads`, `submissions`, `applicants`):
- [ ] SELECT: Users see only their own rows (`auth.uid() = user_id`)
- [ ] INSERT: Users can only insert for themselves
- [ ] UPDATE: Users can only update their own rows (or admin via `has_role()`)
- [ ] DELETE: Restricted or disabled
- [ ] Admin policies use `has_role(auth.uid(), 'admin')` — not client-side checks

## 8. Generate Report
Summarize findings in a table:

| # | Issue | Severity | Table/Area | Recommendation |
|---|-------|----------|------------|----------------|
| 1 | Example | Critical/Warning/Info | table_name | Fix description |

Severity levels:
- **Critical** — Immediate fix required (data exposure, auth bypass)
- **Warning** — Should fix soon (missing policies, weak config)
- **Info** — Best practice recommendation
