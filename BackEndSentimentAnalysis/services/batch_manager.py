import asyncio
from collections import deque
import os

from aiokafka import AIOKafkaProducer
from kafka.senti_batch_producer import BatchProducer


def start_batch_manager():
    batch_size = int(os.getenv('BATCH_SIZE', '2000'))
    interval = int(os.getenv('BATCH_INTERVAL', '30'))
    batch_manager = BatchManager(batch_size=batch_size, interval=interval)
    return batch_manager


class BatchManager:
    def __init__(self, batch_size=2000, interval=30):
        self.batch = deque()
        self.batch_size = batch_size
        self.interval = interval
        self.batch_ready = asyncio.Event()
        self.producer = BatchProducer()

    async def add_to_batch(self, data):
        self.batch.extend(data)
        if len(self.batch) >= self.batch_size:
            self.batch_ready.set()

    async def manage_batches(self):
        await self.producer.start()
        try:
            while True:
                done, pending = await asyncio.wait(
                    [self.batch_ready.wait(), asyncio.sleep(self.interval)],
                    return_when=asyncio.FIRST_COMPLETED)

                if self.batch_ready.is_set() or not self.batch_ready.is_set():
                    if self.batch:
                        batch_data = list(self.batch)  # Prepare data for processing
                        await self.producer.send_batch(batch_data)
                        self.batch.clear()
                    self.batch_ready.clear()
        finally:
            await self.producer.stop()

    async def start_batching_process(self):
        # Run the manage_batches method as a background task
        asyncio.create_task(self.manage_batches())
