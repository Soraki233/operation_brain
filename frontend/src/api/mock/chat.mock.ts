import type {
  ChatMessage,
  ChatSession,
  KnowledgeBaseOption,
  RenameSessionPayload,
  StreamChunk,
  StreamHandle,
} from '@/types/chat'

function uid(prefix = 'c'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

function isoOffset(ms: number): string {
  return new Date(Date.now() - ms).toISOString()
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

// ---------- Seed sessions ----------
const sessions: ChatSession[] = [
  {
    id: 'c-1',
    title: '炉膛温度持续下降应如何处置',
    kbId: 'kb-s-1-1',
    kbName: '规程 · 焚烧炉系统',
    lastMessage: '炉膛出口温度跌到 830℃ 以下，该怎么快速拉回来？',
    updatedAt: isoOffset(3_600_000),
    pinned: true,
    messageCount: 14,
  },
  {
    id: 'c-2',
    title: '汽包水位三取二保护逻辑',
    kbId: 'kb-s-1-2',
    kbName: '规程 · 余热锅炉系统',
    lastMessage: '汽包水位三级保护是怎么配的？',
    updatedAt: isoOffset(12_000_000),
    messageCount: 8,
  },
  {
    id: 'c-3',
    title: 'SNCR 喷氨量调整经验',
    kbId: 'kb-s-1-4',
    kbName: '规程 · 烟气净化系统',
    lastMessage: 'NOx 排口数据在 120mg 左右，氨逃逸又偏高，怎么办？',
    updatedAt: isoOffset(86_400_000 + 3_600_000),
    messageCount: 6,
  },
  {
    id: 'c-4',
    title: '给料斗架桥处置步骤',
    kbId: 'kb-s-2-1',
    kbName: '预案 · 设备事故预案',
    lastMessage: '给料斗卡死，料位持续上涨，怎么快速恢复？',
    updatedAt: isoOffset(3 * 86_400_000),
    messageCount: 5,
  },
  {
    id: 'c-5',
    title: '汽轮机跳机后冷却要求',
    kbId: 'kb-s-1-3',
    kbName: '规程 · 汽轮发电机',
    lastMessage: '跳机后盘车和闷缸的条件分别是什么？',
    updatedAt: isoOffset(6 * 86_400_000),
    messageCount: 10,
  },
  {
    id: 'c-6',
    title: '两票三制常见问题',
    lastMessage: '设备解除备用的操作票要写几项？',
    updatedAt: isoOffset(14 * 86_400_000),
    messageCount: 4,
  },
]

// ---------- Seed messages ----------
const messagesMap: Record<string, ChatMessage[]> = {
  'c-1': [
    {
      id: 'm-1-1',
      sessionId: 'c-1',
      role: 'user',
      content:
        '最近垃圾热值偏低，炉膛出口温度经常跌到 830℃ 以下，有没有一份快速处置思路？',
      createdAt: isoOffset(3_600_000 + 300_000),
      status: 'done',
    },
    {
      id: 'm-1-2',
      sessionId: 'c-1',
      role: 'assistant',
      content: `炉膛温度持续走低，重点围绕 **燃烧四要素** 快速调整：

1. **配风**：适当减一次风、提高二次风比例，强化炉膛后燃
2. **料层**：降低给料速度，提高料层厚度，让垃圾在干燥段充分脱水
3. **炉排速度**：适当减慢干燥段与燃烧段炉排速度
4. **辅助燃烧**：如果温度仍在下降，按照规程启动 **启动燃烧器** 进行稳燃，同时通知燃料班关注垃圾搅拌情况

> 垃圾焚烧炉必须保证 **烟气在 850℃ 以上停留不少于 2 秒**，低于限值持续超时需立即按环保预案处置。

附：常用配风参考曲线

\`\`\`text
一次风占比  二次风占比  典型炉膛温度
60%          40%         ≥ 900℃（正常）
55%          45%         850 ~ 900℃
50%          50%         < 850℃（警戒）
\`\`\`
`,
      createdAt: isoOffset(3_600_000 + 240_000),
      status: 'done',
      references: [
        {
          fileId: 'f-ref-1',
          fileName: '焚烧炉正常运行控制要点.pdf',
          snippet:
            '炉膛出口温度低于 850℃ 并持续 3 分钟的，应立即减少给料并投入启动燃烧器…',
          page: 12,
        },
        {
          fileId: 'f-ref-2',
          fileName: '一次风二次风配比调节曲线.xlsx',
          snippet:
            '当燃烧工况恶化时，应优先通过提升二次风占比至 45% 以上来强化后燃…',
          page: 3,
        },
      ],
    },
    {
      id: 'm-1-3',
      sessionId: 'c-1',
      role: 'user',
      content: '那如果投了辅助燃烧器温度还是回不来，要不要停炉？',
      createdAt: isoOffset(3_600_000 + 60_000),
      status: 'done',
    },
  ],
  'c-2': [
    {
      id: 'm-2-1',
      sessionId: 'c-2',
      role: 'user',
      content: '我们的余热锅炉汽包水位三级保护是怎么配的？',
      createdAt: isoOffset(12_000_000 + 300_000),
      status: 'done',
    },
    {
      id: 'm-2-2',
      sessionId: 'c-2',
      role: 'assistant',
      content: `汽包水位保护采用 **三取二** 逻辑：

- **水位高 I 值**：+100mm，声光报警
- **水位高 II 值**：+150mm，联锁打开紧急放水阀
- **水位低 I 值**：-100mm，声光报警
- **水位低 II 值**：-150mm，联锁 MFT（主燃料跳闸）

> 任何一路变送器偏差超限都会进入三取二逻辑，避免单路假信号误停机。

运行中巡检重点：确认三路水位计水连管畅通，定期对比就地水位与 DCS 显示值。`,
      createdAt: isoOffset(12_000_000 + 240_000),
      status: 'done',
      references: [
        {
          fileId: 'f-ref-3',
          fileName: '汽包水位三级保护逻辑.pdf',
          snippet:
            '三取二逻辑可有效避免单测点故障造成的误触发，同时满足电厂 SIS 保护要求…',
          page: 6,
        },
      ],
    },
  ],
  'c-3': [],
  'c-4': [],
  'c-5': [],
  'c-6': [],
}

const kbOptions: KnowledgeBaseOption[] = [
  { id: 'kb-personal-root', name: '个人知识库', scope: 'personal' },
  { id: 'kb-p-1', name: '个人 · 值班参考', scope: 'personal' },
  { id: 'kb-p-2', name: '个人 · 培训与考核', scope: 'personal' },
  { id: 'kb-shared-root', name: '全厂知识库', scope: 'shared' },
  { id: 'kb-s-1-1', name: '规程 · 焚烧炉系统', scope: 'shared' },
  { id: 'kb-s-1-2', name: '规程 · 余热锅炉系统', scope: 'shared' },
  { id: 'kb-s-1-3', name: '规程 · 汽轮发电机', scope: 'shared' },
  { id: 'kb-s-1-4', name: '规程 · 烟气净化系统', scope: 'shared' },
  { id: 'kb-s-2-1', name: '预案 · 设备事故预案', scope: 'shared' },
  { id: 'kb-s-2-2', name: '预案 · 环保超标预案', scope: 'shared' },
  { id: 'kb-s-5', name: '事故案例库', scope: 'shared' },
]

// ---------- Public API ----------
export async function listSessions(): Promise<ChatSession[]> {
  await delay(180)
  return JSON.parse(JSON.stringify(sessions))
}

export async function listMessages(sessionId: string): Promise<ChatMessage[]> {
  await delay(260)
  return JSON.parse(JSON.stringify(messagesMap[sessionId] ?? []))
}

export async function createSession(title = '新问答'): Promise<ChatSession> {
  await delay(200)
  const s: ChatSession = {
    id: uid('c'),
    title,
    updatedAt: new Date().toISOString(),
    messageCount: 0,
  }
  sessions.unshift(s)
  messagesMap[s.id] = []
  return s
}

export async function renameSession(payload: RenameSessionPayload): Promise<void> {
  await delay(180)
  const s = sessions.find((x) => x.id === payload.id)
  if (s) {
    s.title = payload.title
    s.updatedAt = new Date().toISOString()
  }
}

export async function togglePinSession(id: string): Promise<void> {
  await delay(120)
  const s = sessions.find((x) => x.id === id)
  if (s) s.pinned = !s.pinned
}

export async function deleteSession(id: string): Promise<void> {
  await delay(180)
  const idx = sessions.findIndex((x) => x.id === id)
  if (idx >= 0) sessions.splice(idx, 1)
  delete messagesMap[id]
}

export async function listKnowledgeBases(): Promise<KnowledgeBaseOption[]> {
  await delay(120)
  return kbOptions
}

export async function bindSessionKb(sessionId: string, kb: KnowledgeBaseOption | null): Promise<void> {
  await delay(100)
  const s = sessions.find((x) => x.id === sessionId)
  if (s) {
    if (kb) {
      s.kbId = kb.id
      s.kbName = kb.name
    } else {
      delete s.kbId
      delete s.kbName
    }
  }
}

// ---------- Streaming ----------
function buildMockAnswer(question: string): { text: string; references: ChatMessage['references'] } {
  const q = question.toLowerCase()
  let text: string
  let fileName = '焚烧炉正常运行控制要点.pdf'

  if (q.includes('炉膛') || q.includes('温度')) {
    fileName = '焚烧炉正常运行控制要点.pdf'
    text = `当炉膛温度异常时，按以下顺序排查与处置：

1. **确认测点可靠性**：对比热电偶 A/B 两路，排除测点故障
2. **观察燃烧工况**：看炉排干燥段与燃烧段的火焰亮度、火床厚度
3. **调整配风比例**：优先提升二次风占比至 **45% 以上**
4. **控制给料**：降低给料速度，让物料在干燥段充分脱水
5. **投入辅助燃烧器**：连续 3 分钟低于 850℃ 必须投入

\`\`\`text
工况判断：
  炉膛温度 < 850℃ 持续 > 3min   → 启用辅助燃烧器
  炉膛温度 < 800℃                 → 按环保预案通知值长
\`\`\`

> 按照《生活垃圾焚烧污染控制标准》，烟气在炉膛 850℃ 区域停留时间不得少于 2 秒。`
  } else if (q.includes('汽包') || q.includes('水位')) {
    fileName = '汽包水位三级保护逻辑.pdf'
    text = `汽包水位异常的处置思路：

1. **立即确认**：就地水位计 vs DCS 显示值 vs 三路变送器
2. **水位低 I 值 (-100mm)**：检查给水泵、给水调节阀、主汽流量
3. **水位低 II 值 (-150mm)**：联锁 MFT，立即停止给料、切断天然气
4. **水位高**：检查给水调节阀是否卡涩、负荷是否突变

\`\`\`sql
-- DCS 历史追溯要素
SELECT 时间戳, 水位A, 水位B, 水位C, 给水流量, 主汽流量
FROM PI_DATA WHERE 时间戳 > now() - 30min
\`\`\`

运行经验：**宁可停一次机，也不要让汽包缺水**，这是安规底线。`
  } else if (q.includes('给料') || q.includes('架桥') || q.includes('卡料')) {
    fileName = '给料系统卡料处置.pdf'
    text = `给料斗架桥 / 卡料的处置步骤：

1. **停止给料炉排**，避免负压过大导致料斗闪爆风险
2. **通知抓斗司机**，减少向料斗投料
3. **投入蒸汽伴热**：高湿物料易粘结，打开伴热有助于松散
4. **人工疏通**：在现场确认安全后，使用专用工具从料斗侧门疏通
5. **持续监测**料斗负压与炉膛氧量，保持微负压运行

> 架桥处置最关键是 **保证料斗微负压**，防止烟气反窜引燃垃圾坑。`
  } else if (q.includes('snc') || q.includes('nox') || q.includes('氨') || q.includes('脱硝')) {
    fileName = 'SNCR 脱硝系统运行规程.pdf'
    text = `NOx 偏高但氨逃逸也偏高，通常意味着 **喷射均匀性差** 或 **温度窗口未对准**：

1. **确认温度窗口**：SNCR 最佳反应温度 **850~1050℃**，脱离窗口反应效率断崖下降
2. **检查喷枪**：逐支确认雾化效果、是否结焦堵塞
3. **分区调节**：根据炉膛断面温度分布，优先增加高温区喷射量
4. **调整氨水浓度**：浓度不足会导致还原反应不充分
5. **关注 CEMS 趋势**：NOx 与氨逃逸数据滞后 2~3 分钟，调整后观察至少一个周期

\`\`\`text
目标：NOx ≤ 80 mg/Nm³  且  氨逃逸 ≤ 8 mg/Nm³
\`\`\``
  } else if (q.includes('跳机') || q.includes('汽轮') || q.includes('闷缸') || q.includes('盘车')) {
    fileName = '汽轮机启停操作规程.pdf'
    text = `汽轮机跳机后的处置：

1. **立即执行**：确认主汽门、调节汽门关闭到位，发电机解列
2. **开启盘车**：润滑油温 ≥ 35℃、油压 ≥ 0.08MPa 即可投入
3. **闷缸判据**：预计 4 小时内可恢复热态启动的，允许闷缸
4. **真空维持**：视重启计划选择是否破坏真空
5. **记录**：大轴偏心、胀差、振动趋势必须完整记录至可启动为止

> 跳机原因未查清 **严禁** 强行再启动；必要时提请设备部介入。`
  } else {
    text = `已收到你的问题：${question}

我将基于当前选择的知识库为你查找答案。实际部署时，这里会流式返回 AI 的真实回答，并附带 **引用的规程章节与页码**，方便你一键跳转到原文核对。

\`\`\`text
检索范围：当前绑定知识库
返回格式：带段落引用的运行建议
\`\`\`

如需限定在某个系统（焚烧炉 / 锅炉 / 汽轮机 / 烟气净化），请在输入框左下角的知识库选择器中切换。`
  }

  const references = q.length > 6
    ? [
        {
          fileId: 'f-ref-mock',
          fileName,
          snippet: '本段规程详细描述了该工况下的判据、操作步骤与安全边界…',
          page: Math.floor(Math.random() * 40) + 1,
        },
      ]
    : []

  return { text, references }
}

export function streamReply(
  payload: { sessionId: string; content: string },
  onChunk: (chunk: StreamChunk) => void,
): StreamHandle {
  let stopped = false
  const { text, references } = buildMockAnswer(payload.content)
  const tokens = text.split(/(\s+|\n)/).filter(Boolean)

  const promise = (async () => {
    await delay(380)
    if (stopped) return
    for (const t of tokens) {
      if (stopped) return
      onChunk({ type: 'delta', content: t })
      await delay(18 + Math.random() * 40)
    }
    if (references?.length) {
      onChunk({ type: 'references', references })
    }
    onChunk({ type: 'done' })

    const s = sessions.find((x) => x.id === payload.sessionId)
    if (s) {
      s.lastMessage = payload.content
      s.updatedAt = new Date().toISOString()
      s.messageCount = (s.messageCount ?? 0) + 2
    }
  })()

  return {
    stop: () => {
      stopped = true
    },
    promise,
  }
}

export function appendMessage(sessionId: string, msg: ChatMessage): void {
  if (!messagesMap[sessionId]) messagesMap[sessionId] = []
  messagesMap[sessionId].push(msg)
}
