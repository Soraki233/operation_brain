from sqlalchemy.orm import Mapped, mapped_column
from session.session import BaseModel
from sqlalchemy import String, SmallInteger, Integer


class UsersModel(BaseModel):
    __tablename__ = "users"
    username: Mapped[str] = mapped_column(String(32), comment="用户名", nullable=False)
    phone: Mapped[str] = mapped_column(
        String(11), comment="手机号", nullable=False, unique=True
    )
    hash_password: Mapped[str] = mapped_column(
        String(128), comment="密码", nullable=False
    )
    token_version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    role_id: Mapped[str] = mapped_column(String(100), comment="角色ID", nullable=False)
    is_active: Mapped[int] = mapped_column(
        SmallInteger, default=1, comment="是否激活(1: 正常, 0: 禁用)", nullable=False
    )


class UsersRoleModel(BaseModel):
    __tablename__ = "users_role"
    key: Mapped[str] = mapped_column(
        String(100), comment="角色键", nullable=False, unique=True
    )
    name: Mapped[str] = mapped_column(
        String(100), comment="角色名称", nullable=False, unique=True
    )
