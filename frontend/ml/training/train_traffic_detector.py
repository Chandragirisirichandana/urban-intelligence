"""
Urban Intelligence Platform - Traffic & Vehicle Model Training Pipeline

Trains YOLOv8 for vehicle classification (car, bus, truck, motorcycle, auto_rickshaw, etc.)
Usage:
    python ml/training/train_traffic_detector.py --epochs 60 --batch 16
"""
import argparse
import os
from loguru import logger


def train_traffic_model(
    config_path: str = "ml/configs/yolo_traffic.yaml",
    base_model: str = "yolov8n.pt",
    epochs: int = 60,
    batch: int = 16,
    imgsz: int = 640,
    output_dir: str = "ml/artifacts/traffic_detector"
):
    try:
        from ultralytics import YOLO
        import torch
        device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Initiating traffic detector training on device: {device}")

        model = YOLO(base_model)
        results = model.train(
            data=config_path,
            epochs=epochs,
            imgsz=imgsz,
            batch=batch,
            device=device,
            project=output_dir,
            name="train_run",
            exist_ok=True
        )
        logger.info("Traffic detector training finished.")
    except ImportError:
        logger.warning(
            "Ultralytics or PyTorch not installed in current environment. "
            "To train: pip install ultralytics torch torchvision"
        )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--epochs", type=int, default=60)
    parser.add_argument("--batch", type=int, default=16)
    args = parser.parse_args()
    train_traffic_model(epochs=args.epochs, batch=args.batch)
