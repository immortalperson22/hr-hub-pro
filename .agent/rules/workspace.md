# Workspace Rules — HR Hub Pro (Sagility)

## Supabase Configuration
- **Project ID:** `gvhiemfhscdepjrscfyw`
- **Region:** ap-southeast-1
- **Database:** PostgreSQL 17
- **Project Name:** immortalperson22's Project

## Database Rules

### Tables (public schema)
| Table | Purpose |
|-------|---------|
| `profiles` | User profile data (name, phone) |
| `user_roles` | Role assignment (applicant/employee/admin) |
| `document_uploads` | PDF file tracking with review status |
| `submissions` | Salary/policy PDF submissions |
| `applicants` | Applicant onboarding status |

### Row Level Security (RLS)
- **Every new table MUST have RLS enabled** — no exceptions
- Users can only access their own data via `auth.uid() = user_id`
- Admin access uses `public.has_role(auth.uid(), 'admin')`
- Never use `USING (true)` in production policies

### Roles
- 3 roles via `app_role` enum: `applicant`, `employee`, `admin`
- Default role for new signups: `applicant`
- Role checks use the `has_role()` security definer function
- Never check roles on the client side alone — always enforce via RLS

### Migrations
- Use Supabase MCP `apply_migration` for all DDL operations (CREATE, ALTER, DROP)
- Never run DDL via `execute_sql` — it won't be tracked
- Name migrations in snake_case: `add_employee_schedule_table`
- After migration, regenerate TypeScript types

## Authentication
- All auth goes through Supabase Auth
- Email-only MFA (SMS/Voice removed in v1.4)
- Email verification required before access
- Password requirements: 8+ chars, upper, lower, number, special character
- Redirect URLs must be configured in Supabase dashboard

## File Uploads
- **PDF files only** — validate MIME type (`application/pdf`) on client AND storage policy
- **Max file size:** 10MB per file
- Validate on the client before upload, reject non-PDF with clear error
- Store in Supabase Storage with user-scoped paths: `{user_id}/{filename}`

## Brand & Design
| Element | Value |
|---------|-------|
| Primary Color | `#00CEC8` (Teal) |
| Theme | Dark mode default |
| Heading Font | Montserrat (300–700) |
| Body Font | Inter (400–700) |
| Icons | Lucide React |
| UI Library | shadcn/ui |

## Routing & Access Control
- Protected routes must check both authentication AND user role
- Unauthorized users redirect to `/auth`
- Role-based rendering: Admin → AdminDashboard, Employee → EmployeeDashboard, Applicant → ApplicantDashboard
- Public routes: `/auth`, `/forgot-password`, `/reset-password`, `/verify`

## Status Workflow Pattern
- All status fields follow: `pending → approved | rejected`
- Always include `admin_comment` for rejection reasons
- Track `reviewed_by` and `reviewed_at` for audit trail
- Status changes are admin-only actions (enforced via RLS)

## Port Configuration
- Development server: `http://localhost:8080`
- Preview server: `http://localhost:8080`
- Configure in `vite.config.ts`
