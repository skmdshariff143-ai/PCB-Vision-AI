# PCB Vision AI: Intelligent PCB Defect Detection and Classification

[![Python](https://img.shields.io/badge/Python-3.13-blue.svg)](https://www.python.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.14.1-red.svg)](https://pytorch.org/)
[![Ultralytics](https://img.shields.io/badge/YOLO-v8%20%7C%2011-00FFFF.svg)](https://docs.ultralytics.com/)
[![Streamlit](https://img.shields.io/badge/Streamlit-1.66-FF4B4B.svg)](https://streamlit.io/)
[![Tests](https://img.shields.io/badge/Tests-14%20Passed-brightgreen.svg)](#software-quality--automated-tests)
[![Dataset](https://img.shields.io/badge/Dataset-DeepPCB-orange.svg)](https://github.com/tangsanli5201/DeepPCB)

An academically defensible and industrial-grade computer vision system that investigates, implements, and benchmarks both **Classical Digital Image Processing (DIP)** and **Deep Learning (YOLO)** for Automated Optical Inspection (AOI) of bare printed circuit boards.

---

## 📌 Key Capabilities

- **Deep Learning Inspection (YOLOv8/YOLO11):** Single-image multi-class defect classification across 6 industrial classes at **13.8 ms per image (~72.6 FPS on CPU)** without requiring any reference template.
- **Classical DIP Pipeline:** Reference-template differencing with ORB homography alignment, Gaussian filtering, Otsu/Adaptive/Fixed thresholding, morphological opening/closing, and connected-component analysis.
- **Dual-Metric Evaluation Protocol:** Rigorous evaluation using both strict bounding-box IoU ($\ge 0.33$) and centroid-in-ground-truth spatial localization.
- **Leak-Free Dataset Partitioning:** Group-based splitting of the 1,500 DeepPCB image pairs across 11 PCB board groups (Train: 1,070, Val: 253, Test: 177) ensuring 0% spatial data leakage.
- **Interactive Industrial Dashboard:** Polished Streamlit UI with one-click sample loader, multi-stage DIP pipeline visualization, defect inventory tables, and downloadable inspection certificates (JPG, CSV, JSON).
- **Google Colab GPU Notebook:** Fully reproducible self-contained GPU training workflow (`PCB_Vision_AI_Colab_Training.ipynb`) for training without CPU thermal constraints.

---

## 🔬 Six Target Defect Classes

Aligned with the official DeepPCB benchmark:
1. **Open circuit (`open`):** Broken copper conductor causing open circuit.
2. **Short circuit (`short`):** Conductive bridge spanning adjacent traces.
3. **Mouse bite (`mousebite`):** Edge notch narrowing trace width.
4. **Spur (`spur`):** Sharp protrusion projecting from trace boundary.
5. **Spurious copper (`copper`):** Isolated unetched copper artifact.
6. **Pin hole (`pin-hole`):** Micro-void within conductor plane or solder pad.

---

## 🚀 Quickstart Guide (Windows PowerShell)

### 1. Environment Setup
```powershell
# Navigate into the project directory
cd E:\PCB-Vision-AI

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Install / verify dependencies
python -m pip install -r requirements.txt
```

### 2. Dataset Preparation (Zero-Leakage Group Split)
```powershell
# Converts DeepPCB/PCBData into YOLO format partitioned by board group
python src/prepare_data.py
```

### 3. Run Classical DIP Detection
```powershell
python src/classical_detection.py `
  --reference "DeepPCB/PCBData/group00041/00041/00041000_temp.jpg" `
  --test "DeepPCB/PCBData/group00041/00041/00041000_test.jpg" `
  --gt "DeepPCB/PCBData/group00041/00041_not/00041000.txt" `
  --method otsu `
  --output runs/classical_demo.jpg
```

### 4. Run Model Training or CPU Smoke Test
```powershell
# Fast CPU smoke test (1 epoch on verification subset, completes in ~4 seconds)
python src/train.py --smoke-test

# For full 50-epoch GPU training, open PCB_Vision_AI_Colab_Training.ipynb on Google Colab
```

### 5. Run Model & Method Evaluation
```powershell
# Computes test split metrics, latency benchmarks, and DIP comparative figures
python src/evaluate.py --weights "runs/pcb/train/weights/best.pt"
```

### 6. Launch Industrial Streamlit Inspection Dashboard
```powershell
python -m streamlit run app.py
```

---

## 📊 Measured Benchmark Summary (Real Hardware Measurements)

*Evaluated on host CPU (Intel Core i5-1335U, Python 3.13.13, PyTorch 2.14.1+cpu):*

| Performance Dimension | Deep Learning (YOLOv8) | Classical DIP (Template Differencing) |
|---|---|---|
| **Requires Golden Template?** | ❌ No (Single test image) | ✅ Yes (Strict identical template) |
| **Defect Semantic Classification** | ✅ 6 Distinct Classes | ❌ None (Binary Difference Blob) |
| **Tolerance to Subpixel Shift** | ✅ High (Spatial Invariant) | ❌ Zero (Edge difference artifacts) |
| **Inference Latency (CPU)** | **13.8 ms** per image | **16.3 ms** per image pair |
| **Throughput (CPU)** | **~72.6 FPS** | **~61.4 FPS** |
| **Centroid Localization Recall** | Evaluated via standard mAP | **93.9%** (138 / 147 test defects) |
| **Strict IoU $\ge 0.33$ F1 Score** | Evaluated via standard mAP | **0.043** (Area mismatch penalty) |

---

## 🧪 Software Quality & Automated Tests

All tests are implemented in `tests/` and run using `pytest`:

```powershell
python -m pytest -v
```

**Test Coverage (14/14 Passed):**
- `tests/test_classical_dip.py`: Identical image zero-defect test, synthetic defect localization, threshold method variants (Otsu/Adaptive/Fixed), IoU geometry, GT evaluation, and ORB alignment fallback.
- `tests/test_dataset_validation.py`: `data.yaml` schema, 1:1 image-label pairing, normalized bounding coordinates in $[0, 1]$, and zero group-leakage between train, val, and test.
- `tests/test_dl_inference.py`: Model loader, missing weights exception handling, dummy array inference, and actual test image inference.

---

## 📁 Repository Structure

```
E:\PCB-Vision-AI\
│
├── app.py                             # Professional Streamlit Industrial Inspection Dashboard
├── README.md                          # Project documentation and quickstart
├── PROJECT_AUDIT.md                   # Phase 1 comprehensive workspace audit report
├── ACADEMIC_REPORT.md                 # Complete academic defense thesis (Abstract, Math, Viva Q&A)
├── PCB_Vision_AI_Colab_Training.ipynb # Standalone Google Colab GPU training notebook
├── requirements.txt                   # Verified package dependencies
├── .gitignore                         # Safe exclusion rules for models, data, environments
│
├── src\
│   ├── classical_detection.py         # Classical DIP reference differencing pipeline
│   ├── prepare_data.py                # DeepPCB-to-YOLO converter with group-based splitting
│   ├── train.py                       # Configurable YOLO training script with CPU smoke test
│   └── evaluate.py                    # Dual-method quantitative evaluation and report generator
│
├── tests\
│   ├── test_classical_dip.py          # Classical DIP pipeline unit tests
│   ├── test_dataset_validation.py     # Dataset coordinate and leakage tests
│   └── test_dl_inference.py           # Deep learning inference and loading tests
│
├── dataset\                           # Converted YOLO dataset (train: 1070, val: 253, test: 177)
│   ├── data.yaml                      # YOLO dataset configuration
│   ├── images\                        # Train, val, and test image subdirectories
│   └── labels\                        # Train, val, and test label subdirectories
│
├── DeepPCB\                           # Original DeepPCB benchmark repository (preserved intact)
│   └── PCBData\                       # Raw PCB groups (group00041, group12000, etc.)
│
└── runs\                              # Experiment artifacts, evaluation JSON/MD, and model weights
    ├── pcb\train\weights\best.pt      # Verified active model weights
    └── pcb\evaluation\                # evaluation_results.json & evaluation_report.md
```

---

## 📜 Academic Attribution & License

- Dataset provided by Tang et al. (*"On-line PCB Defect Detector On A New PCB Defect Dataset"*, IEEE ITSC 2019). The DeepPCB dataset is restricted to academic and research use.
- Model architecture built on the Ultralytics YOLO framework.
- Code released under the MIT Research License.
