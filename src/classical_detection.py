"""
PCB Vision AI — Classical Digital Image Processing (DIP) Pipeline
-----------------------------------------------------------------
Traditional reference-based defect detection using:
1. Image alignment (ORB keypoints + RANSAC homography).
2. Grayscale conversion.
3. Gaussian noise filtering.
4. Reference and test absolute differencing.
5. Adaptive, Otsu, or Fixed thresholding.
6. Mathematical morphology (Opening for speckle removal, Closing for void filling).
7. Connected component analysis and bounding box localization.
8. Quantitative ground-truth evaluation (IoU, Precision, Recall, F1).
"""

from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
import argparse
import cv2
import numpy as np


@dataclass
class ClassicalDetectionResult:
    """Holds the outputs of the classical DIP inspection pipeline."""
    annotated_image: np.ndarray
    diff_map: np.ndarray
    thresholded_mask: np.ndarray
    cleaned_mask: np.ndarray
    aligned_reference: np.ndarray
    boxes: List[Tuple[int, int, int, int]]  # (x, y, w, h)
    areas: List[int]
    centroids: List[Tuple[float, float]]
    metrics: Dict[str, Any] = field(default_factory=dict)


def align_images(
    reference: np.ndarray,
    test: np.ndarray,
    max_features: int = 1500,
    good_match_percent: float = 0.25,
) -> Tuple[np.ndarray, Optional[np.ndarray]]:
    """
    Align reference image to test image using ORB feature detection and RANSAC Homography.
    If alignment fails or images are identical dimensions and alignment score is poor,
    falls back safely to the original reference image.
    """
    if reference.shape == test.shape and np.array_equal(reference, test):
        return reference.copy(), np.eye(3, dtype=np.float32)

    # Convert to grayscale for feature detection
    ref_gray = cv2.cvtColor(reference, cv2.COLOR_BGR2GRAY) if len(reference.shape) == 3 else reference
    test_gray = cv2.cvtColor(test, cv2.COLOR_BGR2GRAY) if len(test.shape) == 3 else test

    # Detect ORB features and compute descriptors
    orb = cv2.ORB_create(nfeatures=max_features)
    kp_ref, des_ref = orb.detectAndCompute(ref_gray, None)
    kp_test, des_test = orb.detectAndCompute(test_gray, None)

    if des_ref is None or des_test is None or len(kp_ref) < 8 or len(kp_test) < 8:
        # Cannot align via features; resize reference to match test if shapes differ
        if reference.shape[:2] != test.shape[:2]:
            resized = cv2.resize(reference, (test.shape[1], test.shape[0]))
            return resized, None
        return reference.copy(), None

    matcher = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
    matches = matcher.match(des_ref, des_test)
    matches = sorted(matches, key=lambda x: x.distance)

    # Retain only top matches
    num_good_matches = max(8, int(len(matches) * good_match_percent))
    good_matches = matches[:num_good_matches]

    points_ref = np.float32([kp_ref[m.queryIdx].pt for m in good_matches]).reshape(-1, 1, 2)
    points_test = np.float32([kp_test[m.trainIdx].pt for m in good_matches]).reshape(-1, 1, 2)

    homography, inlier_mask = cv2.findHomography(points_ref, points_test, cv2.RANSAC, 5.0)

    if homography is None:
        if reference.shape[:2] != test.shape[:2]:
            return cv2.resize(reference, (test.shape[1], test.shape[0])), None
        return reference.copy(), None

    height, width = test.shape[:2]
    aligned_ref = cv2.warpPerspective(reference, homography, (width, height), flags=cv2.INTER_LINEAR)
    return aligned_ref, homography


def detect(
    reference: np.ndarray,
    test: np.ndarray,
    threshold_method: str = "otsu",
    threshold_value: int = 30,
    gaussian_kernel: int = 3,
    morph_kernel_size: int = 3,
    min_area: int = 8,
    max_area: int = 50000,
    auto_align: bool = False,
    bbox_padding: int = 2,
) -> ClassicalDetectionResult:
    """
    Execute full classical DIP defect detection between a reference template and a test PCB image.

    Args:
        reference: BGR numpy image of the defect-free template.
        test: BGR numpy image of the inspected PCB board.
        threshold_method: 'otsu', 'adaptive', or 'fixed'.
        threshold_value: Pixel difference cutoff for 'fixed' thresholding.
        gaussian_kernel: Kernel dimension for Gaussian blur (must be odd).
        morph_kernel_size: Structuring element dimension for morphological operations.
        min_area: Minimum connected-component pixel area to retain as a defect candidate.
        max_area: Maximum connected-component pixel area to retain (filters global board errors).
        auto_align: Whether to run ORB-based homography alignment before differencing.
        bbox_padding: Pixel padding to expand detected bounding boxes for inspection context.

    Returns:
        ClassicalDetectionResult with all masks, visualizations, and candidate boxes.
    """
    if auto_align or reference.shape[:2] != test.shape[:2]:
        ref_aligned, _ = align_images(reference, test)
    else:
        ref_aligned = reference.copy()

    # Step 1: Grayscale Conversion
    ref_gray = cv2.cvtColor(ref_aligned, cv2.COLOR_BGR2GRAY) if len(ref_aligned.shape) == 3 else ref_aligned
    test_gray = cv2.cvtColor(test, cv2.COLOR_BGR2GRAY) if len(test.shape) == 3 else test

    # Step 2: Gaussian Filtering (High-frequency sensor noise attenuation)
    k = gaussian_kernel if gaussian_kernel % 2 == 1 else gaussian_kernel + 1
    ref_smooth = cv2.GaussianBlur(ref_gray, (k, k), 0)
    test_smooth = cv2.GaussianBlur(test_gray, (k, k), 0)

    # Step 3: Absolute Difference Calculation
    diff = cv2.absdiff(ref_smooth, test_smooth)

    # Step 4: Thresholding
    method_lower = threshold_method.lower().strip()
    if method_lower == "otsu":
        _, binary = cv2.threshold(diff, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    elif method_lower == "adaptive":
        binary = cv2.adaptiveThreshold(
            diff, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
        )
    elif method_lower == "fixed":
        _, binary = cv2.threshold(diff, threshold_value, 255, cv2.THRESH_BINARY)
    else:
        raise ValueError(f"Unsupported threshold method: '{threshold_method}'. Choose 'otsu', 'adaptive', or 'fixed'.")

    # Step 5: Morphological Operations
    # Opening removes isolated false-positive noise pixels; Closing fills small internal voids.
    se = cv2.getStructuringElement(cv2.MORPH_RECT, (morph_kernel_size, morph_kernel_size))
    opened = cv2.morphologyEx(binary, cv2.MORPH_OPEN, se)
    cleaned = cv2.morphologyEx(opened, cv2.MORPH_CLOSE, se)

    # Step 6: Connected Component Analysis
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(cleaned, connectivity=8)

    h_img, w_img = test.shape[:2]
    candidate_boxes: List[Tuple[int, int, int, int]] = []
    candidate_areas: List[int] = []
    candidate_centroids: List[Tuple[float, float]] = []

    canvas = test.copy()

    # stats[0] is always the background component, so iterate from index 1
    for idx in range(1, num_labels):
        x, y, w, h, area = stats[idx]
        if min_area <= area <= max_area:
            # Add padding around bounding box for industrial inspection clarity
            x_pad = max(0, int(x) - bbox_padding)
            y_pad = max(0, int(y) - bbox_padding)
            w_pad = min(w_img - x_pad, int(w) + 2 * bbox_padding)
            h_pad = min(h_img - y_pad, int(h) + 2 * bbox_padding)

            candidate_boxes.append((x_pad, y_pad, w_pad, h_pad))
            candidate_areas.append(int(area))
            candidate_centroids.append((float(centroids[idx][0]), float(centroids[idx][1])))

            # Draw visual highlight on canvas (Yellow bounding box for classical candidate)
            cv2.rectangle(canvas, (x_pad, y_pad), (x_pad + w_pad, y_pad + h_pad), (0, 215, 255), 2)
            cv2.putText(
                canvas,
                f"Diff #{len(candidate_boxes)}",
                (x_pad, max(14, y_pad - 4)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.45,
                (0, 215, 255),
                1,
                cv2.LINE_AA,
            )

    return ClassicalDetectionResult(
        annotated_image=canvas,
        diff_map=diff,
        thresholded_mask=binary,
        cleaned_mask=cleaned,
        aligned_reference=ref_aligned,
        boxes=candidate_boxes,
        areas=candidate_areas,
        centroids=candidate_centroids,
        metrics={
            "num_candidates": len(candidate_boxes),
            "threshold_method": method_lower,
            "threshold_value": threshold_value,
            "min_area": min_area,
            "max_area": max_area,
            "aligned": auto_align,
        },
    )


def compute_iou(box_a: Tuple[int, int, int, int], box_b: Tuple[int, int, int, int]) -> float:
    """Calculate Intersection over Union (IoU) between two bounding boxes (x, y, w, h)."""
    xa1, ya1, wa, ha = box_a
    xa2, ya2 = xa1 + wa, ya1 + ha

    xb1, yb1, wb, hb = box_b
    xb2, yb2 = xb1 + wb, yb1 + hb

    xi1 = max(xa1, xb1)
    yi1 = max(ya1, yb1)
    xi2 = min(xa2, xb2)
    yi2 = min(ya2, yb2)

    inter_w = max(0, xi2 - xi1)
    inter_h = max(0, yi2 - yi1)
    inter_area = inter_w * inter_h

    area_a = wa * ha
    area_b = wb * hb
    union_area = area_a + area_b - inter_area

    if union_area <= 0:
        return 0.0
    return float(inter_area / union_area)


def evaluate_dip_against_ground_truth(
    detected_boxes: List[Tuple[int, int, int, int]],
    gt_boxes: List[Tuple[int, int, int, int]],
    iou_threshold: float = 0.33,
) -> Dict[str, Any]:
    """
    Evaluate classical detection candidates against ground truth bounding boxes.
    Reports both:
      1. Strict IoU-based matching (IoU >= iou_threshold).
      2. Center-in-box / Point-in-GT localization matching (defect centroid falls inside GT).
    """
    if not gt_boxes and not detected_boxes:
        return {"precision_iou": 1.0, "recall_iou": 1.0, "f1_iou": 1.0, "tp_iou": 0, "fp_iou": 0, "fn_iou": 0,
                "precision_center": 1.0, "recall_center": 1.0, "f1_center": 1.0, "tp_center": 0, "fp_center": 0, "fn_center": 0}

    # 1. Strict IoU matching
    matched_gt_iou = set()
    tp_iou = 0
    fp_iou = 0

    for det in detected_boxes:
        best_iou = 0.0
        best_gt_idx = -1
        for idx, gt in enumerate(gt_boxes):
            if idx in matched_gt_iou:
                continue
            iou = compute_iou(det, gt)
            if iou > best_iou:
                best_iou = iou
                best_gt_idx = idx

        if best_iou >= iou_threshold and best_gt_idx != -1:
            tp_iou += 1
            matched_gt_iou.add(best_gt_idx)
        else:
            fp_iou += 1

    fn_iou = len(gt_boxes) - len(matched_gt_iou)
    prec_iou = tp_iou / (tp_iou + fp_iou) if (tp_iou + fp_iou) > 0 else 0.0
    rec_iou = tp_iou / (tp_iou + fn_iou) if (tp_iou + fn_iou) > 0 else 0.0
    f1_iou = 2 * (prec_iou * rec_iou) / (prec_iou + rec_iou) if (prec_iou + rec_iou) > 0 else 0.0

    # 2. Centroid-in-GT matching (defect localized within true defect boundaries)
    matched_gt_center = set()
    tp_center = 0
    fp_center = 0

    for x, y, w, h in detected_boxes:
        cx, cy = x + w / 2.0, y + h / 2.0
        matched = False
        for idx, (gx, gy, gw, gh) in enumerate(gt_boxes):
            if idx in matched_gt_center:
                continue
            if gx <= cx <= gx + gw and gy <= cy <= gy + gh:
                tp_center += 1
                matched_gt_center.add(idx)
                matched = True
                break
        if not matched:
            fp_center += 1

    fn_center = len(gt_boxes) - len(matched_gt_center)
    prec_center = tp_center / (tp_center + fp_center) if (tp_center + fp_center) > 0 else 0.0
    rec_center = tp_center / (tp_center + fn_center) if (tp_center + fn_center) > 0 else 0.0
    f1_center = 2 * (prec_center * rec_center) / (prec_center + rec_center) if (prec_center + rec_center) > 0 else 0.0

    return {
        "precision_iou": float(prec_iou),
        "recall_iou": float(rec_iou),
        "f1_iou": float(f1_iou),
        "tp_iou": tp_iou,
        "fp_iou": fp_iou,
        "fn_iou": fn_iou,
        "precision_center": float(prec_center),
        "recall_center": float(rec_center),
        "f1_center": float(f1_center),
        "tp_center": tp_center,
        "fp_center": fp_center,
        "fn_center": fn_center,
    }


def main():
    parser = argparse.ArgumentParser(description="Classical DIP PCB Defect Detection Pipeline")
    parser.add_argument("--reference", "-r", required=True, help="Path to defect-free template/reference image")
    parser.add_argument("--test", "-t", required=True, help="Path to defective/inspected PCB image")
    parser.add_argument("--gt", "-g", default=None, help="Optional path to DeepPCB .txt annotation file for quantitative evaluation")
    parser.add_argument("--output", "-o", default="classical_result.jpg", help="Path to save annotated inspection result")
    parser.add_argument("--method", default="otsu", choices=["otsu", "adaptive", "fixed"], help="Thresholding method")
    parser.add_argument("--thresh-val", type=int, default=30, help="Cutoff value for fixed thresholding")
    parser.add_argument("--min-area", type=int, default=8, help="Minimum connected component area in pixels")
    parser.add_argument("--align", action="store_true", help="Perform ORB homography alignment before differencing")
    args = parser.parse_args()

    ref = cv2.imread(args.reference)
    test = cv2.imread(args.test)
    if ref is None:
        raise FileNotFoundError(f"Could not load reference image: {args.reference}")
    if test is None:
        raise FileNotFoundError(f"Could not load test image: {args.test}")

    res = detect(
        reference=ref,
        test=test,
        threshold_method=args.method,
        threshold_value=args.thresh_val,
        min_area=args.min_area,
        auto_align=args.align,
    )

    out_p = Path(args.output)
    out_p.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(out_p), res.annotated_image)
    cv2.imwrite(str(out_p.with_name(f"{out_p.stem}_diff.png")), res.diff_map)
    cv2.imwrite(str(out_p.with_name(f"{out_p.stem}_mask.png")), res.cleaned_mask)

    print(f"Inspection complete. Detected {len(res.boxes)} candidate regions.")
    print(f"Annotated result saved to: {out_p}")

    if args.gt:
        gt_path = Path(args.gt)
        if gt_path.exists():
            gt_boxes = []
            for line in gt_path.read_text(encoding="utf-8-sig").splitlines():
                if not line.strip():
                    continue
                parts = line.replace(",", " ").split()
                if len(parts) >= 4:
                    x1, y1, x2, y2 = (int(float(p)) for p in parts[:4])
                    gt_boxes.append((x1, y1, x2 - x1, y2 - y1))
            metrics = evaluate_dip_against_ground_truth(res.boxes, gt_boxes, iou_threshold=0.33)
            print("Evaluation against Ground Truth:")
            print("  --- Strict IoU Matching (IoU >= 0.33) ---")
            print(f"    True Positives : {metrics['tp_iou']}")
            print(f"    False Positives: {metrics['fp_iou']}")
            print(f"    False Negatives: {metrics['fn_iou']}")
            print(f"    Precision      : {metrics['precision_iou']:.4f}")
            print(f"    Recall         : {metrics['recall_iou']:.4f}")
            print(f"    F1 Score       : {metrics['f1_iou']:.4f}")
            print("  --- Centroid-in-GT Localization Matching ---")
            print(f"    True Positives : {metrics['tp_center']}")
            print(f"    False Positives: {metrics['fp_center']}")
            print(f"    False Negatives: {metrics['fn_center']}")
            print(f"    Precision      : {metrics['precision_center']:.4f}")
            print(f"    Recall         : {metrics['recall_center']:.4f}")
            print(f"    F1 Score       : {metrics['f1_center']:.4f}")


if __name__ == "__main__":
    main()
