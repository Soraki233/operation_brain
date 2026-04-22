from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from session.models.users import UsersModel
from core.jwt import decode_token
from repo.user import UserRepo
from fastapi import HTTPException
from session.redis import redis_client
from jose import JWTError


security_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
) -> UsersModel:
    # 获取token并解码
    token = credentials.credentials
    try:
        decoded_token = decode_token(token)
    except JWTError as e:
        raise HTTPException(status_code=401, detail="令牌已过期") from e
    # 如果token解码失败，则返回401
    if not decoded_token:
        raise HTTPException(status_code=401, detail="Invalid token")
    # 获取用户ID和tokenID并检查是否在黑名单中
    user_id = decoded_token["sub"]
    jti = decoded_token["jti"]
    blacklist_key = f"auth:blacklist:{jti}"
    # 如果tokenID在黑名单中，则返回401
    if await redis_client.get(blacklist_key):
        raise HTTPException(status_code=401, detail="登录失效")
    # 获取用户信息
    user_repo = UserRepo()
    user = await user_repo.get_user_by_id(user_id)
    # 如果用户不存在，则返回401
    if not user:
        raise HTTPException(status_code=401, detail="用户不存在")
    if user.is_deleted == 1:
        raise HTTPException(status_code=401, detail="用户已删除")
    if user.is_active == 0:
        raise HTTPException(status_code=401, detail="用户已禁用")
    if user.token_version != decoded_token["token_version"]:
        raise HTTPException(status_code=401, detail="令牌版本已失效")

    # 将解码后的token信息赋值给用户
    user.current_token_payload = decoded_token
    return user
