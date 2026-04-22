from sqlalchemy import String, DateTime, SmallInteger
from sqlalchemy.orm import DeclarativeBase, mapped_column, Mapped
import uuid
from datetime import datetime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.asyncio import create_async_engine
from core.config import config
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker

Base = declarative_base()


class Base(DeclarativeBase):
    pass


class BaseModel(Base):
    # __abstract__ = True 表示该 SQLAlchemy 模型（BaseModel）是抽象基类，
    # 不会在数据库中创建对应表，只用于被其他具体模型继承。这样可以统一定义主键、时间等通用字段。
    __abstract__ = True

    id: Mapped[str] = mapped_column(
        String(100), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now, nullable=False, comment="创建时间"
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now,
        onupdate=datetime.now,
        nullable=False,
        comment="更新时间",
    )
    is_deleted: Mapped[int] = mapped_column(
        SmallInteger, default=0, nullable=False, comment="是否删除(0: 正常, 1: 删除)"
    )


engine = create_async_engine(
    config.db.DATABASE_URL,
    echo=True,  # 连接池大小（默认是5个）
    pool_size=10,
    # 允许连接池最大的连接数（默认是10个）
    max_overflow=20,
    # 获得连接超时时间（默认是30s）
    pool_timeout=10,
    # 连接回收时间（默认是-1，代表永不回收）
    pool_recycle=3600,
    # 连接前是否预检查（默认为False）
    pool_pre_ping=True,
)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=True,
)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session