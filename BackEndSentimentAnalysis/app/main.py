from fastapi import FastAPI
import uvicorn
from aiokafka import AIOKafkaConsumer
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from db.crud import flush_buffer
from db.database import database
from dotenv import load_dotenv
import asyncio
import json
import os

app = FastAPI()

# Load environment variables from .env file at the start of the app
load_dotenv()

async_engine = create_async_engine("postgresql+asyncpg://user:password@localhost/dbname")
AsyncSessionLocal = sessionmaker(bind=async_engine, class_=AsyncSession, expire_on_commit=False)

# Async function to consume Kafka messages
async def consume():
    consumer = AIOKafkaConsumer(
        'redditSentiment',
        'twitterPosts',
        bootstrap_servers=os.getenv('KAFKA_BROKERS', 'kafka1:9092,kafka2:9092'),
        group_id=os.getenv('KAFKA_GROUP_ID', 'my-consumer-group')
    )
    await consumer.start()
    try:
        async for msg in consumer:
            message = json.loads(msg.value)
            print(f"Received: {message}")
            # Process the message and save results (consider using a separate module)
            await save_sentiment_analysis_results(message)
    finally:
        await consumer.stop()

# Placeholder for saving sentiment analysis results, should be moved to a proper CRUD module
async def save_sentiment_analysis_results(data):
    query = """
    INSERT INTO sentiment_results (batch_id, time_frame, sentiment_score, analysis_time, calculation_duration, request_count, topic_keywords, sentiment_trend)
    VALUES (:batch_id, :time_frame, :sentiment_score, :analysis_time, :calculation_duration, :request_count, :topic_keywords, :sentiment_trend)
    """
    await database.execute(query, values=data)

# Application event handlers
@app.on_event("startup")
async def startup():
    await database.connect()
    # Start Kafka consumer in the background
    task = asyncio.create_task(consume())
    await asyncio.sleep(1)  # Ensure the consumer starts

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()
    # Create a session to flush any remaining buffered data
    async with AsyncSessionLocal() as session:
        await flush_buffer(session)
    # Add logic to gracefully shut down the consumer if needed

# Include API routers if any
# from routers import some_router
# app.include_router(some_router.router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
