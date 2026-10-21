"""
PCB Vision AI — YOLO Defect Detection Training Pipeline
-------------------------------------------------------
Reproducible, configurable training pipeline supporting:
- Configurable model architecture (YOLOv8, YOLO11, YOLOv9, etc.)
- Configurable epochs, batch size, image resolution, seed, patience
- Device selection (CPU, CUDA, MPS)
- CPU smoke-test mode for safe local verification
- Strict validation-driven checkpointing (best.pt, last.pt)
"""

from pathlib import Path
import argparse
import sys
import yaml
import torch
from ultralytics import YOLO


def train_yolo(
    data_yaml: str = "dataset/data.yaml",
    model_name: str = "yolov8n.pt",
    epochs: int = 50,
    batch_size: int = 8,
    imgsz: int = 640,
    device: str = "cpu",
    seed: int = 42,
    patience: int = 10,
    project: str = "runs/pcb",
    name: str = "train",
    workers: int = 0,
    smoke_test: bool = False,
):
    data_path = Path(data_yaml)
    if not data_path.exists():
        raise FileNotFoundError(f"Dataset config not found at: {data_path.resolve()}. Run src/prepare_data.py first.")

    print(f"=== PCB Vision AI — YOLO Training ===")
    print(f"Model backbone     : {model_name}")
    print(f"Dataset config     : {data_path}")
    print(f"Target epochs      : {1 if smoke_test else epochs}")
    print(f"Batch size         : {2 if smoke_test else batch_size}")
    print(f"Image resolution   : {160 if smoke_test else imgsz}")
    print(f"Target device      : {device}")
    print(f"Random seed        : {seed}")
    print(f"Early stopping     : patience={patience}")
    print(f"Smoke test mode    : {smoke_test}")

    # Check CUDA if requested
    if device != "cpu" and not torch.cuda.is_available():
        print(f"WARNING: CUDA requested ('{device}') but torch.cuda.is_available() is False. Falling back to CPU.")
        device = "cpu"

    model = YOLO(model_name)

    if smoke_test:
        print("\n>>> RUNNING CPU SMOKE TEST (Mini-dataset, 1 epoch, verification only) <<<")
        smoke_dir = Path("runs/pcb_smoke_data")
        smoke_dir.mkdir(parents=True, exist_ok=True)
        (smoke_dir / "images" / "train").mkdir(parents=True, exist_ok=True)
        (smoke_dir / "images" / "val").mkdir(parents=True, exist_ok=True)
        (smoke_dir / "labels" / "train").mkdir(parents=True, exist_ok=True)
        (smoke_dir / "labels" / "val").mkdir(parents=True, exist_ok=True)

        # Copy 4 images & labels for train and 4 for val
        import shutil
        val_imgs = sorted(list((Path("dataset") / "images" / "val").glob("*.jpg")))[:4]
        for im in val_imgs:
            shutil.copy2(im, smoke_dir / "images" / "train" / im.name)
            shutil.copy2(im, smoke_dir / "images" / "val" / im.name)
            lab = Path("dataset") / "labels" / "val" / f"{im.stem}.txt"
            if lab.exists():
                shutil.copy2(lab, smoke_dir / "labels" / "train" / lab.name)
                shutil.copy2(lab, smoke_dir / "labels" / "val" / lab.name)

        smoke_yaml = smoke_dir / "smoke_data.yaml"
        smoke_config = {
            "path": str(smoke_dir.resolve()),
            "train": "images/train",
            "val": "images/val",
            "names": {0: "open", 1: "short", 2: "mousebite", 3: "spur", 4: "copper", 5: "pin-hole"}
        }
        smoke_yaml.write_text(yaml.safe_dump(smoke_config), encoding="utf8")

        train_args = {
            "data": str(smoke_yaml),
            "epochs": 1,
            "imgsz": 160,
            "batch": 2,
            "device": "cpu",
            "seed": seed,
            "project": project,
            "name": f"{name}_smoke_test",
            "workers": 0,
            "verbose": True,
            "plots": False,
            "exist_ok": True,
        }
    else:
        train_args = {
            "data": str(data_path),
            "epochs": epochs,
            "imgsz": imgsz,
            "batch": batch_size,
            "device": device,
            "seed": seed,
            "patience": patience,
            "project": project,
            "name": name,
            "workers": workers,
            "verbose": True,
            "plots": True,
            "exist_ok": True,
        }

    results = model.train(**train_args)
    print(f"\nTraining routine finished successfully.")
    save_dir = Path(project) / (f"{name}_smoke_test" if smoke_test else name)
    print(f"Artifacts and weights saved in: {save_dir.resolve()}")
    return results


def main():
    parser = argparse.ArgumentParser(description="PCB Vision AI YOLO Training Script")
    parser.add_argument("--data", default="dataset/data.yaml", help="Path to data.yaml")
    parser.add_argument("--model", default="yolov8n.pt", help="Base model weights or architecture (e.g. yolov8n.pt, yolo11n.pt)")
    parser.add_argument("--epochs", type=int, default=50, help="Number of training epochs")
    parser.add_argument("--batch", type=int, default=8, help="Batch size")
    parser.add_argument("--imgsz", type=int, default=640, help="Image resolution")
    parser.add_argument("--device", default="cpu", help="Compute device ('cpu', '0', 'cuda')")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility")
    parser.add_argument("--patience", type=int, default=10, help="Early stopping patience")
    parser.add_argument("--project", default="runs/pcb", help="Project output folder")
    parser.add_argument("--name", default="train", help="Experiment name")
    parser.add_argument("--workers", type=int, default=0, help="Dataloader workers (default 0 on Windows)")
    parser.add_argument("--smoke-test", action="store_true", help="Execute rapid 1-epoch smoke test on CPU without full training")
    args = parser.parse_args()

    train_yolo(
        data_yaml=args.data,
        model_name=args.model,
        epochs=args.epochs,
        batch_size=args.batch,
        imgsz=args.imgsz,
        device=args.device,
        seed=args.seed,
        patience=args.patience,
        project=args.project,
        name=args.name,
        workers=args.workers,
        smoke_test=args.smoke_test,
    )


if __name__ == "__main__":
    main()
