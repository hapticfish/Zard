# db/models.py
from sqlalchemy import create_engine, Column, Integer, String, Text, Float, DateTime, ARRAY, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


class SentimentResult(Base):
    __tablename__ = 'sentiment_results'
    result_id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, index=True)
    time_frame = Column(DateTime)
    sentiment_score = Column(Float)
    analysis_time = Column(DateTime)
    calculation_duration = Column(Float)
    request_count = Column(Integer)
    topic_keywords = Column(String)
    sentiment_trend = Column(String)


class PreprocessedData(Base):
    __tablename__ = 'preprocessed_data'
    preprocessed_id = Column(Integer, primary_key=True, autoincrement=True)
    source_id = Column(String, index=True)
    content = Column(Text)
    title = Column(String)
    keywords = Column(ARRAY(String))
    post_score = Column(Float)
    num_comments = Column(Integer)
    url = Column(Text)
    platform_creation_time = Column(DateTime)
    preprocessing_time = Column(DateTime)
    batch_ids = Column(ARRAY(String))
    language = Column(String)


class RawData(Base):
    __tablename__ = 'raw_data'
    data_id = Column(Integer, primary_key=True, autoincrement=True)
    source_id = Column(Integer, index=True)  # Assuming source_id is used to link with JS side
    title = Column(String)
    content = Column(String)
    post_score = Column(Float)

    # Other columns remain defined but are not typically written to directly from this part of the app


class PreprocessedData:
    pass