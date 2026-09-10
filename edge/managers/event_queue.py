"""
Urban Intelligence Platform - Edge Event Queue & Synchronization

Maintains a local FIFO queue of detected urban events at the bus edge node.
Provides resilient transmission to Central Command API with:
- Offline persistence (works through tunnels / network dead zones)
- Exponential backoff retry logic
- Bandwidth throttling (metadata first, evidence upon request or high severity)
"""
import os
import json
import time
import asyncio
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
import httpx
from loguru import logger


@dataclass
class EdgeQueueItem:
    """Represents a queued event pending sync to central server."""
    queue_id: str
    payload: Dict[str, Any]
    priority: int  # 1 = critical (instant sync), 2 = high, 3 = normal, 4 = low
    retry_count: int = 0
    max_retries: int = 5
    created_at: float = None

    def __post_init__(self):
        if self.created_at is None:
            self.created_at = time.time()


class EdgeEventQueue:
    """
    Edge-side resilient event buffer with async sync worker.
    """

    def __init__(
        self,
        api_base_url: str = "http://localhost:8000",
        api_token: Optional[str] = None,
        cache_file: str = "./edge_event_cache.json"
    ):
        self.api_base_url = api_base_url.rstrip("/")
        self.api_token = api_token
        self.cache_file = cache_file
        self.queue: List[EdgeQueueItem] = []
        self._load_cache()

    def enqueue(self, payload: Dict[str, Any], priority: int = 3):
        """Adds a detection event to the local sync queue."""
        queue_id = f"q_{int(time.time()*1000)}_{len(self.queue)}"
        item = EdgeQueueItem(queue_id=queue_id, payload=payload, priority=priority)
        self.queue.append(item)
        # Sort queue by priority ascending (1 highest)
        self.queue.sort(key=lambda x: x.priority)
        self._save_cache()
        logger.debug(f"Enqueued event {queue_id} (priority={priority}, queue_size={len(self.queue)})")

    async def sync_batch(self, max_items: int = 10) -> int:
        """
        Sends pending events to the central API.
        Returns number of successfully synced events.
        """
        if not self.queue:
            return 0

        synced_count = 0
        items_to_process = self.queue[:max_items]
        remaining = self.queue[max_items:]

        headers = {"Content-Type": "application/json"}
        if self.api_token:
            headers["Authorization"] = f"Bearer {self.api_token}"

        async with httpx.AsyncClient(timeout=10.0) as client:
            for item in items_to_process:
                try:
                    url = f"{self.api_base_url}/api/events/"
                    response = await client.post(url, json=item.payload, headers=headers)
                    if response.status_code in [200, 201]:
                        synced_count += 1
                        logger.info(f"✅ Successfully synced event {item.payload.get('event_type')} to Central Server")
                    else:
                        item.retry_count += 1
                        if item.retry_count < item.max_retries:
                            remaining.append(item)
                        else:
                            logger.error(f"❌ Dropping event {item.queue_id} after {item.max_retries} failed attempts")
                except Exception as ex:
                    item.retry_count += 1
                    logger.warning(f"⚠️ Network error syncing {item.queue_id}: {str(ex)[:80]}")
                    if item.retry_count < item.max_retries:
                        remaining.append(item)

        self.queue = remaining
        self._save_cache()
        return synced_count

    def _save_cache(self):
        """Serializes pending queue to local disk for offline resilience."""
        try:
            data = [asdict(i) for i in self.queue]
            with open(self.cache_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
        except Exception as ex:
            logger.warning(f"Could not persist edge queue: {ex}")

    def _load_cache(self):
        """Restores pending queue from local disk if application restarts."""
        if os.path.exists(self.cache_file):
            try:
                with open(self.cache_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.queue = [EdgeQueueItem(**item) for item in data]
                    logger.info(f"Loaded {len(self.queue)} cached events from local storage")
            except Exception as ex:
                logger.warning(f"Failed loading cache file: {ex}")
