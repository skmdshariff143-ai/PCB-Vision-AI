# Phase 2: Architecture Decision Record (ADR)

**Project:** PCB Vision AI  
**Decision Title:** Client-Side Browser Inference (Next.js + ONNX Runtime Web) vs. Cloud Serverless Backend  
**Date:** October 21, 2026  
**Status:** **Approved / Selected: Architecture A (Client-Side ONNX Runtime Web)**  

---

## 1. Context & Architectural Dilemma

The goal is to deploy **PCB Vision AI** as a publicly accessible, zero-cost, high-performance, and academically defensible web application on Vercel.

Three candidate deployment architectures were rigorously evaluated:
- **Architecture A (Client-Side WASM/WebGPU):** Next.js frontend + ONNX Runtime Web running inference directly in the client's browser.
- **Architecture B (External Python Backend):** Next.js frontend on Vercel + FastAPI inference microservice hosted on a cloud container provider (Render, Railway, Fly.io, or AWS).
- **Architecture C (Vercel Serverless Function with PyTorch):** Hosting both UI and inference inside Vercel Serverless/Edge functions.

---

## 2. Quantitative Evaluation Matrix

| Architectural Dimension | Option A: Next.js + ONNX Runtime Web | Option B: Next.js + External FastAPI Microservice | Option C: PyTorch in Vercel Serverless Functions |
|---|---|---|---|
| **Hosting Cost** | **$0.00 / month (100% Free)** on Vercel Hobby tier | $0 to $15/mo (Free tiers sleep after 15 min; paid required for 24/7) | Exceeds limits (Not feasible) |
| **Server Infrastructure** | **Zero Server Maintenance** (Static & Edge CDN delivery) | Dedicated container management, health monitoring, CORS | Serverless cold starts |
| **Cold Start Latency** | **0 ms** (Model downloads once and caches in IndexedDB) | 50s to 90s on sleeping free-tier containers | 15s to 30s container spin-up |
| **Inference Latency** | **30 ms – 90 ms** on consumer CPU (WASM) / **15 ms** on WebGPU | 150 ms – 400 ms (Network round-trip + upload latency) | N/A |
| **Platform Size Limits** | **Compliant:** ONNX model is ~12 MB, well within Vercel static asset limits | Compliant on frontend, backend container 1.5 GB | **FAILED:** PyTorch + OpenCV > 800 MB (Limit is 250 MB) |
| **Data Privacy & Security** | **100% Secure:** PCB scans never leave the client's device | Scans uploaded to external third-party server | Scans uploaded to Vercel compute |
| **Offline Capability** | **Yes:** Once loaded, operates without internet connection | No: Requires active API connectivity | No: Requires active API connectivity |
| **Engineering Rigor** | High: Demonstrates cross-platform model compilation and WASM | Moderate: Standard REST API wrapping | Low: Flaky due to platform hacks |

---

## 3. Justification for Option A (Next.js + ONNX Runtime Web)

1. **Elimination of Cloud Costs & Downtime:** Free cloud container tiers (e.g. Render, Railway) spin down after inactivity, subjecting users to frustrating 60+ second delays. Option A serves static bundles via Vercel's global CDN with zero latency and zero hosting fees.
2. **Strict Privacy for Intellectual Property:** PCB circuit board designs frequently contain proprietary routing and commercial trade secrets. Processing images locally in browser memory guarantees zero data leakage to cloud servers.
3. **Model Compactness:** The trained YOLOv8 Nano model exports to a compact ~12 MB ONNX file. It streams rapidly over HTTP/2 and executes smoothly on standard laptops without GPU requirements.
4. **Academically Defensible:** Porting PyTorch research checkpoints to standardized Open Neural Network Exchange (ONNX) format and deploying across heterogeneous browser execution providers (WASM multi-threading, SIMD, WebGPU) represents advanced engineering practice.

---

## 4. System Implementation Blueprint

```
User Browser
┌─────────────────────────────────────────────────────────────────┐
│ Next.js 14/15 App Router (React, Tailwind CSS, TypeScript)       │
│                                                                 │
│  ┌──────────────────────┐        ┌────────────────────────────┐ │
│  │ AI Inspector (YOLO)  │        │ Classical DIP Laboratory   │ │
│  │ 1. Canvas Preprocess │        │ 1. Grayscale Conversion    │ │
│  │ 2. Letterbox 640x640 │        │ 2. Gaussian Blur (2D Conv) │ │
│  │ 3. ONNX Web Runtime  │        │ 3. Absolute Difference     │ │
│  │ 4. Decoupled NMS     │        │ 4. Otsu / Binary Threshold │ │
│  │ 5. Bounding Canvas   │        │ 5. Morphological Ops & CCA │ │
│  └──────────┬───────────┘        └────────────────────────────┘ │
│             │                                                   │
│             ▼                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ ONNX Runtime Web Engine (ort-web)                         │  │
│  │ Execution Providers: WebGPU -> WASM SIMD -> CPU Fallback   │  │
│  │ Model: /models/pcb_yolov8n.onnx (~12 MB)                 │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │ Hosted on
                              ▼
                     Vercel Edge Network
```

---

## 5. Decision Outcome

**Approved Architecture:** Next.js + TypeScript + Tailwind CSS + ONNX Runtime Web (`onnxruntime-web`) hosted on Vercel.
No external Python server will be required for web production. The Python project and PyTorch training scripts are retained in the repository for academic reproducibility.
