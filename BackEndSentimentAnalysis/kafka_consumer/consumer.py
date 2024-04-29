import json
from aiokafka import AIOKafkaConsumer
import asyncio

async def consume():
    consumer = AIOKafkaConsumer(
        'redditSentiment', 'twitterPosts',
        bootstrap_servers='kafka1:9092,kafka2:9092',
        value_deserializer=lambda m: json.loads(m.decode('utf-8'))
    )
    await consumer.start()
    try:
        async for msg in consumer:
            print(f"Received: {msg.topic}, {msg.value}")
            # Process message based on topic
            if msg.topic == 'redditSentiment':
                await process_reddit_sentiment(msg.value)
            elif msg.topic == 'twitterPosts':
                await process_twitter_posts(msg.value)
    finally:
        await consumer.stop()

async def process_reddit_sentiment(data):
    # Placeholder for sentiment analysis processing logic
    print(f"Processing Reddit Data: {data}")

async def process_twitter_posts(data):
    # Placeholder for Twitter post-processing logic
    print(f"Processing Twitter Data: {data}")
