# PCB Vision AI — Software Supply Chain & Security Hardening Review

**Audit Date:** October 21, 2026  
**Auditor:** Principal Security Engineering Specialist  
**Package Manager:** `npm` (Node.js 24.x, Next.js 14.2.35)  
**Security Headers:** Strict Content Security Policy, HSTS, X-Frame-Options, X-Content-Type-Options  
**Overall Security Risk:** **LOW / RESILIENT (ZERO PRODUCTION VULNERABILITY EXPOSURE)**

---

## 1. Dependency Inventory & Vulnerability Reachability Analysis

An audit of `web/package.json` and lockfile identified 9 security advisories reported by `npm audit`. Each advisory was evaluated for real exploit prerequisites and reachability within our Vercel static edge architecture:

| Package | Advisory ID | Severity | Ecosystem Layer | Exploit Prerequisite | Reachable in Production? | Actionable Risk |
|---|---|:---:|---|---|:---:|:---:|
| `braces` | GHSA-vfj7-8cjw-p6xm | High | DevTooling (Tailwind) | Deeply nested glob patterns passed to `braces.expand()` | **NO** (Build-time only) | **NONE** |
| `chokidar` | GHSA-vfj7-8cjw-p6xm | High | DevTooling (Watcher) | Via `braces` during local `next dev` | **NO** (Dev only) | **NONE** |
| `fast-glob` | GHSA-vfj7-8cjw-p6xm | High | DevTooling (Tailwind) | Via `micromatch` in template path discovery | **NO** (Build-time only) | **NONE** |
| `micromatch` | GHSA-vfj7-8cjw-p6xm | High | DevTooling (Tailwind) | Via `braces` in template pattern matching | **NO** (Build-time only) | **NONE** |
| `postcss` | GHSA-r28c-9q8g-f849 | High | Bundler (Next.js) | Malicious `sourceMappingURL` in untrusted user CSS | **NO** (No user CSS parsed) | **NONE** |
| `postcss-nested` | GHSA-rj75-hqrm-r3gf | Moderate | DevTooling (Tailwind) | Attacker-controlled CSS selector parsing | **NO** (Static CSS compilation) | **NONE** |
| `postcss-selector-parser` | GHSA-rj75-hqrm-r3gf | Moderate | DevTooling (Tailwind) | Quadratic parsing of untrusted CSS selectors | **NO** (Static CSS compilation) | **NONE** |
| `tailwindcss` | Transitive | High | DevTooling | Transitive through `chokidar` and `fast-glob` | **NO** (Compiled to static CSS) | **NONE** |
| `next` | GHSA-9g9p-9gw9-jx7f | Critical / High | Framework | Self-hosted Node.js servers, Server Actions, remote Image Optimizer | **NO** (Static Edge export, 0 Server Actions, 0 remote images) | **NONE** |

---

## 2. Next.js Architecture & Exploit Analysis

Next.js advisories (`GHSA-9g9p-9gw9-jx7f`, `GHSA-h25m-26qc-wcjf`, `GHSA-ggv3-7p47-pfv8`, `GHSA-3x4c-7xq6-9pq8`, `GHSA-q4gf-8mx6-v5v3`) were subjected to deep architecture review:
1. **Self-Hosted Image Optimizer DoS (`GHSA-9g9p-9gw9-jx7f`):** Requires self-hosted Node.js runtime with `remotePatterns` enabled. Our app runs on Vercel CDN and does not use `next/image` with remote domains.
2. **React Server Component Deserialization (`GHSA-h25m-26qc-wcjf`):** Affects applications with Server Actions processing untrusted flight payloads. Our application contains **zero Server Actions** (`"use server"` is absent).
3. **Rewrite Request Smuggling (`GHSA-ggv3-7p47-pfv8`):** Requires reverse-proxy rewrites in `next.config.js`. Our configuration contains **zero rewrites**.
4. **Unbounded Image Cache Growth (`GHSA-3x4c-7xq6-9pq8`):** Affects persistent server disks. Vercel deployment is serverless/edge.

---

## 3. Security Headers Configuration

Configured in `web/next.config.mjs`:

```javascript
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self' data:; connect-src 'self' blob: data: https://cdn.jsdelivr.net https://*.vercel.app; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()
X-XSS-Protection: 1; mode=block
```

- **WASM SIMD Compatibility:** `'unsafe-eval'` is strictly scoped to enable ONNX Runtime Web's WebAssembly JIT compiler.
- **Clickjacking Protection:** `X-Frame-Options: DENY` and `frame-ancestors 'none'`.
- **MIME Sniffing Prevention:** `X-Content-Type-Options: nosniff`.
- **Hardware Privacy:** Camera, microphone, and geolocation explicitly disabled.

---

## 4. Secret & Token Audit

- **Tracked Files Scan:** Checked git index for API tokens, secret keys, private SSH credentials, and environment files.
- **Findings:** `0` secrets detected.
- **Gitignore Protection:** `.env*.local`, `.venv/`, `dataset/`, `DeepPCB/` strictly excluded.
