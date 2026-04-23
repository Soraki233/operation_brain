from fastapi import APIRouter
from schemas.request.users import (
    RegisterUserReqSchema,
    CreateUserRoleReqSchema,
    LoginUserReqSchema,
    RefreshAccessTokenReqSchema,
    LogoutReqSchema,
)
from service.user import UserService
from schemas.response.base import ApiResponse
from schemas.response.users import (
    RegisterUserResSchema,
    CreateUserRoleResSchema,
    LoginUserResSchema,
    GetUserInfoResSchema,
)
from core.response import success_response
from core.deps import get_current_user
from fastapi import Depends

user_router = APIRouter(prefix="/users", tags=["users"])


@user_router.get("/info", response_model=ApiResponse[GetUserInfoResSchema])
async def get_user_info(user: GetUserInfoResSchema = Depends(get_current_user)):
    user_service = UserService()
    user = await user_service.get_user_info(user)
    return success_response(user)


@user_router.post("/register", response_model=ApiResponse[RegisterUserResSchema])
async def register_user(register_user: RegisterUserReqSchema):
    user_service = UserService()
    user = await user_service.register_user(register_user)
    return success_response(user)


@user_router.post("/login", response_model=ApiResponse[LoginUserResSchema])
async def login_user(login_user: LoginUserReqSchema):
    user_service = UserService()
    user = await user_service.login_user(login_user)
    return success_response(user)


@user_router.post("/logout", response_model=ApiResponse[None])
async def logout(logout_req: LogoutReqSchema):
    user_service = UserService()
    await user_service.logout(logout_req.access_token)
    return success_response(None)

@user_router.post(
    "/refresh-access-token", response_model=ApiResponse[LoginUserResSchema]
)
async def refresh_access_token(refresh_token: RefreshAccessTokenReqSchema):
    user_service = UserService()
    user = await user_service.refresh_access_token(refresh_token.refresh_token)
    return success_response(user)


@user_router.post(
    "/create-user-role", response_model=ApiResponse[CreateUserRoleResSchema]
)
async def create_user_role(user_role: CreateUserRoleReqSchema):
    user_service = UserService()
    user_role = await user_service.create_user_role(user_role)
    return success_response(user_role)
