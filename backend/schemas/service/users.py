from pydantic import BaseModel
from datetime import datetime


class UserSchema(BaseModel):
    id: str
    username: str
    phone: str
    role_id: str
    is_active: int
    created_at: datetime
    updated_at: datetime