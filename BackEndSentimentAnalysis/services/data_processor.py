# app/services/data_processor.py
from db.crud import create_sentiment_result
from db.database import database

async def process_sentiment_data(data):
    # Assuming data is already formatted correctly
    await create_sentiment_result(database, data)
