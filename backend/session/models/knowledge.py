from session.session import BaseModel
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, SmallInteger, Integer, Text, BigInteger
from sqlalchemy.dialects.postgresql import JSONB


class KnowledgeBaseModel(BaseModel):
    __tablename__ = "knowledge_base"
    name: Mapped[str] = mapped_column(String(100), comment="知识库名称", nullable=False)
    description: Mapped[str | None] = mapped_column(
        String(255), comment="知识库描述", nullable=True
    )
    scope: Mapped[str] = mapped_column(String(20), comment="知识库范围", nullable=False)
    owner_id: Mapped[str | None] = mapped_column(
        String(100), comment="知识库所有者ID", nullable=True
    )
    is_active: Mapped[int] = mapped_column(
        SmallInteger, default=1, comment="是否激活(1: 正常, 0: 禁用)", nullable=False
    )


class KnowledgeFolderModel(BaseModel):
    __tablename__ = "knowledge_folder"
    name: Mapped[str] = mapped_column(String(100), comment="文件夹名称", nullable=False)
    description: Mapped[str | None] = mapped_column(
        String(255), comment="文件夹描述", nullable=True
    )
    parent_id: Mapped[str] = mapped_column(
        String(100), comment="父文件夹ID", nullable=True, index=True
    )
    path: Mapped[str] = mapped_column(
        String(1000), comment="文件夹完整路径", nullable=False, index=True
    )
    kb_id: Mapped[str] = mapped_column(
        String(100), comment="知识库ID", nullable=False, index=True
    )
    depth: Mapped[int] = mapped_column(
        Integer, default=0, comment="深度", nullable=False
    )
    sort_order: Mapped[int] = mapped_column(
        Integer, default=0, comment="排序序号", nullable=False
    )


class KnowledgeFileModel(BaseModel):
    __tablename__ = "knowledge_file"
    name: Mapped[str] = mapped_column(String(100), comment="文件名称", nullable=False)
    description: Mapped[str | None] = mapped_column(
        String(255), comment="文件描述", nullable=True
    )
    folder_id: Mapped[str] = mapped_column(
        String(100), comment="文件夹ID", nullable=False, index=True
    )
    kb_id: Mapped[str] = mapped_column(
        String(100), comment="知识库ID", nullable=False, index=True
    )
    file_path: Mapped[str] = mapped_column(
        String(255), comment="文件路径", nullable=False
    )
    file_size: Mapped[int] = mapped_column(
        BigInteger, default=0, comment="文件大小", nullable=False
    )
    file_type: Mapped[str] = mapped_column(
        String(100), comment="文件类型", nullable=False
    )
    file_ext: Mapped[str] = mapped_column(
        String(20), comment="文件扩展名", nullable=False
    )
    file_hash: Mapped[str] = mapped_column(
        String(128), comment="文件哈希", nullable=False
    )
    mime_type: Mapped[str] = mapped_column(
        String(100), comment="MIME类型", nullable=False
    )
    summary: Mapped[str | None] = mapped_column(
        Text(length=None), comment="文件摘要", nullable=True
    )


class KnowledgeFileChunkModel(BaseModel):
    __tablename__ = "knowledge_file_chunk"
    file_id: Mapped[str] = mapped_column(
        String(100), comment="文件ID", nullable=False, index=True
    )
    chunk_index: Mapped[int] = mapped_column(
        Integer, default=0, comment="分块索引", nullable=False
    )
    content: Mapped[str] = mapped_column(
        Text(length=None), comment="分块内容", nullable=False
    )
    chunk_tokens: Mapped[int] = mapped_column(
        Integer, default=0, comment="分块Token数", nullable=False
    )
    vector_status: Mapped[str] = mapped_column(
        String(32), comment="向量状态", nullable=False
    )
    error_message: Mapped[str | None] = mapped_column(
        String(255), comment="错误信息", nullable=True
    )
    meta_json: Mapped[dict] = mapped_column(JSONB, comment="元数据", nullable=True)
