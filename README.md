# PCB Vision AI: Intelligent Automated PCB Defect Detection & Classification

[![Live Deployment](https://img.shields.io/badge/Vercel-Live%20Demo-brightgreen?logo=vercel)](https://pcb-vision-ai-ten.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/skmdshariff143-ai/PCB-Vision-AI)
[![Python](https://img.shields.io/badge/Python-3.13-blue.svg)](https://www.python.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![ONNX Runtime](https://img.shields.io/badge/ONNX%20Web-WASM%20SIMD-orange)](https://onnxruntime.ai/)
[![Tests](https://img.shields.io/badge/Tests-14%20Passed-brightgreen.svg)](#software-quality--automated-tests)

An industrial-grade and academically defensible computer vision system that investigates, implements, and benchmarks both **Classical Digital Image Processing (DIP)** and **Deep Learning (YOLOv8 ONNX Web)** for Automated Optical Inspection (AOI) of printed circuit boards.

---

## 🌐 Live Web Application

- **Public Production URL:** [https://pcb-vision-ai-ten.vercel.app](https://pcb-vision-ai-ten.vercel.app)
- **Zero Server Costs:** 100% Client-Side WebAssembly (WASM) multi-threaded inference.
- **Data Privacy Guarantee:** Scanned PCB images never leave the user's browser.

---

## 📌 Key Capabilities

- **Deep Learning Inspection (YOLOv8n ONNX Web):** Single-image multi-class defect classification across 6 industrial classes at **~60–85 ms per image** in the browser without requiring any reference template.
- **Classical DIP Laboratory:** Reference-template differencing with Gaussian filtering, Otsu's optimal binarization, morphological opening/closing, and 8-connectivity connected-component analysis.
- **Dual-Metric Evaluation Protocol:** Rigorous evaluation using both strict bounding-box IoU ($\ge 0.33$) and centroid-in-ground-truth spatial localization.
- **Leak-Free Dataset Partitioning:** Group-based splitting of 1,500 DeepPCB image pairs across 11 PCB board groups (Train: 1,070, Val: 253, Held-Out Test: 177) ensuring 0% spatial data leakage.
- **Interactive Industrial Dashboard:** Built with Next.js 14 and Tailwind CSS, featuring 1-click sample loaders, real-time confidence and IoU tuning sliders, defect inventory tables, and downloadable inspection certificates (JPG, CSV, JSON).

---

## 🔬 Six Target Defect Classes

Aligned with the official DeepPCB benchmark:
1. **Open circuit (`open`):** Complete break in conductive trace.
2. **Short circuit (`short`):** Conductive bridge spanning adjacent traces.
3. **Mouse bite (`mousebite`):** Edge notch narrowing trace cross-section.
4. **Spur (`spur`):** Sharp pointed protrusion projecting from trace boundary.
5. **Spurious copper (`copper`):** Isolated unetched copper artifact on substrate.
6. **Pin hole (`pin-hole`):** Micro-void within conductor plane or solder pad.

---

## 📊 Verified Test Set Benchmark (177 Held-Out Images)

*Empirically evaluated on the held-out test split (177 images, 1,032 ground-truth defects):*

| Performance Dimension | Deep Learning (YOLOv8) | Classical DIP (Template Differencing) |
|---|---|---|
| **Requires Golden Template?** | ❌ No (Single test image) | ✅ Yes (Strict identical template) |
| **Defect Semantic Classification** | ✅ 6 Distinct Classes | ❌ None (Binary Difference Anomaly only) |
| **Tolerance to Subpixel Shift** | ✅ High (Spatial Invariant) | ❌ Zero (Edge difference artifacts) |
| **Inference Latency (Browser WASM)** | **~60 – 85 ms** per image | **~15 – 35 ms** per image pair |
| **Centroid Localization Recall** | Evaluated via standard mAP | **93.88%** (Aligned sample pairs) |
| **Strict IoU $\ge 0.33$ F1 Score** | Evaluated via standard mAP | **0.043** (Area mismatch penalty) |

### Per-Class Held-Out Test Performance:
- **Mean Precision:** **92.46%**
- **Mean Recall:** **94.48%**
- **mAP @ 50:** **95.64%**
- **mAP @ 50-95:** **76.18%**

---

## 🚀 Quickstart Guide

### 1. Web Application (Next.js + ONNX Runtime Web)
```bash
# Navigate to web directory
cd web

# Install dependencies
npm install

# Start development server
npm run dev
# Open http://localhost:3000
```

### 2. Python Research & Classical Pipeline
```powershell
# In root directory
.\.venv\Scripts\Activate.ps1

# Run classical DIP detection
python src/classical_detection.py `
  --reference "DeepPCB/PCBData/group00041/00041/00041000_temp.jpg" `
  --test "DeepPCB/PCBData/group00041/00041/00041000_test.jpg" `
  --method otsu

# Run automated tests
pytest -v

# Launch local Streamlit research dashboard
streamlit run app.py
```

---

## 🧪 Software Quality & Automated Tests

All tests are implemented in `tests/` and run via `pytest`:
- `tests/test_classical_dip.py`: 6 tests (identical zero-defect verification, synthetic defect localization, Otsu/Adaptive/Fixed algorithms, IoU geometry, GT evaluation, ORB fallback).
- `tests/test_dataset_validation.py`: 4 tests (`data.yaml` keys, 1:1 image-label pairings, normalized coordinates in $[0, 1]$, zero group-leakage).
- `tests/test_dl_inference.py`: 4 tests (model loading, missing weight error handling, synthetic array forward pass, test sample inference).

**Test Execution Outcome:**
```
============================= 14 passed in 16.74s =============================
```

---

## 📁 Repository Structure

```
PCB-Vision-AI/
├── web/                               # Next.js 14 Production Web Application
│   ├── app/                           # App Router (page.tsx, layout.tsx, globals.css)
│   ├── components/                    # InspectorView, DIPLabView, BenchmarkView, ResearchView, AboutView
│   ├── lib/
│   │   ├── inference/                 # yolo-detector.ts (ONNX Runtime Web WASM engine)
│   │   └── image-processing/          # classical-dip.ts (Pure Canvas DIP algorithms)
│   └── public/
│       ├── models/                    # pcb_yolov8n.onnx (12.2 MB client-side model)
│       └── samples/                   # Representative DeepPCB sample image pairs
│
├── src/                               # Python Research & Verification Codebase
│   ├── classical_detection.py         # Multi-stage classical DIP pipeline
│   ├── prepare_data.py                # Zero-leakage group dataset converter
│   ├── train.py                       # YOLO training script with smoke test
│   ├── evaluate.py                    # Dual-method quantitative evaluation suite
│   └── verify_onnx.py                 # ONNX vs PyTorch parity benchmarking
│
├── tests/                             # Automated Test Suite (14 Tests Passed)
├── docs/                              # Engineering & Audit Documentation
│   ├── PROJECT_AUDIT.md               # Comprehensive workspace audit
│   ├── ARCHITECTURE_DECISION.md       # ADR for Next.js + ONNX Web
│   ├── MODEL_CONVERSION_REPORT.md     # 100% parity verification report
│   └── QA_REPORT.md                   # Full QA and security validation report
│
├── app.py                             # Local Streamlit Research Dashboard
├── ACADEMIC_REPORT.md                 # Complete ECE Capstone Defense Documentation
├── PCB_Vision_AI_Colab_Training.ipynb # Standalone Google Colab GPU Training Workflow
└── requirements.txt                   # Verified Python dependencies
```

---

## 📜 Academic Attribution & License

- Dataset provided by Tang et al. (*"On-line PCB Defect Detector On A New PCB Defect Dataset"*, IEEE ITSC 2019). The DeepPCB dataset is restricted to academic and research use.
- Model architecture built on the Ultralytics YOLO framework.
- Code released under the MIT Research License.
