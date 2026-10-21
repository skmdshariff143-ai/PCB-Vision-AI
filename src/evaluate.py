"""
PCB Vision AI — Comprehensive Model & Method Evaluation Suite
--------------------------------------------------------------
Evaluates both:
1. Deep Learning (YOLO) on the held-out test split (177 images):
   - Precision, Recall, mAP@50, mAP@50-95
   - Per-class metric decomposition
   - Confusion matrix generation
   - Inference latency benchmarking (preprocess, inference, postprocess)
2. Classical DIP Pipeline on the corresponding test image pairs:
   - Centroid-in-GT localization precision & recall
   - Strict IoU matching precision & recall
   - Processing time per frame
   - Limitation analysis (misalignment, pseudo-defects)
3. Outputs structured JSON and Markdown comparison reports.
"""

from pathlib import Path
import sys
ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from typing import Dict, List, Any
import argparse
import json
import time
import cv2
import numpy as np
from ultralytics import YOLO

from src.classical_detection import detect, evaluate_dip_against_ground_truth


def evaluate_yolo(
    weights_path: str = "runs/pcb/train/weights/best.pt",
    data_yaml: str = "dataset/data.yaml",
    split: str = "test",
    project: str = "runs/pcb",
    name: str = "evaluate",
) -> Dict[str, Any]:
    weights = Path(weights_path)
    if not weights.exists():
        raise FileNotFoundError(f"Weights file not found at: {weights.resolve()}")

    print(f"\n[EVALUATION] Benchmarking YOLO model on split='{split}'...")
    print(f"Model weights: {weights.resolve()}")

    model = YOLO(str(weights))
    val_results = model.val(
        data=data_yaml,
        split=split,
        plots=True,
        project=project,
        name=name,
        device="cpu",
        exist_ok=True,
    )

    names = model.names
    class_metrics = {}
    box_obj = val_results.box

    # Extract per-class metrics safely
    try:
        for idx, cls_name in names.items():
            class_metrics[cls_name] = {
                "precision": float(box_obj.p[idx]) if len(box_obj.p) > idx else 0.0,
                "recall": float(box_obj.r[idx]) if len(box_obj.r) > idx else 0.0,
                "map50": float(box_obj.ap50[idx]) if len(box_obj.ap50) > idx else 0.0,
                "map": float(box_obj.ap[idx]) if len(box_obj.ap) > idx else 0.0,
            }
    except Exception as e:
        print(f"Notice: per-class indexing details: {e}")

    # Measure average latency on a sample batch
    speeds = val_results.speed  # preprocess, inference, loss, postprocess in ms
    total_latency_ms = speeds.get("preprocess", 0.0) + speeds.get("inference", 0.0) + speeds.get("postprocess", 0.0)
    fps = 1000.0 / total_latency_ms if total_latency_ms > 0 else 0.0

    dl_report = {
        "model_weights": str(weights),
        "split": split,
        "overall": {
            "precision": float(box_obj.mp),
            "recall": float(box_obj.mr),
            "map50": float(box_obj.map50),
            "map50_95": float(box_obj.map),
        },
        "per_class": class_metrics,
        "latency_ms": {
            "preprocess": float(speeds.get("preprocess", 0.0)),
            "inference": float(speeds.get("inference", 0.0)),
            "postprocess": float(speeds.get("postprocess", 0.0)),
            "total": float(total_latency_ms),
        },
        "fps_cpu": float(fps),
    }

    return dl_report


def evaluate_classical_sample(
    num_samples: int = 25,
    threshold_method: str = "otsu",
) -> Dict[str, Any]:
    """
    Evaluate classical DIP pipeline on actual reference-test pairs from DeepPCB test groups.
    """
    print(f"\n[EVALUATION] Benchmarking Classical DIP on {num_samples} sample test pairs...")
    raw_root = Path("DeepPCB/PCBData")
    # Groups reserved for test: group12300, group50600
    test_test_images = list(raw_root.glob("group12300/*/*_test.jpg")) + list(raw_root.glob("group50600/*/*_test.jpg"))

    if not test_test_images:
        # Fallback to any available pairs
        test_test_images = list(raw_root.rglob("*_test.jpg"))

    selected = test_test_images[:num_samples]
    total_time_ms = 0.0
    agg_tp_iou = 0
    agg_fp_iou = 0
    agg_fn_iou = 0
    agg_tp_center = 0
    agg_fp_center = 0
    agg_fn_center = 0
    evaluated_pairs = 0

    for im_path in selected:
        temp_path = im_path.parent / im_path.name.replace("_test.jpg", "_temp.jpg")
        gt_path = im_path.parent.parent / (im_path.parent.name + "_not") / im_path.name.replace("_test.jpg", ".txt")

        if not temp_path.exists() or not gt_path.exists():
            continue

        ref_img = cv2.imread(str(temp_path))
        test_img = cv2.imread(str(im_path))
        if ref_img is None or test_img is None:
            continue

        gt_boxes = []
        for line in gt_path.read_text(encoding="utf-8-sig").splitlines():
            if not line.strip():
                continue
            parts = line.replace(",", " ").split()
            if len(parts) >= 4:
                x1, y1, x2, y2 = (int(float(p)) for p in parts[:4])
                gt_boxes.append((x1, y1, x2 - x1, y2 - y1))

        start_t = time.perf_counter()
        res = detect(ref_img, test_img, threshold_method=threshold_method)
        elapsed_ms = (time.perf_counter() - start_t) * 1000.0
        total_time_ms += elapsed_ms

        metrics = evaluate_dip_against_ground_truth(res.boxes, gt_boxes, iou_threshold=0.33)
        agg_tp_iou += metrics["tp_iou"]
        agg_fp_iou += metrics["fp_iou"]
        agg_fn_iou += metrics["fn_iou"]
        agg_tp_center += metrics["tp_center"]
        agg_fp_center += metrics["fp_center"]
        agg_fn_center += metrics["fn_center"]
        evaluated_pairs += 1

    prec_iou = agg_tp_iou / (agg_tp_iou + agg_fp_iou) if (agg_tp_iou + agg_fp_iou) > 0 else 0.0
    rec_iou = agg_tp_iou / (agg_tp_iou + agg_fn_iou) if (agg_tp_iou + agg_fn_iou) > 0 else 0.0
    f1_iou = 2 * (prec_iou * rec_iou) / (prec_iou + rec_iou) if (prec_iou + rec_iou) > 0 else 0.0

    prec_center = agg_tp_center / (agg_tp_center + agg_fp_center) if (agg_tp_center + agg_fp_center) > 0 else 0.0
    rec_center = agg_tp_center / (agg_tp_center + agg_fn_center) if (agg_tp_center + agg_fn_center) > 0 else 0.0
    f1_center = 2 * (prec_center * rec_center) / (prec_center + rec_center) if (prec_center + rec_center) > 0 else 0.0

    avg_time_ms = total_time_ms / evaluated_pairs if evaluated_pairs > 0 else 0.0
    fps = 1000.0 / avg_time_ms if avg_time_ms > 0 else 0.0

    classical_report = {
        "evaluated_pairs": evaluated_pairs,
        "threshold_method": threshold_method,
        "latency_ms_per_image": float(avg_time_ms),
        "fps_cpu": float(fps),
        "strict_iou_033": {
            "precision": float(prec_iou),
            "recall": float(rec_iou),
            "f1": float(f1_iou),
            "true_positives": agg_tp_iou,
            "false_positives": agg_fp_iou,
            "false_negatives": agg_fn_iou,
        },
        "centroid_localization": {
            "precision": float(prec_center),
            "recall": float(rec_center),
            "f1": float(f1_center),
            "true_positives": agg_tp_center,
            "false_positives": agg_fp_center,
            "false_negatives": agg_fn_center,
        },
        "defect_classification_capability": "None (Binary anomaly localization only)",
    }

    return classical_report


def run_full_evaluation(
    weights_path: str = "runs/pcb/train/weights/best.pt",
    output_dir: str = "runs/pcb/evaluation",
) -> Dict[str, Any]:
    out_dir = Path(output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    dl_report = evaluate_yolo(weights_path=weights_path, project=output_dir, name="dl_test")
    dip_report = evaluate_classical_sample(num_samples=25, threshold_method="otsu")

    full_evaluation = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "deep_learning_yolo": dl_report,
        "classical_dip": dip_report,
        "comparative_summary": {
            "dl_requires_reference_template": False,
            "dip_requires_reference_template": True,
            "dl_defect_classification": "6 classes (open, short, mousebite, spur, copper, pin-hole)",
            "dip_defect_classification": "None (difference blobs only)",
            "dl_cpu_latency_ms": dl_report["latency_ms"]["total"],
            "dip_cpu_latency_ms": dip_report["latency_ms_per_image"],
        },
    }

    json_path = out_dir / "evaluation_results.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(full_evaluation, f, indent=2)

    # Markdown report
    md_content = f"""# PCB Vision AI — Comparative Evaluation Report

**Generated:** {full_evaluation['timestamp']}

## 1. Executive Comparison

| Metric / Attribute | Deep Learning (YOLO) | Classical DIP (Template Differencing) |
|---|---|---|
| **Requires Template Image?** | **No** (Single-image inference) | **Yes** (Strict reference pair required) |
| **Defect Classification** | **6 Classes** (Open, Short, Mousebite, Spur, Copper, Pin-hole) | **None** (Binary anomaly candidate only) |
| **Tolerance to Misalignment** | High (Spatial feature invariants) | Zero (Sub-pixel shift causes trace edge artifacts) |
| **Tolerance to Lighting Shift** | High (Color augmentation invariants) | Low (Direct pixel subtraction artifact) |
| **Inference Latency (CPU)** | **{dl_report['latency_ms']['total']:.1f} ms** (~{dl_report['fps_cpu']:.1f} FPS) | **{dip_report['latency_ms_per_image']:.1f} ms** (~{dip_report['fps_cpu']:.1f} FPS) |
| **Centroid Localization Recall**| Evaluated via NMS / mAP | **{dip_report['centroid_localization']['recall']*100:.1f}%** |
| **Strict IoU >= 0.33 F1** | Evaluated via standard mAP | **{dip_report['strict_iou_033']['f1']:.4f}** |

## 2. Deep Learning Test Set Metrics (Split: Test, 177 Images)

- **Overall Precision:** {dl_report['overall']['precision']:.4f}
- **Overall Recall:** {dl_report['overall']['recall']:.4f}
- **mAP@50:** {dl_report['overall']['map50']:.4f}
- **mAP@50-95:** {dl_report['overall']['map50_95']:.4f}

### Per-Class Breakdown:
| Class | Precision | Recall | mAP@50 | mAP@50-95 |
|---|---|---|---|---|
"""
    for cls_name, vals in dl_report["per_class"].items():
        md_content += f"| `{cls_name}` | {vals['precision']:.4f} | {vals['recall']:.4f} | {vals['map50']:.4f} | {vals['map']:.4f} |\n"

    md_content += f"""
## 3. Classical DIP Evaluation (25 Sample Pairs from Test Split)
- **Evaluated Pairs:** {dip_report['evaluated_pairs']}
- **Centroid-in-GT Recall:** {dip_report['centroid_localization']['recall']:.4f}
- **Centroid-in-GT Precision:** {dip_report['centroid_localization']['precision']:.4f}
- **Centroid-in-GT F1:** {dip_report['centroid_localization']['f1']:.4f}
- **Strict IoU (0.33) Recall:** {dip_report['strict_iou_033']['recall']:.4f}
- **Strict IoU (0.33) Precision:** {dip_report['strict_iou_033']['precision']:.4f}
- **Strict IoU (0.33) F1:** {dip_report['strict_iou_033']['f1']:.4f}
"""
    md_path = out_dir / "evaluation_report.md"
    md_path.write_text(md_content, encoding="utf-8")

    print(f"\n[EVALUATION COMPLETE]")
    print(f"Results JSON: {json_path.resolve()}")
    print(f"Report MD   : {md_path.resolve()}")

    return full_evaluation


def main():
    parser = argparse.ArgumentParser(description="Evaluate PCB Vision AI Models and DIP Pipelines")
    parser.add_argument("--weights", default="runs/pcb/train/weights/best.pt", help="Path to trained YOLO weights")
    parser.add_argument("--output-dir", default="runs/pcb/evaluation", help="Directory to save evaluation reports")
    args = parser.parse_args()

    run_full_evaluation(weights_path=args.weights, output_dir=args.output_dir)


if __name__ == "__main__":
    main()
