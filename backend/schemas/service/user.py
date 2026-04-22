from pydantic import BaseModel
from datetime import datetime


class GetUserInfoResSchema(BaseModel):
    id: str
    username: str
    phone: str
    role_id: str
    is_active: int
    created_at: datetime
    updated_at: datetime
    current_token_payload: dict

class UserSchema(BaseModel):
    id: str
    username: str
    phone: str
    role_id: str
    is_active: int
    created_at: datetime
    updated_at: datetime