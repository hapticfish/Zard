# db/crud.py
from databases import Database
from sqlalchemy.ext.asyncio import AsyncSession
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from .models import SentimentResult, RawData, PreprocessedData
from sqlalchemy import insert, update, select, Session

BUFFER = []
BUFFER_LIMIT = 100


"""
#todo implament writing sentiment results data to the database (might need to find out how long anaylsys
#todo takes to see if quising coroutine nonblocking queue's are nessiary action
-see if anyother database writes can use the nonblockign queue feature
-make sure that all functions and streams are started at start up
-start implamenting senti design and cleaning and data preping
-?should the results from senti be served imidiatly back to javascript or quesryd from database to javascript?
-

"""


async def async_insert_sentiment_results(session: AsyncSession, data):
    query = SentimentResult.insert().values(**data)
    await session.execute(insert(SentimentResult).values(**data))


async def async_insert_or_update_preprocessed_data(session: AsyncSession, data):
    """
    Asynchronously checks for existing preprocessed data entries by source_id,
    updates if existing, or inserts if new.
    Assumes `data` is a list of dictionaries.
    """
    async with session.begin():
        for item in data:
            # Check if an entry with the same source_id already exists
            stmt = select(PreprocessedData).where(PreprocessedData.source_id == item['source_id'])
            result = await session.execute(stmt)
            existing_record = result.scalar()

            if existing_record:
                # Update the existing record if found
                await session.execute(
                    update(PreprocessedData).
                    where(PreprocessedData.source_id == item['source_id']).
                    values(
                        content=item['content'],
                        title=item['title'],
                        keywords=item.get('keywords', []),
                        post_score=item['post_score'],
                        num_comments=item['num_comments'],
                        url=item['url'],
                        platform_creation_time=item['platform_creation_time'],
                        preprocessing_time=item['preprocessing_time'],
                        batch_ids=item.get('batch_ids', []),
                        language=item.get('language', 'undefined')  # Defaulting language if not provided
                    )
                )
            else:
                # Insert new record if not found
                await session.execute(insert(PreprocessedData).values(**item))


async def async_insert_raw_data(session: AsyncSession, data):
    """
    Async version to insert new or update existing raw data entry based on source_id.
    This function assumes `data` is a list of dictionaries.
    """
    async with session.begin():
        for item in data:
            stmt = select(RawData).where(RawData.source_id == item['source_id'])
            result = await session.execute(stmt)
            existing_record = result.scalar()

            if existing_record:
                # Update if exists
                await session.execute(
                    update(RawData).
                    where(RawData.source_id == item['source_id']).
                    values(title=item['title'], content=item['content'], post_score=item['post_score'])
                )
            else:
                # Insert if not exists
                await session.execute(insert(RawData).values(**item))


async def buffer_and_write_raw_data(session: AsyncSession, data):
    """
    Buffer the data and write to the database when the buffer limit is reached.
    """
    BUFFER.extend(data)
    if len(BUFFER) >= BUFFER_LIMIT:
        await async_insert_raw_data(session, BUFFER)
        BUFFER.clear()  # Clear buffer after writing


# Utility function to ensure any remaining buffered data is written to the database
async def flush_buffer(session: AsyncSession):
    if BUFFER:
        await async_insert_raw_data(session, BUFFER)
        BUFFER.clear()


OPERATIONS = {
    'insert_or_update_preprocessed_data': async_insert_or_update_preprocessed_data,
    'insert_raw_data': async_insert_raw_data,
    'flush_buffer': flush_buffer
}