---
description: Build for production and preview locally (preferred on VM)
---

# Build and Preview

// turbo-all

1. Kill any existing dev/preview server:
```bash
pkill -f "vite" || true
```

2. Run the production build:
```bash
cd /home/JerutaX/Downloads/hr-hub-pro-main && npm run build
```

3. If build fails, fix errors and re-run step 2.

4. Start the preview server:
```bash
cd /home/JerutaX/Downloads/hr-hub-pro-main && npm run preview
```

5. Confirm accessible at `http://localhost:8080`

> **Preferred workflow** on this constrained VM. Uses significantly less memory than the dev server.
