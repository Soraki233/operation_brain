import uuid
import docx
from pathlib import Path
import zipfile
from docx.text.paragraph import Paragraph
from docx.table import Table
from typing import List
import re
from schemas.service.parser import ParsedBlock

HEADING_RE = re.compile(r"^Heading\s+([1-9])$", re.I)


class DocxParser:
    def parse(self, file_path: str):
        file_path = Path(file_path)
        # 验证文件是否为合法的 docx 文件
        self.verification(file_path)
        # 读取文档
        doc = docx.Document(str(file_path))
        content_list = list(doc.iter_inner_content())
        parsed_blocks: List[ParsedBlock] = []
        # 遍历文档内容
        # 如果拿到的是表格，则需要拿到前一个内容作为表格的标题，并且删除前一个内容
        for index, content in enumerate(content_list):
            if self.get_heading_level(content) is not None:
                # 如果它是标题，则需要创建一个内容块
                parsed_blocks.append(
                    ParsedBlock(
                        block_index=len(parsed_blocks),
                        block_id=str(uuid.uuid4()),
                        block_head=content.text.strip(),
                        block_level=self.get_heading_level(content),
                        block_content=[],
                    )
                )
            else:
                # 判断它是什么内容
                if isinstance(content, Paragraph):
                    if content.text.strip() != "":
                        parsed_blocks[-1].block_content.append(
                            f"<paragraph>{self.analyze_paragraph(content)}</paragraph>"
                        )
                elif isinstance(content, Table):
                    parsed_blocks[-1].block_content.append(
                        f"<table>{self.analyze_table(content)}</table>"
                    )
                else:
                    raise ValueError(f"不支持的内容类型: {type(content)}")
        print(parsed_blocks)

    # 分析段落
    def analyze_paragraph(self, paragraph: Paragraph):
        return paragraph.text.strip()

    # 分析表格
    def analyze_table(self, table: Table):
        table_data = []
        # 遍历表格的每一行
        for row_index, row in enumerate(table.rows):
            row_data = ""

            # 每一行的每个单元格
            for cell_index, cell in enumerate(row.cells):
                row_data += cell.text.strip() + " "
            table_data.append(row_data)
        return table_data

    def get_heading_level(self, paragraph: Paragraph):
        """
        返回:
        - 0: Title
        - 1~9: Heading 1~9
        - None: 非标题
        """
        style = paragraph.style
        if style is None:
            return None

        # 先看当前样式名
        style_name = (style.name or "").strip()
        if style_name == "Title":
            return 0

        m = HEADING_RE.match(style_name)
        if m:
            return int(m.group(1))

        # 如果是自定义样式，尝试沿 base_style 向上找
        base = getattr(style, "base_style", None)
        while base is not None:
            base_name = (base.name or "").strip()
            if base_name == "Title":
                return 0
            m = HEADING_RE.match(base_name)
            if m:
                return int(m.group(1))
            base = getattr(base, "base_style", None)

        return None

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
