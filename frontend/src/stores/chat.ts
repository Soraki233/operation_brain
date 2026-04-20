import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { chatApi } from '@/api'
import type {
  ChatMessage,
  ChatSession,
  KnowledgeBaseOption,
  StreamHandle,
} from '@/types/chat'

function uid(prefix = 'm'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`
}

export type SessionGroupKey = 'pinned' | 'today' | 'yesterday' | 'week' | 'older'

export interface SessionGroup {
  key: SessionGroupKey
  label: string
  items: ChatSession[]
}

function groupSessions(list: ChatSession[]): SessionGroup[] {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const startOfYesterday = startOfDay - 86_400_000
  const startOfWeek = startOfDay - 6 * 86_400_000

  const groups: Record<SessionGroupKey, ChatSession[]> = {
    pinned: [],
    today: [],
    yesterday: [],
    week: [],
    older: [],
  }

  for (const s of list) {
    if (s.pinned) {
      groups.pinned.push(s)
      continue
    }
    const t = new Date(s.updatedAt).getTime()
    if (t >= startOfDay) groups.today.push(s)
    else if (t >= startOfYesterday) groups.yesterday.push(s)
    else if (t >= startOfWeek) groups.week.push(s)
    else groups.older.push(s)
  }

  const labels: Record<SessionGroupKey, string> = {
    pinned: '置顶',
    today: '今天',
    yesterday: '昨天',
    week: '本周',
    older: '更早',
  }

  return (Object.keys(groups) as SessionGroupKey[])
    .filter((k) => groups[k].length)
    .map((k) => ({ key: k, label: labels[k], items: groups[k] }))
}

export const useChatStore = defineStore('chat', () => {
  const sessions = ref<ChatSession[]>([])
  const sessionsLoading = ref(false)
  const activeId = ref<string | null>(null)
  const messages = ref<ChatMessage[]>([])
  const messagesLoading = ref(false)
  const streaming = ref(false)
  const kbOptions = ref<KnowledgeBaseOption[]>([])
  let currentHandle: StreamHandle | null = null

  const activeSession = computed(() =>
    sessions.value.find((s) => s.id === activeId.value) ?? null,
  )

  const groupedSessions = computed(() => {
    const sorted = [...sessions.value].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    return groupSessions(sorted)
  })

  async function loadSessions() {
    sessionsLoading.value = true
    try {
      sessions.value = await chatApi.listSessions()
      if (!activeId.value && sessions.value.length) {
        await selectSession(sessions.value[0].id)
      }
    } finally {
      sessionsLoading.value = false
    }
  }

  async function loadKbOptions() {
    if (kbOptions.value.length) return
    kbOptions.value = await chatApi.listKnowledgeBases()
  }

  async function selectSession(id: string) {
    activeId.value = id
    messagesLoading.value = true
    try {
      messages.value = await chatApi.listMessages(id)
    } finally {
      messagesLoading.value = false
    }
  }

  async function createSession(title = '新对话'): Promise<ChatSession> {
    const s = await chatApi.createSession(title)
    sessions.value.unshift(s)
    await selectSession(s.id)
    return s
  }

  async function renameSession(id: string, title: string) {
    await chatApi.renameSession({ id, title })
    const s = sessions.value.find((x) => x.id === id)
    if (s) s.title = title
  }

  async function togglePin(id: string) {
    await chatApi.togglePinSession(id)
    const s = sessions.value.find((x) => x.id === id)
    if (s) s.pinned = !s.pinned
  }

  async function deleteSession(id: string) {
    await chatApi.deleteSession(id)
    sessions.value = sessions.value.filter((s) => s.id !== id)
    if (activeId.value === id) {
      activeId.value = null
      messages.value = []
    }
  }

  async function bindKb(kb: KnowledgeBaseOption | null) {
    if (!activeId.value) return
    await chatApi.bindSessionKb(activeId.value, kb)
    const s = sessions.value.find((x) => x.id === activeId.value)
    if (s) {
      if (kb) {
        s.kbId = kb.id
        s.kbName = kb.name
      } else {
        s.kbId = undefined
        s.kbName = undefined
      }
    }
  }

  async function ensureSession(): Promise<string> {
    if (activeId.value) return activeId.value
    const s = await createSession('新对话')
    return s.id
  }

  async function sendMessage(content: string): Promise<void> {
    if (!content.trim()) return
    const sid = await ensureSession()

    const userMsg: ChatMessage = {
      id: uid('u'),
      sessionId: sid,
      role: 'user',
      content: content.trim(),
      createdAt: new Date().toISOString(),
      status: 'done',
    }
    messages.value.push(userMsg)
    chatApi.appendMessage(sid, userMsg)

    const assistantMsg: ChatMessage = {
      id: uid('a'),
      sessionId: sid,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
      status: 'streaming',
      references: [],
    }
    messages.value.push(assistantMsg)

    streaming.value = true
    try {
      currentHandle = chatApi.streamReply(
        { sessionId: sid, content: userMsg.content },
        (chunk) => {
          const idx = messages.value.findIndex((m) => m.id === assistantMsg.id)
          if (idx < 0) return
          const current = messages.value[idx]
          if (chunk.type === 'delta' && chunk.content) {
            current.content += chunk.content
          } else if (chunk.type === 'references' && chunk.references) {
            current.references = chunk.references
          } else if (chunk.type === 'done') {
            current.status = 'done'
          } else if (chunk.type === 'error') {
            current.status = 'error'
            current.content = current.content || chunk.message || '生成失败'
          }
        },
      )
      await currentHandle.promise

      // promote session to top + update metadata
      const sIdx = sessions.value.findIndex((s) => s.id === sid)
      if (sIdx >= 0) {
        const s = sessions.value[sIdx]
        s.lastMessage = userMsg.content
        s.updatedAt = new Date().toISOString()
        s.messageCount = (s.messageCount ?? 0) + 2
      }

      // If session was still titled '新对话', auto title from first question
      const s = sessions.value.find((x) => x.id === sid)
      if (s && s.title === '新对话') {
        const t = userMsg.content.slice(0, 20)
        await renameSession(sid, t)
      }
    } finally {
      const idx = messages.value.findIndex((m) => m.id === assistantMsg.id)
      if (idx >= 0 && messages.value[idx].status === 'streaming') {
        messages.value[idx].status = 'stopped'
      }
      streaming.value = false
      currentHandle = null
    }
  }

  function stopStreaming() {
    currentHandle?.stop()
  }

  async function regenerateLast() {
    // Remove last assistant message, resend last user message
    const lastAssistantIdx = [...messages.value].reverse().findIndex((m) => m.role === 'assistant')
    if (lastAssistantIdx < 0) return
    const realIdx = messages.value.length - 1 - lastAssistantIdx
    const lastUser = [...messages.value.slice(0, realIdx)]
      .reverse()
      .find((m) => m.role === 'user')
    if (!lastUser) return
    messages.value.splice(realIdx, 1)
    // remove the duplicate user that sendMessage will re-add
    // simpler: directly call stream without re-adding user
    const assistantMsg: ChatMessage = {
      id: uid('a'),
      sessionId: lastUser.sessionId,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
      status: 'streaming',
      references: [],
    }
    messages.value.push(assistantMsg)
    streaming.value = true
    try {
      currentHandle = chatApi.streamReply(
        { sessionId: lastUser.sessionId, content: lastUser.content },
        (chunk) => {
          const idx = messages.value.findIndex((m) => m.id === assistantMsg.id)
          if (idx < 0) return
          const current = messages.value[idx]
          if (chunk.type === 'delta' && chunk.content) current.content += chunk.content
          else if (chunk.type === 'references' && chunk.references)
            current.references = chunk.references
          else if (chunk.type === 'done') current.status = 'done'
          else if (chunk.type === 'error') {
            current.status = 'error'
            current.content = chunk.message || '生成失败'
          }
        },
      )
      await currentHandle.promise
    } finally {
      const idx = messages.value.findIndex((m) => m.id === assistantMsg.id)
      if (idx >= 0 && messages.value[idx].status === 'streaming') {
        messages.value[idx].status = 'stopped'
      }
      streaming.value = false
      currentHandle = null
    }
  }

  function setFeedback(messageId: string, value: 1 | -1 | 0) {
    const m = messages.value.find((x) => x.id === messageId)
    if (m) m.feedback = value
  }

  return {
    sessions,
    sessionsLoading,
    activeId,
    activeSession,
    groupedSessions,
    messages,
    messagesLoading,
    streaming,
    kbOptions,
    loadSessions,
    loadKbOptions,
    selectSession,
    createSession,
    renameSession,
    togglePin,
    deleteSession,
    bindKb,
    sendMessage,
    stopStreaming,
    regenerateLast,
    setFeedback,
  }
})
