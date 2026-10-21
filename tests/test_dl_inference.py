"""
Unit and Integration Tests for Deep Learning Model Pipeline
"""

from pathlib import Path
import numpy as np
import pytest
from ultralytics import YOLO


def test_model_loading_success():
    """Verify loading trained or pretrained YOLO model."""
    weights_path = Path("runs/pcb/train/weights/best.pt")
    if not weights_path.exists():
        weights_path = Path("yolov8n.pt")

    model = YOLO(str(weights_path))
    assert model is not None
    assert hasattr(model, "predict")


def test_model_loading_missing_file():
    """Verify graceful error when model weights do not exist."""
    with pytest.raises(Exception):
        _ = YOLO("non_existent_weights_path_12345.pt")


def test_inference_on_synthetic_image():
    """Test model inference output structure on valid image."""
    weights_path = Path("runs/pcb/train/weights/best.pt")
    if not weights_path.exists():
        weights_path = Path("yolov8n.pt")

    model = YOLO(str(weights_path))
    dummy_img = np.zeros((640, 640, 3), dtype=np.uint8)

    results = model.predict(source=dummy_img, conf=0.1, verbose=False, device="cpu")
    assert len(results) == 1
    assert hasattr(results[0], "boxes")
    assert hasattr(results[0], "plot")


def test_inference_on_actual_test_sample():
    """Test model prediction on an actual DeepPCB test image."""
    test_imgs = list(Path("dataset/images/test").glob("*.jpg"))
    if not test_imgs:
        pytest.skip("Test images not available")

    weights_path = Path("runs/pcb/train/weights/best.pt")
    model = YOLO(str(weights_path))

    sample_img_path = str(test_imgs[0])
    results = model.predict(source=sample_img_path, conf=0.01, verbose=False, device="cpu")
    assert len(results) == 1
    annotated = results[0].plot()
    assert annotated.shape == (640, 640, 3)
