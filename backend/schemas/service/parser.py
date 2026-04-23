from pydantic import BaseModel, Field
from typing import Any, Optional


class ParsedBlock(BaseModel):
    block_id: str
    block_type: str  # heading / paragraph / table / row / list / note
    text: str
    page: Optional[int] = None
    sheet_name: Optional[str] = None
    section_title: Optional[str] = None
    table_name: Optional[str] = None
    row_index: Optional[int] = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class ParsedDocument(BaseModel):
    file_name: str
    file_ext: str
    parser_type: str
    title: Optional[str] = None
    blocks: list[ParsedBlock] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)