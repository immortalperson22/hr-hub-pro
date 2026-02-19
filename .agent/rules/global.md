# Global Rules — HR Hub Pro (Sagility)

## Tech Stack
- React 18 + TypeScript (strict) + Vite + Supabase + TailwindCSS + shadcn/ui
- All code must be in TypeScript. No `any` types without explicit justification in a comment.

## Formatting
- 2-space indentation
- Single quotes for strings
- Semicolons required
- Max line length: 120 characters

## Naming Conventions
| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `ApplicantDashboard` |
| Types/Interfaces | PascalCase | `UserProfile` |
| Variables/Functions | camelCase | `fetchUserRole` |
| Constants | UPPER_SNAKE_CASE | `MAX_FILE_SIZE` |
| Files (components) | PascalCase | `AdminDashboard.tsx` |
| Files (utils/hooks) | camelCase | `useAuth.tsx` |

## Imports
- Use `@/` path alias for all local imports
- Order: React → third-party → local components → hooks → utils → types
- Group with blank lines between sections

## Components
- Functional components only — no class components
- Prefer composition over inheritance
- Keep components under 200 lines; extract sub-components if larger
- Co-locate related components in the same directory

## Error Handling
- Always wrap async operations in try/catch
- Show user-friendly errors via `sonner` toast
- Log errors to console in development
- Never expose raw error messages to users

## Environment Variables
- All keys, URLs, and secrets go in `.env`
- Prefix with `VITE_` for client-side variables
- Never commit `.env` — it is in `.gitignore`
- Never hardcode API keys, tokens, or passwords in source files

## Documentation
- Update `DOCUMENTATION.md` version history after any feature change
- Update `OPERATIONS.md` with session details after each work session
- Use JSDoc comments for complex utility functions

## Git Commits
- Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `test:`
- Keep commit messages concise but descriptive
- One logical change per commit

## VM Awareness
- This project runs on a constrained VM (8GB RAM, 4 cores)
- Prefer `npm run build && npm run preview` over `npm run dev` when testing
- Close heavy apps (Firefox, VS Code) when running the app
- Monitor memory: `watch -n 1 free -h`

## Dependencies
- Do not add new dependencies without justification
- Prefer existing packages in `package.json` over new ones
- Run `npm audit` after adding any new dependency
