from fastapi import FastAPI
from api.user import user_router
from rag.pasers.docx_parser import DocxParser
from pathlib import Path
app = FastAPI()

app.include_router(user_router)


@app.get("/")
def test():
    current_file_path = Path(__file__).resolve()
    # 向上两级目录到达项目根目录 (根据你的项目结构调整)
    project_root = current_file_path.parent
    file_path = str(project_root / "storage" / "第二章 发电机运行规程.docx")
    print(file_path)
    parser = DocxParser()
    result = parser.parse(file_path)
    # print(result)
