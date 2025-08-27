# Local Hosting Guide

## Quick Start (Development)
```bash
cd "C:\Users\tomer\achieve-and-level"
npm run dev
```
Then open: http://localhost:8080

## Production Build (Local)
```bash
# Build the production version
npm run build

# Preview the production build
npm run preview
```

## Serve Production Build
```bash
# Install a simple server
npm install -g serve

# Serve the built files
serve dist
```

## Network Access (Share with others on your network)
```bash
# Development with network access
npm run dev -- --host

# Production with network access  
serve dist --listen 8080 --single
```

## Key Commands:
- `npm run dev` - Development server with hot reload
- `npm run build` - Create production build in `dist/` folder
- `npm run preview` - Preview production build locally
- `serve dist` - Host production build (requires: npm install -g serve)

## Files Location:
- Source code: `src/`
- Built files: `dist/`
- Config: `vite.config.ts`