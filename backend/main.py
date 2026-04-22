from fastapi import FastAPI
from core.config import config
from api.user import user_router

app = FastAPI()

app.include_router(user_router)


@app.get("/")
def read_root():
    print(config.app.APP_NAME)
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: str | None = None):
    return {"item_id": item_id, "q": q}
