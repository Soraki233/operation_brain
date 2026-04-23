from rag.pasers.base_parser import BaseParser
import docx
from pathlib import Path
import zipfile


class DocxParser(BaseParser):
    def parse(self, file_path: str):
        file_path = Path(file_path)
        self.verification(file_path)
        doc = docx.Document(str(file_path))

        paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
        return {
            "file_path": str(file_path),
            "paragraph_count": len(paragraphs),
            "preview": paragraphs[:10],
            "table_count": len(doc.tables),
        }

    def verification(self, file_path: Path):
        # 检查文件是否存在
        if not file_path.exists():
            raise FileNotFoundError(f"文件不存在: {file_path}")

        # 检查文件扩展名是否为 .docx
        if file_path.suffix.lower() != ".docx":
            raise ValueError(f"不是 .docx 文件: {file_path}")

        # 检查文件是否为合法的 zip 文件（docx 本质为 zip 格式）
        if not zipfile.is_zipfile(file_path):
            raise ValueError(f"文件不是合法的 docx/zip 包: {file_path}")

        with zipfile.ZipFile(file_path, "r") as zf:
            # 获取 docx 包内所有文件名
            names = set(zf.namelist())
            # docx 文件必备的结构成员
            required = {"[Content_Types].xml", "_rels/.rels", "word/document.xml"}
            missing = required - names
            # 如果缺少必要的文件，则抛出异常
            if missing:
                raise ValueError(f"docx 结构不完整，缺少: {missing}")

            # 读取文档关系文件，以检测文档类型
            rels_xml = zf.read("_rels/.rels").decode("utf-8", errors="ignore")

            # 检查是否为 Strict Open XML 格式，该格式 python-docx 无法直接解析
            if (
                "http://purl.oclc.org/ooxml/officeDocument/relationships/officeDocument"
                in rels_xml
            ):
                raise ValueError(
                    "该文件是 Strict Open XML 格式，python-docx 可能无法直接解析。"
                    "请先用 Word/WPS/LibreOffice 另存为标准 .docx 后再导入。"
                )
