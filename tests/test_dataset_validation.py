"""
Dataset Integrity and Annotation Validation Tests
"""

from pathlib import Path
from collections import defaultdict
import yaml
import pytest


@pytest.fixture
def dataset_root():
    return Path("dataset")


def test_data_yaml_structure(dataset_root):
    """Verify data.yaml exists and contains required YOLO dataset keys."""
    yaml_path = dataset_root / "data.yaml"
    assert yaml_path.exists(), "dataset/data.yaml is missing"

    with open(yaml_path, encoding="utf-8") as f:
        cfg = yaml.safe_load(f)

    for required_key in ["path", "train", "val", "test", "names"]:
        assert required_key in cfg, f"Missing key in data.yaml: {required_key}"

    # Verify 6 classes and names in original DeepPCB order
    expected_classes = {
        0: "open",
        1: "short",
        2: "mousebite",
        3: "spur",
        4: "copper",
        5: "pin-hole",
    }
    assert cfg["names"] == expected_classes


def test_image_label_pairing(dataset_root):
    """Verify all images in train, val, test splits have matching annotation files."""
    for split in ["train", "val", "test"]:
        img_dir = dataset_root / "images" / split
        lbl_dir = dataset_root / "labels" / split
        assert img_dir.exists(), f"Images directory for {split} missing"
        assert lbl_dir.exists(), f"Labels directory for {split} missing"

        images = sorted(list(img_dir.glob("*.jpg")))
        labels = sorted(list(lbl_dir.glob("*.txt")))

        assert len(images) > 0, f"Split {split} has 0 images"
        assert len(images) == len(labels), f"Split {split} image count ({len(images)}) != label count ({len(labels)})"

        img_stems = {im.stem for im in images}
        lbl_stems = {lb.stem for lb in labels}
        assert img_stems == lbl_stems, f"Mismatch in image and label stems in {split}"


def test_annotation_coordinates_normalized(dataset_root):
    """Validate all annotation bounding box coordinates are normalized in [0, 1]."""
    for split in ["train", "val", "test"]:
        lbl_dir = dataset_root / "labels" / split
        for lbl_file in lbl_dir.glob("*.txt"):
            lines = lbl_file.read_text(encoding="utf-8").splitlines()
            for line_idx, line in enumerate(lines, 1):
                if not line.strip():
                    continue
                parts = line.split()
                assert len(parts) == 5, f"Invalid label format in {lbl_file}:{line_idx}"
                cls = int(parts[0])
                cx, cy, bw, bh = [float(p) for p in parts[1:]]

                assert 0 <= cls <= 5, f"Class ID out of range [0, 5] in {lbl_file}:{line_idx}"
                assert 0.0 <= cx <= 1.0, f"cx out of range [0, 1] in {lbl_file}:{line_idx}"
                assert 0.0 <= cy <= 1.0, f"cy out of range [0, 1] in {lbl_file}:{line_idx}"
                assert 0.0 < bw <= 1.0, f"bw out of range (0, 1] in {lbl_file}:{line_idx}"
                assert 0.0 < bh <= 1.0, f"bh out of range (0, 1] in {lbl_file}:{line_idx}"


def test_zero_group_leakage(dataset_root):
    """Ensure train, val, and test groups are strictly disjoint sets."""
    split_groups = defaultdict(set)
    for split in ["train", "val", "test"]:
        lbl_dir = dataset_root / "labels" / split
        for lbl_file in lbl_dir.glob("*.txt"):
            group_name = lbl_file.stem.split("_")[0]
            split_groups[split].add(group_name)

    train_groups = split_groups["train"]
    val_groups = split_groups["val"]
    test_groups = split_groups["test"]

    assert len(train_groups.intersection(val_groups)) == 0, "Train and Val groups overlap!"
    assert len(train_groups.intersection(test_groups)) == 0, "Train and Test groups overlap!"
    assert len(val_groups.intersection(test_groups)) == 0, "Val and Test groups overlap!"
