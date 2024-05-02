from asyncio import Queue
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker
import crud

db_queue = Queue()


async def enqueue_data_for_db(operation, data):
    """
    Enqueue data with the specified operation to be processed asynchronously by the database consumer.
    Operation could be a function name (string) or a direct function reference.
    """
    await db_queue.put((operation, data))


async def db_consumer(engine):
    """
    Consumer coroutine that dynamically handles different database operations using an async session.
    """
    async with sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)() as session:
        while True:
            operation, data = await db_queue.get()
            try:
                if callable(operation):
                    await operation(session, data)
                elif isinstance(operation, str):
                    # Using a predefined dictionary to map operation names to functions
                    func = crud.OPERATIONS.get(operation, None)
                    if func:
                        await func(session, data)
                    else:
                        print(f"No operation found for {operation}")
                await session.commit()
            except Exception as e:
                await session.rollback()
                print(f"Error handling database operation: {e}")
            finally:
                db_queue.task_done()
