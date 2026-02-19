---
description: Start or restart the Vite development server with hot reload
---

# Dev Server

// turbo-all

1. Kill any existing dev server processes:
```bash
pkill -f "vite" || true
```

2. Start the development server:
```bash
cd /home/JerutaX/Downloads/hr-hub-pro-main && npm run dev
```

3. Confirm the server is running at `http://localhost:8080`

> **Note:** On this VM, prefer `build-and-preview` workflow over dev server for stability. Only use dev server when you need hot reload during active development.
