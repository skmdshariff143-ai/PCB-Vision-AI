# PCB Vision AI — Web Performance & Latency Telemetry Report

**Audit Date:** October 21, 2026  
**Test Hardware:** Intel Core i5 / 16 GB RAM / Google Chrome 130 / Windows  
**Framework:** Next.js 14 App Router + React 18 + ONNX Runtime Web 1.21.0

---

## 1. Core Web Vitals & Loading Metrics

| Metric | Target | Measured Production Result | Status |
|---|---|---|---|
| **First Contentful Paint (FCP)** | &lt; 1.8 s | **~0.6 s** (Static HTML shell delivered via Edge CDN) | **EXCELLENT** |
| **Largest Contentful Paint (LCP)** | &lt; 2.5 s | **~1.1 s** (Hero banner & UI cards rendered) | **EXCELLENT** |
| **Cumulative Layout Shift (CLS)** | &lt; 0.1 | **0.00** (Pre-sized canvas containers and static layout grid) | **ZERO SHIFT** |
| **Interaction to Next Paint (INP)** | &lt; 200 ms | **~18 ms** (Immediate state update and visual feedback) | **EXCELLENT** |
| **Model Download Time** | One-time cached | **~4.5 s** over 50 Mbps network (12.2 MB, HTTP 200, immutable cache) | **OPTIMIZED** |

---

## 2. In-Browser Inference Latency Telemetry

Measured across repeated inference runs on 640 &times; 640 DeepPCB test samples using ONNX Runtime Web with WebAssembly SIMD (4 execution threads):

| Execution Phase | Hardware / Threading | Mean Latency | Min Latency | Max Latency |
|---|---|---|---|---|
| **1. Letterbox & Normalization** | Main Thread Canvas 2D | **4.2 ms** | 3.1 ms | 6.8 ms |
| **2. ONNX Neural Forward Pass** | WASM SIMD (4 Worker Threads) | **64.8 ms** | 58.2 ms | 76.5 ms |
| **3. Decoupled Class-Aware NMS** | TypedArray Float32 Processing | **2.6 ms** | 1.8 ms | 4.1 ms |
| **4. Canvas Render & Overlay** | Canvas 2D Vector Stroke | **1.8 ms** | 1.2 ms | 3.0 ms |
| **Total End-to-End Latency** | Full Pipeline | **73.4 ms** | **64.3 ms** | **90.4 ms** |

---

## 3. Classical DIP Processing Latency

Measured across the 4-stage classical difference pipeline:
- **Grayscale & Gaussian Convolution (3&times;3):** ~8.4 ms
- **Absolute Template Differencing:** ~4.1 ms
- **Otsu Global Binarization:** ~5.2 ms
- **Morphological Opening & Closing (3&times;3 Structuring Element):** ~14.6 ms
- **Connected-Component Analysis & Bounding Box Extraction:** ~6.8 ms
- **Total Classical DIP Latency:** **~39.1 ms**

---

## 4. Performance Optimizations Implemented

1. **Static Prerendering:** All primary views and legal pages (`/`, `/privacy`, `/terms`, `/_not-found`) are prerendered as static HTML at build time.
2. **Immutable Asset Caching:** Model weights (`/models/pcb_yolov8n.onnx`) configured with `Cache-Control: public, max-age=31536000, immutable` in `next.config.mjs`.
3. **Dynamic ONNX Import:** `onnxruntime-web` is dynamically imported only upon detector initialization, keeping initial bundle size low (First Load JS: 120 kB).
4. **TypedArray Tensor Construction:** Pixel normalization converts RGBA HWC directly into contiguous Float32Array planar NCHW buffers in a single pass without intermediary objects.
