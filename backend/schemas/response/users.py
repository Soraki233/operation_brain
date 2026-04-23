from pydantic import BaseModel
from datetime import datetime
from schemas.service.users import UserSchema


class RegisterUserResSchema(BaseModel):
    id: str
    username: str
    phone: str
    role_id: str
    is_active: int
    created_at: datetime
    updated_at: datetime


class CreateUserRoleResSchema(BaseModel):
    id: str
    key: str
    name: str
    created_at: datetime
    updated_at: datetime


class LoginUserResSchema(BaseModel):
    access_token: str
    refresh_token: str
    user: UserSchema


class GetUserInfoResSchema(BaseModel):
    id: str
    username: str
    phone: str
    role_id: str
    is_active: int
    created_at: datetime
    updated_at: datetime
    current_token_payload: dict
