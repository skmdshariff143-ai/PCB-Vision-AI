# PCB Vision AI — Production Release Checklist

**Target Release Date:** October 21, 2026  
**Target Domain:** `https://pcb-vision-ai-ten.vercel.app`  
**Verified Preview Deployment:** `dpl_ApjvjZ1cZrNMir15AEWTJRBn8VhY`  
**Feature Branch Commit:** `4e3877c`  
**Target Production Branch:** `main`  
**Current Active Production Deployment:** `dpl_25nD1K8cxJXnNQE36NBj1sYDi4tA` (Safe Rollback Target)

---

## 1. Pre-Promotion Verification Checklist

- [x] **Monorepo Root Directory:** Confirmed `web` via `npx vercel project inspect`.
- [x] **Framework Preset:** Confirmed `Next.js` (Node 24.x).
- [x] **Automated Regression Suite:** 19/19 PyTest tests passed in 67.42s.
- [x] **Playwright E2E Multi-Browser:** 100% pass across Chromium, Firefox, WebKit, and 7 viewports.
- [x] **Zero Exfiltration Invariant:** 0 outbound image upload requests recorded.
- [x] **Model Asset Integrity:** `pcb_yolov8n.onnx` (12.78 MB) cached with immutable 1-year header.
- [x] **Clean Reference Template False Positives:** Tested across 20 boards; domain warning documented.
- [x] **Out-of-Distribution Inputs:** Solid black, solid white, and uniform noise verified.
- [x] **Domain Scope & OOD Notice:** Rendered in `HeroSection.tsx` and `InspectorView.tsx`.
- [x] **Security & Supply Chain:** 9 advisories audited for reachability; zero production exposure.
- [x] **Content Security Policy:** Validated without breaking WASM SIMD execution.
- [x] **SEO Assets:** `/sitemap.xml`, `/robots.txt`, `/icon.svg`, `/opengraph-image`, `/llms.txt` active.
- [x] **Legal Pages:** `/privacy` and `/terms` active and verified.
- [x] **Clean Working Tree:** All changes committed on `feature/premium-web-elevation`.
- [ ] **User Authorization:** **Awaiting final user sign-off** before executing promotion.

---

## 2. Release Execution Commands (Awaiting User Command)

```bash
# 1. Merge feature branch into dev
git checkout dev
git merge feature/premium-web-elevation
git push origin dev

# 2. Merge dev into main
git checkout main
git merge dev
git push origin main

# 3. Promote verified deployment directly to production alias
npx vercel promote dpl_ApjvjZ1cZrNMir15AEWTJRBn8VhY --yes

# 4. Run post-promotion smoke probe against production alias
python tests/test_playwright_e2e.py
```
