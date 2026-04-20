import { request } from '@/utils/request'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export interface DashboardStat {
  key: string
  label: string
  value: number
  delta?: number
  unit?: string
  trend?: number[]
  hint?: string
}

export interface DashboardActivity {
  id: string
  type: 'upload' | 'chat' | 'folder' | 'share' | 'parse'
  title: string
  subtitle?: string
  actor?: string
  at: string
}

export interface DashboardAnnouncement {
  id: string
  title: string
  description: string
  href?: string
  badge?: 'new' | 'tip' | 'warn'
}

export interface DashboardOnboardingItem {
  key: string
  label: string
  description: string
  done: boolean
  href?: string
}

export interface DashboardBundle {
  stats: DashboardStat[]
  recentFiles: Array<{
    id: string
    name: string
    kind: string
    kbName: string
    uploadedAt: string
  }>
  recentSessions: Array<{
    id: string
    title: string
    kbName?: string
    updatedAt: string
  }>
  activities: DashboardActivity[]
  announcements: DashboardAnnouncement[]
  onboarding: DashboardOnboardingItem[]
  tips: string[]
}

function genTrend(base: number, variance = 10): number[] {
  const arr: number[] = []
  let v = base - variance
  for (let i = 0; i < 14; i++) {
    v += (Math.random() - 0.4) * variance
    arr.push(Math.max(1, Math.round(v)))
  }
  return arr
}

const mockBundle: DashboardBundle = {
  stats: [
    {
      key: 'docs',
      label: '在册规程',
      value: 186,
      delta: 12,
      unit: '份',
      trend: genTrend(150, 12),
      hint: '较上月新增',
    },
    {
      key: 'queries',
      label: '本周答疑',
      value: 248,
      delta: 34,
      trend: genTrend(180, 25),
      hint: '运行人员累计提问',
    },
    {
      key: 'drills',
      label: '预案查阅',
      value: 52,
      delta: 8,
      trend: genTrend(36, 8),
      hint: '最近 14 天',
    },
    {
      key: 'operators',
      label: '接入成员',
      value: 28,
      delta: 3,
      unit: '人',
      trend: genTrend(24, 2),
      hint: '运行人员累计',
    },
  ],
  recentFiles: [
    {
      id: 'r-1',
      name: '焚烧炉启动操作规程.pdf',
      kind: 'pdf',
      kbName: '规程 · 焚烧炉系统',
      uploadedAt: new Date(Date.now() - 1_200_000).toISOString(),
    },
    {
      id: 'r-2',
      name: 'SNCR 脱硝系统运行规程.pdf',
      kind: 'pdf',
      kbName: '规程 · 烟气净化系统',
      uploadedAt: new Date(Date.now() - 3_600_000).toISOString(),
    },
    {
      id: 'r-3',
      name: '本厂 2024-11 给料斗架桥复盘报告.pdf',
      kind: 'pdf',
      kbName: '事故案例库',
      uploadedAt: new Date(Date.now() - 86_400_000).toISOString(),
    },
    {
      id: 'r-4',
      name: '锅炉爆管事故应急预案.pdf',
      kind: 'pdf',
      kbName: '预案 · 设备事故预案',
      uploadedAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    },
  ],
  recentSessions: [
    {
      id: 's-1',
      title: '炉膛温度持续下降应如何处置',
      kbName: '规程 · 焚烧炉系统',
      updatedAt: new Date(Date.now() - 900_000).toISOString(),
    },
    {
      id: 's-2',
      title: '汽包水位三取二保护逻辑',
      kbName: '规程 · 余热锅炉系统',
      updatedAt: new Date(Date.now() - 7_200_000).toISOString(),
    },
    {
      id: 's-3',
      title: 'SNCR 喷氨量调整经验',
      kbName: '规程 · 烟气净化系统',
      updatedAt: new Date(Date.now() - 86_400_000 - 3_600_000).toISOString(),
    },
  ],
  activities: [
    {
      id: 'a-1',
      type: 'upload',
      title: '上传了 4 份规程到「规程 · 焚烧炉系统」',
      subtitle: '焚烧炉启动操作规程.pdf 等',
      actor: '运行技术部',
      at: new Date(Date.now() - 1_200_000).toISOString(),
    },
    {
      id: 'a-2',
      type: 'chat',
      title: '张师傅 基于「烟气净化系统」完成 6 轮问答',
      actor: '张师傅',
      at: new Date(Date.now() - 3_600_000).toISOString(),
    },
    {
      id: 'a-3',
      type: 'parse',
      title: '系统已完成 8 份新上传规程的向量化解析',
      subtitle: '可立即在 AI 助手中引用',
      actor: '系统',
      at: new Date(Date.now() - 5_400_000).toISOString(),
    },
    {
      id: 'a-4',
      type: 'share',
      title: '安全生产部 发布了新版《两票三制实施细则》',
      actor: '安全生产部',
      at: new Date(Date.now() - 86_400_000).toISOString(),
    },
    {
      id: 'a-5',
      type: 'folder',
      title: '新建了目录「2026 Q2 运行工况月报」',
      actor: '运行技术部',
      at: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    },
  ],
  announcements: [
    {
      id: 'n-1',
      title: 'v1.2 上线 · 支持按系统视角检索规程',
      description:
        '新版支持按系统（焚烧炉 / 锅炉 / 汽轮机 / 烟气净化）绑定知识库，AI 答疑会自动定位到规程页码。',
      badge: 'new',
    },
  ],
  onboarding: [
    {
      key: 'create-kb',
      label: '完成个人知识库目录搭建',
      description: '建议按「常用处置卡 / 交接班模板 / 复盘」三级组织',
      done: true,
      href: '/knowledge',
    },
    {
      key: 'upload-file',
      label: '上传第 1 份常用规程',
      description: '支持 PDF / Word / Excel / 图片等常见格式',
      done: true,
      href: '/knowledge',
    },
    {
      key: 'bind-kb',
      label: '在 AI 助手中绑定常用知识库',
      description: '让答疑精确限定在你关心的系统',
      done: false,
      href: '/chat',
    },
    {
      key: 'share',
      label: '邀请同事共同沉淀知识',
      description: '让 2~3 个同事加入，形成共享知识资产',
      done: false,
    },
  ],
  tips: [
    '把常见故障处置卡整理到「常用处置卡」目录，AI 答疑会优先参考这里。',
    '每次上传完规程后，等待约 1 分钟系统自动解析完成，即可在 AI 助手中被引用。',
  ],
}

export const getDashboard = USE_MOCK
  ? async (): Promise<DashboardBundle> => {
      await new Promise((r) => setTimeout(r, 200))
      return JSON.parse(JSON.stringify(mockBundle))
    }
  : () => request.get<DashboardBundle>('/dashboard/overview')
