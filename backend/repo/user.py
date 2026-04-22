from session.models.users import UsersModel, UsersRoleModel
from session.session import AsyncSessionLocal
from sqlalchemy import select


class UserRepo:
    def __init__(self):
        self.session = AsyncSessionLocal()

    async def create_user(self, user: UsersModel):
        self.session.add(user)
        await self.session.commit()
        return user

    async def get_user_by_phone(self, phone: str):
        result = await self.session.execute(
            select(UsersModel).where(UsersModel.phone == phone)
        )
        return result.scalar_one_or_none()

    async def get_user_by_id(self, id: str):
        result = await self.session.execute(
            select(UsersModel).where(UsersModel.id == id)
        )
        return result.scalar_one_or_none()

    async def get_user_is_active(self, id: str):
        result = await self.session.execute(
            select(UsersModel.is_active).where(UsersModel.id == id)
        )
        return result.scalar_one_or_none()

    async def get_user_is_deleted(self, id: str):
        result = await self.session.execute(
            select(UsersModel.is_deleted).where(UsersModel.id == id)
        )
        return result.scalar_one_or_none()

    async def get_user_role_by_key(self, key: str):
        result = await self.session.execute(
            select(UsersRoleModel).where(UsersRoleModel.key == key)
        )
        return result.scalar_one_or_none()

    async def get_user_role_by_id(self, id: str):
        result = await self.session.execute(
            select(UsersRoleModel).where(UsersRoleModel.id == id)
        )
        return result.scalar_one_or_none()

    async def get_user_role_by_name(self, name: str):
        result = await self.session.execute(
            select(UsersRoleModel).where(UsersRoleModel.name == name)
        )
        return result.scalar_one_or_none()

    async def create_user_role(self, user_role: UsersRoleModel):
        self.session.add(user_role)
        await self.session.commit()
        return user_role
