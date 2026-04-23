from abc import ABC, abstractmethod
from schemas.service.parser import ParsedDocument


# 抽象类，定义了解析器的基本接口
class BaseParser(ABC):
    # 抽象方法，定义了解析器的基本接口
    @abstractmethod
    # 解析器的基本接口
    def parse(self, file_path: str) -> ParsedDocument:
        # 抛出异常，表示解析器的基本接口没有实现
        raise NotImplementedError
