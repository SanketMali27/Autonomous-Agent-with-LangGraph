from app.api import app

import database.models
from database.db import create_tables

from auth.routes import router as auth_router

app.include_router(auth_router)
create_tables()