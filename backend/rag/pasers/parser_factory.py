
from rag.pasers.docx_parser import DocxParser



class ParserFactory:
    @staticmethod
    def get_parser(file_ext: str):
        file_ext = file_ext.lower()

        # if file_ext == ".pdf":
        #     return PDFParser()
        if file_ext == ".docx":
            return DocxParser()
        # if file_ext in [".xlsx", ".xls"]:
        #     return ExcelParser()
        # if file_ext == ".md":
        #     return MarkdownParser()
        # if file_ext == ".txt":
        #     return TxtParser()

        raise ValueError(f"暂不支持的文件类型: {file_ext}")