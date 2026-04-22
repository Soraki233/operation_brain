from pydantic import BaseModel, Field


class RegisterUserReqSchema(BaseModel):
    phone: str = Field(..., description="手机号", pattern=r"^1[3-9]\d{9}$")
    password: str = Field(..., description="密码", min_length=6, max_length=12)
    username: str = Field(..., description="用户名", min_length=3, max_length=32)


class CreateUserRoleReqSchema(BaseModel):
    key: str = Field(..., description="角色键", min_length=3, max_length=100)
    name: str = Field(..., description="角色名称", min_length=3, max_length=100)


class LoginUserReqSchema(BaseModel):
    phone: str = Field(..., description="手机号", pattern=r"^1[3-9]\d{9}$")
    password: str = Field(..., description="密码", min_length=6, max_length=12)


class RefreshAccessTokenReqSchema(BaseModel):
    refresh_token: str = Field(..., description="刷新令牌")

class LogoutReqSchema(BaseModel):
    access_token: str = Field(..., description="访问令牌")