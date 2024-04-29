# db/database.py
from databases import Database
import os

# Initialize asynchronous database connection
DATABASE_URL = os.getenv("DATABASE_URL")
database = Database(DATABASE_URL)
