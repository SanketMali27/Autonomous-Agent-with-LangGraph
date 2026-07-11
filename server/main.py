from server.app.api import app

import server.database.models
from server.database.db import create_tables


create_tables()