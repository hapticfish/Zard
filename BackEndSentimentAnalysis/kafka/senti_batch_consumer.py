import asyncio
from aiokafka import AIOKafkaConsumer
import os
import json


class BatchConsumer:
    def __init__(self, topics, kafka_brokers='kafka1:9092,kafka2:9092', group_id='my-consumer-group'):
        self.topics = topics if isinstance(topics, list) else [topics]
        self.kafka_brokers = kafka_brokers
        self.group_id = group_id
        self.consumer = None

    async def start(self):
        """Initialize and start the Kafka consumer."""
        self.consumer = AIOKafkaConsumer(
            *self.topics,
            bootstrap_servers=self.kafka_brokers,
            group_id=self.group_id,
            auto_offset_reset='earliest',
            value_deserializer=lambda m: json.loads(m.decode('utf-8'))
        )
        await self.consumer.start()
        print("Kafka Consumer started successfully.")

    async def consume_messages(self, process_message_func):
        """Consume messages and process them with the provided function."""
        try:
            async for message in self.consumer:
                print(f"Received message from {message.topic}: {message.value}")
                await process_message_func(message.value)
        finally:
            await self.stop()

    async def stop(self):
        """Stop the Kafka consumer."""
        if self.consumer is not None:
            await self.consumer.stop()
            self.consumer = None
            print("Kafka Consumer stopped successfully.")

