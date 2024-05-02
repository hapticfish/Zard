from fastapi import FastAPI
import uvicorn
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import asyncio
import os

from services.batch_manager import start_batch_manager
from kafka.senti_batch_producer import BatchProducer
from kafka.senti_batch_consumer import BatchConsumer
from kafka.raw_data_consumer import raw_consume
from db.crud import flush_buffer
from db.database import database
from services.sentiment_analysis import perform_sentiment_analysis  # Ensure this import

app = FastAPI()

# Load environment variables
load_dotenv()

# Create the asynchronous engine and session maker
async_engine = create_async_engine(os.getenv('DATABASE_URL'))
AsyncSessionLocal = sessionmaker(bind=async_engine, class_=AsyncSession, expire_on_commit=False)

raw_consumer_task = None
batch_producer_task = None
batch_consumer_task = None


# Application event handlers
@app.on_event("startup")
async def startup():
    global raw_consumer_task, batch_producer_task, batch_consumer_task
    batch_manager = await start_batch_manager()
    await database.connect()
    await batch_manager.start_batching_process()

    raw_consumer_task = asyncio.create_task(raw_consume())  # Initialize and start the raw data consumer

    # Initialize and start the batch data producer
    batch_producer = BatchProducer('batched_data_topic')
    batch_producer_task = asyncio.create_task(batch_producer.start())

    # Initialize and start the batch data consumer for sentiment analysis
    batch_consumer = BatchConsumer('batched_data_topic', )
    batch_consumer_task = asyncio.create_task(batch_consumer.consume_messages(perform_sentiment_analysis))


@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()
    if raw_consumer_task:
        raw_consumer_task.cancel()
        try:
            await raw_consumer_task
        except asyncio.CancelledError:
            print("Consumer task canceled.")

    if batch_producer_task:
        batch_producer_task.cancel()
        try:
            await batch_producer_task
        except asyncio.CancelledError:
            print("Batch producer task canceled.")

    if batch_consumer_task:
        batch_consumer_task.cancel()
        try:
            await batch_consumer_task
        except asyncio.CancelledError:
            print("Batch consumer task canceled.")

    async with AsyncSessionLocal() as session:  # Create a session to flush any remaining buffered data
        await flush_buffer(session)


# Include API routers if any
# from routers import some_router
# app.include_router(some_router.router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
