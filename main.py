from app.api import app

import database.models
from database.db import create_tables


create_tables()