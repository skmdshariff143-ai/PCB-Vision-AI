# PCB Vision AI — Model Validation & Benchmarking Report

**Evaluation Date:** October 21, 2026  
**Model Architecture:** Ultralytics YOLOv8n (Nano) Decoupled Head  
**PyTorch Weights:** `best.pt` (SHA256: `EF037BF90386688BF9F81F9B51F90BA45179C9FEEA3CB7E42877F07F4FEBBE74`)  
**ONNX Model:** `web/public/models/pcb_yolov8n.onnx` (12,778,103 bytes, Opset 18)  
**Evaluation Protocol:** 177 held-out test images from DeepPCB benchmark (Groups `group12300` and `group50600`), 1,032 ground-truth defect annotations.

---

## 1. Held-Out Test Set Empirical Metrics

The following metrics were computed directly on the authentic held-out test split using `ultralytics.YOLO.val()` with zero data leakage:

| Defect Class ID | Category Name | Test Instances | Precision (P) | Recall (R) | mAP@0.50 | mAP@0.50:0.95 |
|:---:|---|:---:|:---:|:---:|:---:|:---:|
| 0 | Open Circuit (`open`) | 222 | 63.18% | 93.54% | 80.97% | 60.67% |
| 1 | Short Circuit (`short`) | 150 | 98.44% | 86.00% | 96.88% | 66.78% |
| 2 | Mouse Bite (`mousebite`) | 184 | 94.45% | 95.11% | 97.60% | 77.11% |
| 3 | Spur (`spur`) | 158 | 98.68% | 94.75% | 99.39% | 76.74% |
| 4 | Spurious Copper (`copper`) | 146 | 100.00% | 99.70% | 99.50% | 88.38% |
| 5 | Pin Hole (`pin-hole`) | 172 | 100.00% | 97.80% | 99.50% | 87.37% |
| **All** | **Aggregate Total** | **1,032** | **92.46%** | **94.48%** | **95.64%** | **76.18%** |

---

## 2. PyTorch vs. ONNX Runtime Parity

Numerical validation between PyTorch CPU inference and ONNX Runtime CPU inference on identical inputs:

- **Input Tensor:** `[1, 3, 640, 640]`, float32, normalized $[0, 1]$
- **Output Tensor:** `[1, 10, 8400]`, float32
- **Max Absolute Difference:** `0.000000` (Bitwise identical weights)
- **Mean Absolute Difference:** `0.000000`
- **Detection Parity Rate (IoU $\ge 0.70$):** `100.0%`
- **Mean Bounding Box IoU:** `0.999999`

---

## 3. Clean Golden Reference Template Evaluation

To evaluate false-alarm rates in the absence of defects, 20 defect-free reference template boards (`*_temp.jpg`) were evaluated across varying confidence thresholds:

| Confidence Threshold | Total False Positives | Average FP / Board | Clean Boards (0 FP) | Percentage 0-FP |
|:---:|:---:|:---:|:---:|:---:|
| $\ge 0.25$ (Default) | 45 | 2.25 | 5 / 20 | 25.0% |
| $\ge 0.45$ (Recommended for Reference) | 20 | 1.00 | 9 / 20 | 45.0% |
| $\ge 0.60$ (High Selectivity) | 9 | 0.45 | 13 / 20 | 65.0% |
| $\ge 0.70$ (Stringent) | 4 | 0.20 | 16 / 20 | 80.0% |

**Root Cause Analysis:**  
The DeepPCB training set consists exclusively of defective boards (`*_test.jpg`) without background-only negative images. Consequently, at very low confidence thresholds, sharp trace routing angles and via pads can trigger weak boundary proposals. Setting confidence $\ge 0.45$ effectively mitigates these proposals while retaining over 90% true defect recall.

---

## 4. Out-of-Distribution (OOD) Robustness

Synthetic and out-of-distribution inputs were evaluated to measure model failure modes:

| Input Condition | Test Case | Detections Produced | Behavior Assessment |
|---|---|:---:|---|
| Solid Black | $640 \times 640$ zeros | 0 | **PASS** — No false triggers on empty canvas |
| Solid White | $640 \times 640$ 255s | 0 | **PASS** — No false triggers on saturated canvas |
| Uniform Noise | Random integer distribution | 0 | **PASS** — Noise does not trigger confident defects |
| Populated PCBA | Assembled board with ICs | Unpredictable | **OOD Advisory Required** — UI alert instructs users that SMT passives and silicon packages fall outside training domain |
