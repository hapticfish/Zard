# app/services/data_processor.py

from db.queue_manager import enqueue_data_for_db


async def preprocess_reddit(data):
    """
    Preprocess Reddit data.
    Assume data is a dictionary containing necessary Reddit post attributes.
    """
    # Example preprocessing might include cleaning text, removing emojis, etc.
    cleaned_text = data['content'].replace('emoji', '')  # Simplified example
    data['content'] = cleaned_text
    # Enqueue the cleaned data for database insertion/updating
    # Further processing such as tokenization or normalization could be added here
    await enqueue_data_for_db('async_insert_or_update_preprocessed_data', data)
    return data


async def preprocess_twitter(data):
    """
    Preprocess Twitter data.
    Assume data is a dictionary containing necessary Tweet attributes.
    """
    # Twitter data might require different preprocessing, such as handling mentions
    cleaned_text = data['content'].replace('@mention', '')  # Simplified example
    data['content'] = cleaned_text
    # Enqueue the cleaned data for database insertion/updating
    # Additional Twitter-specific processing
    await enqueue_data_for_db('async_insert_or_update_preprocessed_data', data)
    return data
