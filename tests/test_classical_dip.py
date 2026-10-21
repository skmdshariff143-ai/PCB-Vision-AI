"""
Unit & Integration Tests for Classical DIP Defect Detection Pipeline
"""

import numpy as np
import pytest
import cv2

from src.classical_detection import (
    detect,
    align_images,
    compute_iou,
    evaluate_dip_against_ground_truth,
    ClassicalDetectionResult,
)


@pytest.fixture
def clean_synthetic_pcb():
    """Create a synthetic defect-free PCB image."""
    img = np.ones((200, 200, 3), dtype=np.uint8) * 40  # Dark substrate
    # Draw conductive copper traces
    cv2.line(img, (20, 50), (180, 50), (0, 180, 220), 8)   # Trace 1
    cv2.line(img, (20, 100), (180, 100), (0, 180, 220), 8) # Trace 2
    cv2.circle(img, (100, 150), 16, (0, 180, 220), -1)     # Solder pad
    return img


@pytest.fixture
def defective_synthetic_pcb(clean_synthetic_pcb):
    """Create a synthetic PCB with artificial open circuit and pin hole defects."""
    test_img = clean_synthetic_pcb.copy()
    # 1. Open circuit on Trace 1 (cut trace)
    cv2.rectangle(test_img, (80, 44), (100, 56), (40, 40, 40), -1)
    # 2. Pin-hole in solder pad
    cv2.circle(test_img, (100, 150), 5, (40, 40, 40), -1)
    return test_img


def test_dip_identical_images(clean_synthetic_pcb):
    """Identical reference and test images must produce zero candidate defects."""
    res = detect(clean_synthetic_pcb, clean_synthetic_pcb, threshold_method="otsu")
    assert isinstance(res, ClassicalDetectionResult)
    assert len(res.boxes) == 0
    assert np.count_nonzero(res.cleaned_mask) == 0


def test_dip_defect_localization(clean_synthetic_pcb, defective_synthetic_pcb):
    """DIP pipeline must detect both synthetic defects."""
    res = detect(
        reference=clean_synthetic_pcb,
        test=defective_synthetic_pcb,
        threshold_method="otsu",
        min_area=10,
    )
    assert len(res.boxes) >= 2, f"Expected at least 2 defects, found {len(res.boxes)}"
    # Check that mask has non-zero pixels around the defect locations
    assert np.count_nonzero(res.cleaned_mask[44:56, 80:100]) > 0
    assert np.count_nonzero(res.cleaned_mask[145:155, 95:105]) > 0


def test_thresholding_methods(clean_synthetic_pcb, defective_synthetic_pcb):
    """Verify otsu, adaptive, and fixed thresholding execution."""
    for method in ["otsu", "adaptive", "fixed"]:
        res = detect(
            reference=clean_synthetic_pcb,
            test=defective_synthetic_pcb,
            threshold_method=method,
            threshold_value=25,
        )
        assert res.diff_map is not None
        assert res.cleaned_mask is not None

    with pytest.raises(ValueError):
        detect(clean_synthetic_pcb, defective_synthetic_pcb, threshold_method="invalid_algo")


def test_compute_iou():
    """Test IoU geometry calculations."""
    box1 = (10, 10, 20, 20)
    box2 = (10, 10, 20, 20)
    assert compute_iou(box1, box2) == 1.0

    box_disjoint = (100, 100, 20, 20)
    assert compute_iou(box1, box_disjoint) == 0.0

    box_half = (10, 10, 20, 10)
    iou_half = compute_iou(box1, box_half)
    assert 0.49 <= iou_half <= 0.51


def test_evaluate_dip_ground_truth():
    """Test evaluation calculation against ground truth annotations."""
    gt_boxes = [(50, 50, 20, 20), (100, 100, 15, 15)]
    detected_perfect = [(50, 50, 20, 20), (100, 100, 15, 15)]

    metrics = evaluate_dip_against_ground_truth(detected_perfect, gt_boxes, iou_threshold=0.5)
    assert metrics["precision_iou"] == 1.0
    assert metrics["recall_iou"] == 1.0
    assert metrics["f1_iou"] == 1.0
    assert metrics["precision_center"] == 1.0
    assert metrics["recall_center"] == 1.0


def test_align_images_fallback(clean_synthetic_pcb):
    """Verify alignment returns valid images without crashing even on flat textures."""
    aligned, h = align_images(clean_synthetic_pcb, clean_synthetic_pcb)
    assert aligned.shape == clean_synthetic_pcb.shape
