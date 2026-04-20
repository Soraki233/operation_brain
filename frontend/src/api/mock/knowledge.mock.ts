import type {
  CreateFolderPayload,
  DeleteNodePayload,
  KbFile,
  KbNode,
  KbScope,
  ListFilesQuery,
  RenameNodePayload,
  UploadFilePayload,
} from '@/types/knowledge'
import { getFileKindByName } from '@/utils/fileIcon'
import type { PageResult } from '@/types/common'

function uid(prefix = 'id'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function delay<T>(value: T, ms = 280): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

function now(offset = 0): string {
  return new Date(Date.now() + offset).toISOString()
}

// ---------- Seed data ----------
const personalRoot: KbNode = {
  id: 'kb-personal-root',
  parentId: null,
  name: '个人知识库',
  type: 'library',
  scope: 'personal',
  fileCount: 14,
  createdAt: now(-86400000 * 30),
  updatedAt: now(),
  children: [
    {
      id: 'kb-p-1',
      parentId: 'kb-personal-root',
      name: '值班参考',
      type: 'folder',
      scope: 'personal',
      fileCount: 6,
      createdAt: now(-86400000 * 20),
      updatedAt: now(-86400000),
      children: [
        {
          id: 'kb-p-1-1',
          parentId: 'kb-p-1',
          name: '常用处置卡',
          type: 'folder',
          scope: 'personal',
          fileCount: 4,
          createdAt: now(-86400000 * 15),
          updatedAt: now(-86400000),
        },
        {
          id: 'kb-p-1-2',
          parentId: 'kb-p-1',
          name: '交接班模板',
          type: 'folder',
          scope: 'personal',
          fileCount: 2,
          createdAt: now(-86400000 * 14),
          updatedAt: now(-86400000),
        },
      ],
    },
    {
      id: 'kb-p-2',
      parentId: 'kb-personal-root',
      name: '培训与考核',
      type: 'folder',
      scope: 'personal',
      fileCount: 5,
      createdAt: now(-86400000 * 18),
      updatedAt: now(-86400000),
    },
    {
      id: 'kb-p-3',
      parentId: 'kb-personal-root',
      name: '个人复盘',
      type: 'folder',
      scope: 'personal',
      fileCount: 3,
      createdAt: now(-86400000 * 10),
      updatedAt: now(-86400000),
    },
  ],
}

const sharedRoot: KbNode = {
  id: 'kb-shared-root',
  parentId: null,
  name: '全厂知识库',
  type: 'library',
  scope: 'shared',
  fileCount: 58,
  createdAt: now(-86400000 * 180),
  updatedAt: now(),
  children: [
    {
      id: 'kb-s-1',
      parentId: 'kb-shared-root',
      name: '运行规程',
      type: 'folder',
      scope: 'shared',
      fileCount: 24,
      createdAt: now(-86400000 * 150),
      updatedAt: now(-86400000),
      children: [
        {
          id: 'kb-s-1-1',
          parentId: 'kb-s-1',
          name: '焚烧炉系统',
          type: 'folder',
          scope: 'shared',
          fileCount: 6,
          createdAt: now(-86400000 * 140),
          updatedAt: now(-86400000),
        },
        {
          id: 'kb-s-1-2',
          parentId: 'kb-s-1',
          name: '余热锅炉系统',
          type: 'folder',
          scope: 'shared',
          fileCount: 6,
          createdAt: now(-86400000 * 130),
          updatedAt: now(-86400000),
        },
        {
          id: 'kb-s-1-3',
          parentId: 'kb-s-1',
          name: '汽轮发电机',
          type: 'folder',
          scope: 'shared',
          fileCount: 5,
          createdAt: now(-86400000 * 120),
          updatedAt: now(-86400000),
        },
        {
          id: 'kb-s-1-4',
          parentId: 'kb-s-1',
          name: '烟气净化系统',
          type: 'folder',
          scope: 'shared',
          fileCount: 7,
          createdAt: now(-86400000 * 110),
          updatedAt: now(-86400000),
        },
      ],
    },
    {
      id: 'kb-s-2',
      parentId: 'kb-shared-root',
      name: '应急预案',
      type: 'folder',
      scope: 'shared',
      fileCount: 12,
      createdAt: now(-86400000 * 100),
      updatedAt: now(-86400000),
      children: [
        {
          id: 'kb-s-2-1',
          parentId: 'kb-s-2',
          name: '设备事故预案',
          type: 'folder',
          scope: 'shared',
          fileCount: 7,
          createdAt: now(-86400000 * 90),
          updatedAt: now(-86400000),
        },
        {
          id: 'kb-s-2-2',
          parentId: 'kb-s-2',
          name: '环保超标预案',
          type: 'folder',
          scope: 'shared',
          fileCount: 5,
          createdAt: now(-86400000 * 80),
          updatedAt: now(-86400000),
        },
      ],
    },
    {
      id: 'kb-s-3',
      parentId: 'kb-shared-root',
      name: '设备说明书',
      type: 'folder',
      scope: 'shared',
      fileCount: 10,
      createdAt: now(-86400000 * 90),
      updatedAt: now(-86400000),
    },
    {
      id: 'kb-s-4',
      parentId: 'kb-shared-root',
      name: '安规与两票三制',
      type: 'folder',
      scope: 'shared',
      fileCount: 6,
      createdAt: now(-86400000 * 70),
      updatedAt: now(-86400000),
    },
    {
      id: 'kb-s-5',
      parentId: 'kb-shared-root',
      name: '事故案例库',
      type: 'folder',
      scope: 'shared',
      fileCount: 6,
      createdAt: now(-86400000 * 50),
      updatedAt: now(-86400000),
    },
  ],
}

const trees: Record<KbScope, KbNode[]> = {
  personal: [personalRoot],
  shared: [sharedRoot],
}

// ---------- Files ----------
function makeFile(folderId: string, scope: KbScope, overrides: Partial<KbFile> = {}): KbFile {
  const name = overrides.name ?? '未命名文件.pdf'
  return {
    id: overrides.id ?? uid('f'),
    folderId,
    scope,
    name,
    kind: overrides.kind ?? getFileKindByName(name),
    size: overrides.size ?? Math.floor(Math.random() * 5_000_000) + 100_000,
    status: overrides.status ?? 'ready',
    uploadedBy: overrides.uploadedBy ?? '李建国',
    uploadedAt: overrides.uploadedAt ?? now(-Math.floor(Math.random() * 86400000 * 10)),
    updatedAt: overrides.updatedAt ?? now(),
    ...overrides,
  }
}

const files: KbFile[] = [
  // 个人 · 常用处置卡
  makeFile('kb-p-1-1', 'personal', {
    name: '炉膛温度异常处置卡.pdf',
    size: 820_000,
    uploadedBy: '李建国',
  }),
  makeFile('kb-p-1-1', 'personal', {
    name: '汽包水位低快速处置.docx',
    kind: 'word',
    size: 360_000,
    uploadedBy: '李建国',
  }),
  makeFile('kb-p-1-1', 'personal', {
    name: '给料系统卡料处置.pdf',
    size: 560_000,
    status: 'parsing',
    uploadedBy: '李建国',
  }),
  makeFile('kb-p-1-1', 'personal', {
    name: '烟气 CEMS 数据异常自查清单.xlsx',
    kind: 'excel',
    size: 96_000,
    uploadedBy: '李建国',
  }),
  // 个人 · 交接班模板
  makeFile('kb-p-1-2', 'personal', {
    name: '中班交接班记录模板.docx',
    kind: 'word',
    size: 74_000,
    uploadedBy: '李建国',
  }),
  makeFile('kb-p-1-2', 'personal', {
    name: '巡检路线打卡表.xlsx',
    kind: 'excel',
    size: 58_000,
    uploadedBy: '李建国',
  }),
  // 个人 · 培训与考核
  makeFile('kb-p-2', 'personal', {
    name: '中控运行员上岗考核题库.pdf',
    size: 2_340_000,
    uploadedBy: '李建国',
  }),
  makeFile('kb-p-2', 'personal', {
    name: 'DCS 画面操作演示.pptx',
    kind: 'ppt',
    size: 4_820_000,
    uploadedBy: '李建国',
  }),
  makeFile('kb-p-2', 'personal', {
    name: '运行常用术语速查.md',
    kind: 'markdown',
    size: 36_000,
    uploadedBy: '李建国',
  }),
  makeFile('kb-p-2', 'personal', {
    name: '安全月考核卷.pdf',
    size: 680_000,
    status: 'failed',
    errorMessage: 'PDF 被加密，无法解析',
    uploadedBy: '李建国',
  }),
  makeFile('kb-p-2', 'personal', {
    name: '个人学习笔记.txt',
    kind: 'txt',
    size: 12_400,
    uploadedBy: '李建国',
  }),
  // 个人 · 个人复盘
  makeFile('kb-p-3', 'personal', {
    name: '2026-03 夜班炉膛结焦复盘.docx',
    kind: 'word',
    size: 210_000,
    uploadedBy: '李建国',
  }),
  makeFile('kb-p-3', 'personal', {
    name: '季度运行总结.pptx',
    kind: 'ppt',
    size: 1_640_000,
    uploadedBy: '李建国',
  }),

  // 共享 · 焚烧炉系统
  makeFile('kb-s-1-1', 'shared', {
    name: '焚烧炉启动操作规程.pdf',
    size: 3_840_000,
    uploadedBy: '运行技术部',
  }),
  makeFile('kb-s-1-1', 'shared', {
    name: '焚烧炉正常运行控制要点.pdf',
    size: 2_240_000,
    uploadedBy: '运行技术部',
  }),
  makeFile('kb-s-1-1', 'shared', {
    name: '炉排驱动液压系统说明.docx',
    kind: 'word',
    size: 920_000,
    uploadedBy: '运行技术部',
  }),
  makeFile('kb-s-1-1', 'shared', {
    name: '一次风二次风配比调节曲线.xlsx',
    kind: 'excel',
    size: 210_000,
    uploadedBy: '运行技术部',
  }),
  // 共享 · 余热锅炉系统
  makeFile('kb-s-1-2', 'shared', {
    name: '余热锅炉运行规程.pdf',
    size: 4_120_000,
    uploadedBy: '运行技术部',
  }),
  makeFile('kb-s-1-2', 'shared', {
    name: '汽包水位三级保护逻辑.pdf',
    size: 1_640_000,
    uploadedBy: '运行技术部',
  }),
  makeFile('kb-s-1-2', 'shared', {
    name: '主汽温自动调节系统说明.docx',
    kind: 'word',
    size: 780_000,
    uploadedBy: '运行技术部',
  }),
  makeFile('kb-s-1-2', 'shared', {
    name: '锅炉吹灰作业指导书.pdf',
    size: 1_240_000,
    status: 'parsing',
    uploadedBy: '运行技术部',
  }),
  // 共享 · 汽轮发电机
  makeFile('kb-s-1-3', 'shared', {
    name: '汽轮机启停操作规程.pdf',
    size: 3_560_000,
    uploadedBy: '电气运行组',
  }),
  makeFile('kb-s-1-3', 'shared', {
    name: '发电机并网解列操作票模板.xlsx',
    kind: 'excel',
    size: 180_000,
    uploadedBy: '电气运行组',
  }),
  makeFile('kb-s-1-3', 'shared', {
    name: '汽轮机振动趋势判读.pptx',
    kind: 'ppt',
    size: 3_920_000,
    uploadedBy: '电气运行组',
  }),
  // 共享 · 烟气净化系统
  makeFile('kb-s-1-4', 'shared', {
    name: 'SNCR 脱硝系统运行规程.pdf',
    size: 2_840_000,
    uploadedBy: '环保运行组',
  }),
  makeFile('kb-s-1-4', 'shared', {
    name: '半干法脱酸塔操作说明.pdf',
    size: 2_120_000,
    uploadedBy: '环保运行组',
  }),
  makeFile('kb-s-1-4', 'shared', {
    name: '活性炭喷射量调整指引.docx',
    kind: 'word',
    size: 520_000,
    uploadedBy: '环保运行组',
  }),
  makeFile('kb-s-1-4', 'shared', {
    name: '布袋除尘器差压超标排查.md',
    kind: 'markdown',
    size: 42_000,
    uploadedBy: '环保运行组',
  }),
  makeFile('kb-s-1-4', 'shared', {
    name: '烟气排放限值对照表.xlsx',
    kind: 'excel',
    size: 88_000,
    uploadedBy: '环保运行组',
  }),

  // 共享 · 设备事故预案
  makeFile('kb-s-2-1', 'shared', {
    name: '锅炉爆管事故应急预案.pdf',
    size: 2_640_000,
    uploadedBy: '安全生产部',
  }),
  makeFile('kb-s-2-1', 'shared', {
    name: '汽轮机跳机事故处置流程.pdf',
    size: 1_920_000,
    uploadedBy: '安全生产部',
  }),
  makeFile('kb-s-2-1', 'shared', {
    name: '全厂停电应急预案.pdf',
    size: 2_260_000,
    uploadedBy: '安全生产部',
  }),
  makeFile('kb-s-2-1', 'shared', {
    name: '垃圾池火灾处置演练脚本.docx',
    kind: 'word',
    size: 460_000,
    uploadedBy: '安全生产部',
  }),
  // 共享 · 环保超标预案
  makeFile('kb-s-2-2', 'shared', {
    name: '烟气 NOx 超标应急预案.pdf',
    size: 1_640_000,
    uploadedBy: '环保运行组',
  }),
  makeFile('kb-s-2-2', 'shared', {
    name: '渗滤液处理站事故预案.pdf',
    size: 1_240_000,
    uploadedBy: '环保运行组',
  }),
  makeFile('kb-s-2-2', 'shared', {
    name: '飞灰外运异常处置流程.docx',
    kind: 'word',
    size: 360_000,
    uploadedBy: '环保运行组',
  }),

  // 共享 · 设备说明书
  makeFile('kb-s-3', 'shared', {
    name: 'Martin 炉排机械结构说明书.pdf',
    size: 8_420_000,
    uploadedBy: '设备部',
  }),
  makeFile('kb-s-3', 'shared', {
    name: 'DCS 系统运行维护手册.pdf',
    size: 6_240_000,
    uploadedBy: '自动化部',
  }),
  makeFile('kb-s-3', 'shared', {
    name: '引风机变频器说明书.pdf',
    size: 3_840_000,
    uploadedBy: '设备部',
  }),
  makeFile('kb-s-3', 'shared', {
    name: '凝汽器真空泵使用说明.pdf',
    size: 2_240_000,
    status: 'parsing',
    uploadedBy: '设备部',
  }),

  // 共享 · 安规与两票三制
  makeFile('kb-s-4', 'shared', {
    name: '电业安全工作规程(热力机械部分).pdf',
    size: 4_820_000,
    uploadedBy: '安全生产部',
  }),
  makeFile('kb-s-4', 'shared', {
    name: '工作票操作票管理办法.pdf',
    size: 1_620_000,
    uploadedBy: '安全生产部',
  }),
  makeFile('kb-s-4', 'shared', {
    name: '两票三制实施细则.docx',
    kind: 'word',
    size: 620_000,
    uploadedBy: '安全生产部',
  }),

  // 共享 · 事故案例库
  makeFile('kb-s-5', 'shared', {
    name: '某电厂 2023 汽包缺水事故通报.pdf',
    size: 1_840_000,
    uploadedBy: '安全生产部',
  }),
  makeFile('kb-s-5', 'shared', {
    name: '本厂 2024-11 给料斗架桥复盘报告.pdf',
    size: 2_240_000,
    uploadedBy: '运行技术部',
  }),
  makeFile('kb-s-5', 'shared', {
    name: '垃圾焚烧行业事故典型案例汇编.pdf',
    size: 12_840_000,
    uploadedBy: '安全生产部',
  }),
]

// ---------- Helpers ----------
function getTreeCopy(scope: KbScope): KbNode[] {
  return JSON.parse(JSON.stringify(trees[scope]))
}

function findNode(scope: KbScope, id: string): KbNode | null {
  const list = trees[scope]
  const walk = (nodes: KbNode[]): KbNode | null => {
    for (const n of nodes) {
      if (n.id === id) return n
      if (n.children) {
        const r = walk(n.children)
        if (r) return r
      }
    }
    return null
  }
  return walk(list)
}

function collectIds(node: KbNode): string[] {
  const ids = [node.id]
  node.children?.forEach((c) => ids.push(...collectIds(c)))
  return ids
}

function removeNodeFromTree(scope: KbScope, id: string) {
  const walk = (nodes: KbNode[]): KbNode[] => {
    return nodes.filter((n) => {
      if (n.id === id) return false
      if (n.children) n.children = walk(n.children)
      return true
    })
  }
  trees[scope] = walk(trees[scope])
}

// ---------- Public API ----------
export async function getTree(scope: KbScope): Promise<KbNode[]> {
  return delay(getTreeCopy(scope), 320)
}

export async function createFolder(payload: CreateFolderPayload): Promise<KbNode> {
  const { parentId, scope, name } = payload
  const node: KbNode = {
    id: uid('kb'),
    parentId,
    name,
    type: 'folder',
    scope,
    fileCount: 0,
    createdAt: now(),
    updatedAt: now(),
  }
  if (!parentId) {
    trees[scope].push(node)
  } else {
    const parent = findNode(scope, parentId)
    if (!parent) throw new Error('父节点不存在')
    parent.children = parent.children ?? []
    parent.children.push(node)
  }
  return delay(node, 220)
}

export async function renameNode(payload: RenameNodePayload): Promise<KbNode> {
  const node = findNode(payload.scope, payload.id)
  if (!node) throw new Error('节点不存在')
  node.name = payload.name
  node.updatedAt = now()
  return delay(node, 220)
}

export async function deleteNode(payload: DeleteNodePayload): Promise<void> {
  const node = findNode(payload.scope, payload.id)
  if (!node) throw new Error('节点不存在')
  const ids = collectIds(node)
  removeNodeFromTree(payload.scope, payload.id)
  for (let i = files.length - 1; i >= 0; i--) {
    if (ids.includes(files[i].folderId)) files.splice(i, 1)
  }
  return delay(undefined, 220)
}

export async function listFiles(query: ListFilesQuery): Promise<PageResult<KbFile>> {
  const { folderId, scope, page, pageSize, keyword, status, sortBy = 'uploadedAt', sortOrder = 'desc' } = query
  let list = files.filter((f) => f.folderId === folderId && f.scope === scope)
  if (keyword) {
    const q = keyword.trim().toLowerCase()
    list = list.filter((f) => f.name.toLowerCase().includes(q))
  }
  if (status) list = list.filter((f) => f.status === status)
  list = list.slice().sort((a, b) => {
    const av = (a as unknown as Record<string, unknown>)[sortBy] as string | number
    const bv = (b as unknown as Record<string, unknown>)[sortBy] as string | number
    if (av < bv) return sortOrder === 'asc' ? -1 : 1
    if (av > bv) return sortOrder === 'asc' ? 1 : -1
    return 0
  })
  const total = list.length
  const start = (page - 1) * pageSize
  const items = list.slice(start, start + pageSize)
  return delay({ items, total, page, pageSize }, 280)
}

export async function uploadFile(
  payload: UploadFilePayload,
  onProgress?: (p: number) => void,
): Promise<KbFile> {
  for (let p = 0; p <= 100; p += 20) {
    await delay(null, 120)
    onProgress?.(p)
  }
  const file: KbFile = {
    id: uid('f'),
    folderId: payload.folderId,
    scope: payload.scope,
    name: payload.file.name,
    kind: getFileKindByName(payload.file.name),
    size: payload.file.size,
    status: 'parsing',
    uploadedBy: '李建国',
    uploadedAt: now(),
    updatedAt: now(),
    mime: payload.file.type,
  }
  files.unshift(file)
  setTimeout(() => {
    const target = files.find((f) => f.id === file.id)
    if (target) {
      target.status = Math.random() < 0.08 ? 'failed' : 'ready'
      target.updatedAt = now()
      if (target.status === 'failed') target.errorMessage = '文档格式不受支持'
    }
  }, 1800)
  return file
}

export async function deleteFile(fileId: string): Promise<void> {
  const idx = files.findIndex((f) => f.id === fileId)
  if (idx >= 0) files.splice(idx, 1)
  return delay(undefined, 200)
}

export async function getFile(fileId: string): Promise<KbFile | null> {
  return delay(files.find((f) => f.id === fileId) ?? null, 180)
}
