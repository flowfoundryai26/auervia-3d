# AUREVIA — Fictional Luxury Fragrance Concept

A premium, immersive 3D concept website for **AUREVIA**, a fictional luxury fragrance house. Built as a portfolio piece — no real products, orders, reviews or customer data are involved. All forms run in clearly-labelled demo mode and store nothing.

Concept by [FlowFoundry AI Solutions](https://www.flowfoundryai.in).

## Stack
- Vite + React 19 + TypeScript (SPA; mirrors the requested Next.js App Router experience in this workspace)
- Tailwind CSS v4
- Three.js via React Three Fiber + Drei (procedural glass flacon — no external GLB needed)
- GSAP ScrollTrigger for scroll reveals
- Framer Motion for UI micro-interactions, Lucide icons

## Features
- Interactive procedural perfume bottle: transmission glass, coloured liquid per fragrance, metallic cap, canvas-generated label, sparkles & studio lighting
- Hero bottle reacts to pointer & scroll; 360° OrbitControls experience with zoom, auto-rotate and cap lift
- Fragrance / size / finish selection, product modals, working shopping-bag drawer (demo checkout)
- Scroll-animated fragrance-notes pyramid, editorial story & craftsmanship sections
- Newsletter + contact forms with validation and explicit demo states
- Static-image fallback when WebGL/reduced-motion is detected; responsive & accessible (labels, aria, focus states)

## Run locally
```bash
npm install
npm run dev
```
Open the printed local URL.

## Production build
```bash
npm run build
npm run preview   # optional local preview of dist/
```

## Deploy
- **Vercel:** import the repo, framework preset *Vite*, build command `npm run build`, output `dist`.
- Any static host (Netlify, Cloudflare Pages, S3) can serve the `dist/` folder.

## Performance notes
3D is code-split by the bundler, uses capped device-pixel-ratio and a low-sample transmission material. On low-performance or reduced-motion devices the hero falls back to photography via the on-page 3D/Static toggle.
