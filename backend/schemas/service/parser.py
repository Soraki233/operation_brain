from pydantic import BaseModel
from uuid import UUID

class ParsedBlock(BaseModel):
    block_id: str
    block_head: str
    block_content: list[str]
    block_level: int
    block_index: int
