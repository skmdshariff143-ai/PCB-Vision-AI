# Release Notes — PCB Vision AI v2.0.0

**Release Tag:** `v2.0.0` (Premium Web Architecture, Security, SEO & UI/UX Elevation)  
**Release Date:** October 21, 2026  
**Author:** Shaik Mahammad Shariff  
**Repository:** `https://github.com/skmdshariff143-ai/PCB-Vision-AI`  
**Production URL:** `https://pcb-vision-ai-ten.vercel.app`

---

## What's New in Version 2.0.0

### 1. Premium Industrial UI/UX Elevation
- **Engineering Hero Banner:** Added an industrial-grade onboarding hero section outlining the dual-paradigm architecture (Classical DIP + YOLOv8 Deep Learning), key benchmark metrics (95.64% mAP@50, 94.48% Recall), and an expandable technical drawer detailing the six defect classes and domain limitations.
- **Drag-and-Drop Image Dropzone:** Intuitive drag-and-drop file upload with visual feedback, 10 MB file size limit, and automatic MIME-type validation (PNG, JPG, WEBP).
- **Interactive Optical Zoom & Pan:** Added 1x, 1.5x, 2x, 3x optical zoom controls with smooth mouse-drag panning across high-resolution circuit traces.
- **Per-Class Defect Filtering:** Added interactive checkbox pills allowing real-time toggling of individual defect classes on the canvas without re-running inference.
- **Before / After Comparison Toggle:** Added a single-click button to toggle bounding box overlays and inspect the pristine source PCB surface.

### 2. Trust, Transparency & Academic Credibility
- **Truthful Diagnostic Verdicts:** Replaced ambiguous "PASS / Certificate" terminology with "NO ANOMALIES DETECTED (within model threshold & bare-PCB DeepPCB domain)" and "Inspection Report".
- **Dedicated Privacy Policy (`/privacy`):** Fully articulated disclosure of 100% client-side WebAssembly inference, zero cloud server image uploads, and intellectual property protection.
- **Dedicated Terms of Use (`/terms`):** Detailed non-commercial academic licensing, IPC defect definitions, and explicit disclaimer that optical inspection does not substitute for in-circuit bed-of-nails continuity testing.
- **Scholarly Citations:** Embedded formal citations for Tang et al. (2019) DeepPCB dataset and IPC electronics manufacturing standards.

### 3. Technical SEO & Indexability
- **Dynamic XML Sitemap (`/sitemap.xml`):** Generates Sitemaps.org XML indexing roadmap.
- **Robots.txt (`/robots.txt`):** Configured crawler indexing directives with sitemap pointer.
- **Dynamic OpenGraph Social Card (`/opengraph-image`):** Edge-rendered 1200&times;630 px branded social preview image.
- **Vector Favicon (`/icon.svg`):** Modern SVG circuit trace icon.
- **LLM Summary (`/llms.txt`):** Structured markdown documentation for AI web crawlers and LLMs.
- **Structured JSON-LD Data:** Embedded `schema.org/SoftwareApplication` and `schema.org/WebSite` schemas.

### 4. Application Security & Headers
- **Content Security Policy (CSP):** Implemented strict CSP in `next.config.mjs` ensuring compatibility with ONNX Runtime Web WASM SIMD multi-threading (`'wasm-unsafe-eval'`) while preventing unauthorized script execution.
- **Defensive Headers:** Configured `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy`.
- **Custom 404 Page (`/_not-found`):** Industrial-themed dark not-found page with circuit-trace graphic and navigation shortcuts.

### 5. Accessibility (WCAG 2.2 Level AA)
- High-contrast visible focus rings (`focus-visible:ring-2 focus-visible:ring-emerald-500`).
- Minimum 44px mobile touch targets.
- Explicit `aria-label` attributes on all icon-only buttons.
- Dual visual canvas and screen-reader accessible HTML table for defect inventory records.
