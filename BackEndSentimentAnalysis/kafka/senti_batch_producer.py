import asyncio
from aiokafka import AIOKafkaProducer
import os
import json


class BatchProducer:
    def __init__(self, kafka_topic='processed_data'):
        self.kafka_topic = kafka_topic
        self.producer = None

    async def start(self):
        """Initialize and start the Kafka producer."""
        self.producer = AIOKafkaProducer(
            bootstrap_servers=os.getenv('KAFKA_BROKERS', 'kafka1:9092,kafka2:9092'), #update these
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )
        await self.producer.start()
        print("Kafka Producer started successfully.")

    async def send_batch(self, batch_data):
        """Send a batch of data to Kafka topic."""
        if self.producer is not None:
            try:
                # Serialize and send data
                await self.producer.send_and_wait(self.kafka_topic, batch_data)
                print(f"Sent batch to {self.kafka_topic}")
            except Exception as e:
                print(f"Failed to send batch: {e}")
        else:
            print("Producer not initialized or already stopped.")

    async def stop(self):
        """Stop the Kafka producer."""
        if self.producer is not None:
            await self.producer.stop()
            self.producer = None
            print("Kafka Producer stopped successfully.")
        else:
            print("Producer was not started or already stopped.")

