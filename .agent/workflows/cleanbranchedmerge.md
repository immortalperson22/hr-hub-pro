---
description: Git branching workflow for clean feature development and merging
---

# Clean Branch and Merge

## Creating a Feature Branch

1. Make sure you're on the latest main:
```bash
cd /home/JerutaX/Downloads/hr-hub-pro-main && git checkout main && git pull origin main
```

2. Create a new feature branch:
```bash
git checkout -b feat/your-feature-name
```

Branch naming convention:
- `feat/` — new features
- `fix/` — bug fixes
- `refactor/` — code refactoring
- `docs/` — documentation changes

## Working on the Branch

3. Make your changes and commit with conventional commits:
```bash
git add .
git commit -m "feat: description of the change"
```

4. Push the branch to remote:
```bash
git push origin feat/your-feature-name
```

## Merging Back to Main

5. Switch to main and pull latest:
```bash
git checkout main && git pull origin main
```

6. Merge the feature branch:
```bash
git merge feat/your-feature-name
```

7. If there are merge conflicts, resolve them, then:
```bash
git add .
git commit -m "chore: resolve merge conflicts from feat/your-feature-name"
```

8. Push to remote:
```bash
git push origin main
```

## Cleanup

9. Delete the merged branch locally:
```bash
git branch -d feat/your-feature-name
```

10. Delete the remote branch:
```bash
git push origin --delete feat/your-feature-name
```

> **Tip:** Always run `npm run build` before merging to ensure the feature branch builds cleanly.
