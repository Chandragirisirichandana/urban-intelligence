"""
Urban Intelligence Platform - Road Defect Model Training Pipeline

Trains a YOLOv8 road defect detector on RDD2022 (India subset) + custom annotations.
Usage:
    python ml/training/train_defect_detector.py --epochs 50 --imgsz 640 --batch 16
"""
import argparse
import sys
import os
from loguru import logger


def train_defect_model(
    config_path: str = "ml/configs/yolo_road_defect.yaml",
    base_model: str = "yolov8s.pt",
    epochs: int = 50,
    imgsz: int = 640,
    batch: int = 16,
    output_dir: str = "ml/artifacts/defect_detector"
):
    try:
        from ultralytics import YOLO
        import torch
        device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Initiating road defect detector training on device: {device}")

        model = YOLO(base_model)
        results = model.train(
            data=config_path,
            epochs=epochs,
            imgsz=imgsz,
            batch=batch,
            device=device,
            project=output_dir,
            name="train_run",
            exist_ok=True,
            mosaic=1.0,
            mixup=0.1,
            flipud=0.0,
            fliplr=0.5
        )
        logger.info("Training complete. Saving weights to ml/artifacts/road_defect.pt")
        # Save best weights
        best_weights = os.path.join(output_dir, "train_run", "weights", "best.pt")
        if os.path.exists(best_weights):
            import shutil
            shutil.copy(best_weights, "ml/artifacts/road_defect.pt")
            logger.info("Model saved to ml/artifacts/road_defect.pt")
    except ImportError:
        logger.warning(
            "Ultralytics or PyTorch not installed in current environment. "
            "To train on GPU: pip install ultralytics torch torchvision"
        )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train Road Defect YOLOv8 Model")
    parser.add_argument("--epochs", type=int, default=50)
    parser.add_argument("--batch", type=int, default=16)
    parser.add_argument("--imgsz", type=int, default=640)
    args = parser.parse_args()

    train_defect_model(epochs=args.epochs, batch=args.batch, imgsz=args.imgsz)
