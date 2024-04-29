# db/crud.py
from databases import Database
from packaging.metadata import Metadata
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import asyncio

from .models import RawData
from .models import SentimentResult
from sqlalchemy import insert, update, select

BUFFER = []
BUFFER_LIMIT = 100

async def create_sentiment_result(database: Database, data):
    query = SentimentResult.insert().values(**data)
    await database.execute(query)

async def async_insert_or_update_raw_data(session: AsyncSession, data):
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

async def buffer_and_write_metadata(session: AsyncSession, data):
    """
    Buffer the data and write to the database when the buffer limit is reached.
    """
    BUFFER.extend(data)
    if len(BUFFER) >= BUFFER_LIMIT:
        await async_insert_or_update_raw_data(session, BUFFER)
        BUFFER.clear()  # Clear buffer after writing

# Utility function to ensure any remaining buffered data is written to the database
async def flush_buffer(session: AsyncSession):
    if BUFFER:
        await async_insert_or_update_raw_data(session, BUFFER)
        BUFFER.clear()