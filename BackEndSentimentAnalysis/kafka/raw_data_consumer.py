import json
from aiokafka import AIOKafkaConsumer
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from services.data_processor import preprocess_reddit, preprocess_twitter
from db.crud import buffer_and_write_raw_data, flush_buffer


async def raw_consume(session: AsyncSession):
    consumer = AIOKafkaConsumer(
        'redditSentiment', 'twitterPosts',
        bootstrap_servers='kafka1:9092,kafka2:9092',
        value_deserializer=lambda m: json.loads(m.decode('utf-8'))
    )
    await consumer.start()
    tasks = []  # Track all tasks
    try:
        async for msg in consumer:
            if msg.topic == 'redditSentiment':
                task = asyncio.create_task(preprocess_reddit(msg.value))
                task.add_done_callback(lambda t: handle_task(t, buffer_and_write_raw_data, msg.value, session))
                tasks.append(task)  # Manage task
            elif msg.topic == 'twitterPosts':
                task = asyncio.create_task(preprocess_twitter(msg.value))
                task.add_done_callback(lambda t: handle_task(t, buffer_and_write_raw_data, msg.value, session))
                tasks.append(task)  # Manage task
    finally:
        await consumer.stop()
        await flush_buffer(session)
        await asyncio.gather(*tasks)  # Ensure all tasks complete


def handle_task(task, func, data, session):
    """Handle results of a task and manage additional async operations."""
    try:
        result = task.result()  # Check for exceptions, this would re-raise any caught during the task's execution
        if result:  # Check if the task produced a valid result
            # If processing needs session and data, modify the function call
            additional_task = asyncio.create_task(func(session, [data]))  # Pass session and data as a list
            additional_task.add_done_callback(lambda t: handle_message(t))
        else:
            print("No result to process.")
    except Exception as e:
        print(f"Error processing or inserting data: {str(e)}")


def handle_message(task):
    """Handle results of additional asynchronous operations."""
    try:
        result = task.result()  # This will re-raise any exception that occurred
        print(f"Additional task completed with result: {result}")
    except Exception as e:
        print(f"Error in additional task: {str(e)}")