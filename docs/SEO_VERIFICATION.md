# PCB Vision AI — Technical SEO & Discoverability Verification

**Audit Date:** October 21, 2026  
**Canonical Domain:** `https://pcb-vision-ai-ten.vercel.app`  
**Auditor:** Technical SEO Specialist

---

## 1. Technical SEO Asset Verification Matrix

| SEO Asset | Route / File | Status | Verification Detail |
|---|---|:---:|---|
| **Canonical URL** | `layout.tsx` | **VERIFIED** | Enforced as `https://pcb-vision-ai-ten.vercel.app` across all pages |
| **Meta Title & Description** | `layout.tsx` | **VERIFIED** | Unique title template `%s \| PCB Vision AI`, keyword-optimized description |
| **Sitemap** | `/sitemap.xml` | **VERIFIED** | Dynamically generated XML sitemap with `/`, `/privacy`, `/terms` |
| **Robots Policy** | `/robots.txt` | **VERIFIED** | Allows `/`, blocks private paths, references canonical sitemap |
| **Social OpenGraph Card** | `/opengraph-image` | **VERIFIED** | High-contrast $1200 \times 630$ PNG generated via `@vercel/og` |
| **Vector Favicon** | `/icon.svg` | **VERIFIED** | Crisp SVG vector icon with emerald circuit board traces |
| **Structured Data** | `layout.tsx` | **VERIFIED** | Valid schema.org `SoftwareApplication` and `WebSite` JSON-LD graphs |
| **AI LLM Crawler Manifest** | `/llms.txt` | **VERIFIED** | Structured markdown summary for LLM search indexers and AI agents |

---

## 2. Google Search Console Setup Instructions

Upon production deployment approval:
1. Access [Google Search Console](https://search.google.com/search-console).
2. Add Property: `https://pcb-vision-ai-ten.vercel.app`.
3. Choose HTML Tag verification method and insert tag into `web/app/layout.tsx` metadata (or use DNS TXT verification).
4. Submit sitemap URL: `https://pcb-vision-ai-ten.vercel.app/sitemap.xml`.
5. Request indexing on the root URL `/`.
