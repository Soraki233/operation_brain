from typing import Any
from schemas.response.base import ApiResponse


def success_response(
    data: Any = None,
    message: str = "success",
    code: int = 200
) -> ApiResponse[Any]:
    return ApiResponse(code=code, message=message, data=data)


def error_response(
    message: str = "error",
    code: int = 400,
    data: Any = None
) -> ApiResponse[Any]:
    return ApiResponse(code=code, message=message, data=data)