from core.config import config
from datetime import datetime, timezone, timedelta
from jose import jwt
import uuid


def create_access_token(
    user_id: str,
    username: str,
    role_id: str,
    sid: str,
    token_version: int,
) -> tuple[str, str]:
    # 当前时间
    now = datetime.now(timezone.utc)
    # 过期时间
    expire = now + timedelta(minutes=config.app.ACCESS_TOKEN_EXPIRE_MINUTES)
    jti = str(uuid.uuid4())
    # 载荷
    payload = {
        # 用户ID
        "sub": user_id,
        # 用户名
        "username": username,
        # 角色代码
        "role_id": role_id,
        # 会话ID
        "sid": sid,
        # 令牌ID
        "jti": jti,
        # 令牌版本
        "token_version": token_version,
        # 令牌类型
        "type": "access",
        # 过期时间
        "exp": int(expire.timestamp()),
        # 创建时间
        "iat": int(now.timestamp()),
    }
    # 编码
    return jwt.encode(
        payload, config.app.JWT_SECRET_KEY, algorithm=config.app.JWT_ALGORITHM
    ), jti


def create_refresh_token(
    user_id: str,
    username: str,
    role_id: str,
    sid: str,
    token_version: int,
) -> tuple[str, str]:
    # 当前时间
    now = datetime.now(timezone.utc)
    # 过期时间
    expire = now + timedelta(days=config.app.REFRESH_TOKEN_EXPIRE_DAYS)
    jti = str(uuid.uuid4())
    # 载荷
    payload = {
        # 用户ID
        "sub": user_id,
        # 用户名
        "username": username,
        # 角色代码
        "role_id": role_id,
        # 会话ID
        "sid": sid,
        # 令牌ID
        "jti": jti,
        # 令牌版本
        "token_version": token_version,
        # 令牌类型
        "type": "refresh",
        # 过期时间
        "exp": int(expire.timestamp()),
        # 创建时间
        "iat": int(now.timestamp()),
    }
    # 编码
    return jwt.encode(
        payload, config.app.JWT_SECRET_KEY, algorithm=config.app.JWT_ALGORITHM
    ), jti


def decode_token(token: str) -> dict:

    # 解码
    return jwt.decode(
        # 令牌
        token,
        # 密钥
        config.app.JWT_SECRET_KEY,
        # 算法
        algorithms=[config.app.JWT_ALGORITHM],
    )


def decode_token_ignore_exp(token: str) -> dict:
    return jwt.decode(
        token,
        config.app.JWT_SECRET_KEY,
        algorithms=[config.app.JWT_ALGORITHM],
        options={"verify_exp": False},
    )
