from session.redis import redis_client
from core.security import get_password_hash
from repo.user import UserRepo
from session.models.users import UsersModel, UsersRoleModel
from schemas.request.users import (
    RegisterUserReqSchema,
    CreateUserRoleReqSchema,
    LoginUserReqSchema,
)
from fastapi import HTTPException
from core.security import verify_password
from core.jwt import (
    create_access_token,
    create_refresh_token,
    decode_token,
    decode_token_ignore_exp,
)
import uuid
from core.deps import get_current_user
from fastapi import Depends
from schemas.service.user import GetUserInfoResSchema, UserSchema
from core.config import config
import time
from jose import JWTError


class UserService:
    def __init__(self):
        pass

    async def register_user(self, register_user: RegisterUserReqSchema):
        user_repo = UserRepo()
        user_exist = await user_repo.get_user_by_phone(register_user.phone)
        if user_exist:
            raise HTTPException(status_code=400, detail="手机号已注册")

        # 默认角色的角色key为staff，角色名称为员工，如果没有则创建一个
        user_role = await user_repo.get_user_role_by_key("STAFF")
        if not user_role:
            user_role = UsersRoleModel(
                key="STAFF",
                name="员工",
            )
            await user_repo.create_user_role(user_role)

        user = UsersModel(
            username=register_user.username,
            phone=register_user.phone,
            hash_password=get_password_hash(register_user.password),
            role_id=user_role.id,
            is_active=1,
        )
        user_res = await user_repo.create_user(user)
        return user_res

    async def login_user(self, login_user: LoginUserReqSchema):
        user_repo = UserRepo()
        user: UsersModel = await user_repo.get_user_by_phone(login_user.phone)
        if not user:
            raise HTTPException(status_code=400, detail="用户不存在")
        if not verify_password(login_user.password, user.hash_password):
            raise HTTPException(status_code=400, detail="密码错误")
        if not await user_repo.get_user_is_active(user.id):
            raise HTTPException(status_code=400, detail="用户已禁用")
        if await user_repo.get_user_is_deleted(user.id):
            raise HTTPException(status_code=400, detail="用户已删除")

        user_role: UsersRoleModel = await user_repo.get_user_role_by_id(user.role_id)
        if not user_role:
            raise HTTPException(status_code=400, detail="该用户角色不存在")
        # 创建访问令牌
        sid = str(uuid.uuid4())
        acess_token, acess_jti = create_access_token(
            user.id,
            user.username,
            user_role.id,
            sid,
            user.token_version,
        )
        refresh_token, refresh_jti = create_refresh_token(
            user.id,
            user.username,
            user_role.id,
            sid,
            user.token_version,
        )
        await redis_client.hset(
            f"auth:refresh:{sid}",
            mapping={
                "user_id": user.id,
                "username": user.username,
                "type": "refresh",
                "role_id": user_role.id,
                "refresh_jti": refresh_jti,
                "token_version": str(user.token_version),
            },
        )
        await redis_client.expire(
            f"auth:refresh:{sid}",
            time=config.app.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
        )
        return {
            "access_token": acess_token,
            "refresh_token": refresh_token,
            "user": UserSchema.model_validate(user, from_attributes=True),
        }

    async def refresh_access_token(self, refresh_token):
        user_repo = UserRepo()

        client_token = decode_token(refresh_token)
        if not client_token:
            raise HTTPException(status_code=400, detail="刷新令牌已过期")
        user_id = client_token["sub"]
        sid = client_token["sid"]
        key = f"auth:refresh:{sid}"
        refresh_token_data = await redis_client.hgetall(key)
        if not refresh_token_data:
            raise HTTPException(status_code=400, detail="刷新令牌不存在")
        if refresh_token_data["user_id"] != user_id:
            raise HTTPException(status_code=400, detail="用户不存在")
        if not refresh_token_data["type"] == "refresh":
            raise HTTPException(status_code=400, detail="刷新令牌类型错误")
        if refresh_token_data["token_version"] != str(client_token["token_version"]):
            raise HTTPException(status_code=400, detail="令牌版本已失效")
        print(refresh_token_data["refresh_jti"], client_token["jti"])
        if refresh_token_data["refresh_jti"] != client_token["jti"]:
            raise HTTPException(status_code=400, detail="refresh_jti不一致")
        user = await user_repo.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=400, detail="用户不存在")
        if not await user_repo.get_user_is_active(user.id):
            raise HTTPException(status_code=400, detail="用户已禁用")
        if await user_repo.get_user_is_deleted(user.id):
            raise HTTPException(status_code=400, detail="用户已删除")
        access_token, access_jti = create_access_token(
            user.id,
            user.username,
            user.role_id,
            sid,
            user.token_version,
        )
        return {
            "access_token": access_token,
            "user": UserSchema.model_validate(user, from_attributes=True),
            "refresh_token": refresh_token,
        }

    async def logout(self, access_token: str) -> None:
        try:
            access_payload = decode_token_ignore_exp(access_token)
        except JWTError:
            # 非法 token，按你的业务决定：
            # 1. 直接返回，保持 logout 幂等
            # 2. 抛 401
            return

        sid = access_payload.get("sid")
        jti = access_payload.get("jti")
        exp = access_payload.get("exp")

        now = int(time.time())

        # access token 如果还没过期，再加入黑名单
        if jti and exp and exp > now:
            ttl = exp - now
            await redis_client.setex(f"auth:blacklist:{jti}", ttl, "1")

        # 当前会话的 refresh session 删除
        if sid:
            await redis_client.delete(f"auth:refresh:{sid}")

    async def create_user_role(self, user_role: CreateUserRoleReqSchema):
        user_repo = UserRepo()
        user_role_key_exist = await user_repo.get_user_role_by_key(user_role.key)
        if user_role_key_exist:
            raise HTTPException(status_code=400, detail="角色键已存在")
        user_role_name_exist = await user_repo.get_user_role_by_name(user_role.name)
        if user_role_name_exist:
            raise HTTPException(status_code=400, detail="角色名称已存在")
        user_role_res = await user_repo.create_user_role(user_role)
        return user_role_res

    async def get_user_info(
        self, user: GetUserInfoResSchema = Depends(get_current_user)
    ) -> GetUserInfoResSchema:
        return user
