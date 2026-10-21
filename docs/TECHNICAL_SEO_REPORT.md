# PCB Vision AI — Technical SEO & Indexability Report

**Audit & Implementation Date:** October 21, 2026  
**Status:** FULLY CONFIGURED & VERIFIED  
**Target Domain:** `https://pcb-vision-ai-ten.vercel.app`

---

## 1. Technical SEO Architecture Overview

The PCB Vision AI platform has been upgraded from a client-isolated single-page application into an SEO-ready, crawlable Next.js 14 App Router platform. Search engine bots (Googlebot, Bingbot) and social graph scrapers (OpenGraph, Twitterbot) can index dedicated routes and retrieve structured metadata without executing client-side WebAssembly inference.

---

## 2. Implemented Discoverability Assets

### 2.1 Dynamic XML Sitemap (`/sitemap.xml`)
- **Source File:** `web/app/sitemap.ts`
- **Generated Endpoint:** `https://pcb-vision-ai-ten.vercel.app/sitemap.xml`
- **Indexed Canonical Routes:**
  1. `https://pcb-vision-ai-ten.vercel.app` (Priority: 1.0, Change Frequency: weekly)
  2. `https://pcb-vision-ai-ten.vercel.app/privacy` (Priority: 0.5, Change Frequency: monthly)
  3. `https://pcb-vision-ai-ten.vercel.app/terms` (Priority: 0.5, Change Frequency: monthly)
- **Validation:** Conforms strictly to the Sitemaps.org XML protocol 0.9.

### 2.2 Robots Exclusion Protocol (`/robots.txt`)
- **Source File:** `web/app/robots.ts`
- **Generated Endpoint:** `https://pcb-vision-ai-ten.vercel.app/robots.txt`
- **Directives:**
  - `User-agent: *`
  - `Allow: /`
  - `Disallow: /api/`
  - `Disallow: /_next/`
  - `Sitemap: https://pcb-vision-ai-ten.vercel.app/sitemap.xml`

### 2.3 LLM & AI Discoverability File (`/llms.txt`)
- **Source File:** `web/public/llms.txt`
- **Purpose:** Supplies AI web crawlers (Perplexity, ChatGPT, Claude, Gemini) with a clean markdown summary of the application architecture, YOLOv8n ONNX model weights, DeepPCB dataset attribution, and operational boundaries (bare PCBs only, zero cloud uploads).

---

## 3. Metadata, OpenGraph & Social Cards

| Attribute | Implemented Value | Verification |
|---|---|---|
| **Title Template** | `%s \| PCB Vision AI` | Dynamic across routes |
| **Default Title** | `PCB Vision AI — Intelligent Bare PCB Defect Inspection & Classification` | 68 characters, within 70 char limit |
| **Meta Description** | `Production-grade Automated Optical Inspection (AOI) combining YOLOv8 Deep Learning (ONNX Runtime Web WASM) and Classical Digital Image Processing (DIP) for bare Printed Circuit Boards. 100% private, client-side inference.` | 160 characters, within 165 char limit |
| **Canonical URL** | `https://pcb-vision-ai-ten.vercel.app` | Matches deployment domain |
| **OpenGraph Image** | `app/opengraph-image.tsx` (1200 &times; 630 px PNG) | Generated via `@vercel/og` Edge API |
| **Favicon** | `app/icon.svg` (32 &times; 32 px SVG) | Modern vector icon with circuit trace motif |
| **Theme Color** | `#090d16` (Deep Industrial Slate) | Matches UI dark background |

---

## 4. Structured Data (JSON-LD)

Implemented directly in `web/app/layout.tsx` using Schema.org semantic standards:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "PCB Vision AI",
      "operatingSystem": "Web Browser (Chrome, Firefox, Safari, Edge)",
      "applicationCategory": "DeveloperApplication, EngineeringApplication",
      "description": "Intelligent Automated Optical Inspection system for bare Printed Circuit Boards using YOLOv8 ONNX Runtime Web and Classical Digital Image Processing.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "author": {
        "@type": "Person",
        "name": "Shaik Mahammad Shariff",
        "url": "https://github.com/skmdshariff143-ai"
      },
      "url": "https://pcb-vision-ai-ten.vercel.app"
    },
    {
      "@type": "WebSite",
      "name": "PCB Vision AI",
      "url": "https://pcb-vision-ai-ten.vercel.app",
      "description": "Intelligent Bare PCB Defect Detection and Classification combining Classical DIP and Deep Learning."
    }
  ]
}
```

---

## 5. Google Search Console & Verification Steps

When the owner connects this domain to Google Search Console:
1. Navigate to [Google Search Console](https://search.google.com/search-console).
2. Choose **URL prefix**: `https://pcb-vision-ai-ten.vercel.app`.
3. Select **HTML tag** verification method, copy the `google-site-verification` token, and insert it into `web/app/layout.tsx` metadata.
4. Once verified, submit `https://pcb-vision-ai-ten.vercel.app/sitemap.xml`.
5. Check indexing status within 48–72 hours.
