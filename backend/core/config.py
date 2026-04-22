from core.settings.app import APPSettings
from functools import lru_cache
from core.settings.db import DBSettings
# 汇总所有配置
class Config:
    def __init__(self):
        self.app = APPSettings()
        self.db = DBSettings()

# 初始化单例模式的配置
@lru_cache()
def get_config() -> Config:
    return Config()

# 获取单例模式的配置
config = get_config()
