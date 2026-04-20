export type ChatRole = 'user' | 'assistant' | 'system'

export type MessageStatus = 'pending' | 'streaming' | 'done' | 'error' | 'stopped'

export interface ChatSession {
  id: string
  title: string
  kbId?: string
  kbName?: string
  lastMessage?: string
  updatedAt: string
  pinned?: boolean
  messageCount?: number
}

export interface ChatReference {
  fileId: string
  fileName: string
  snippet: string
  page?: number
}

export interface ChatMessage {
  id: string
  sessionId: string
  role: ChatRole
  content: string
  createdAt: string
  status?: MessageStatus
  references?: ChatReference[]
  /** feedback: 1 like, -1 dislike, 0 none */
  feedback?: 1 | -1 | 0
}

export interface SendMessagePayload {
  sessionId: string
  content: string
  kbId?: string
}

export interface StreamChunk {
  type: 'delta' | 'references' | 'done' | 'error'
  content?: string
  references?: ChatReference[]
  message?: string
}

export interface StreamHandle {
  stop: () => void
  promise: Promise<void>
}

export interface RenameSessionPayload {
  id: string
  title: string
}

export interface KnowledgeBaseOption {
  id: string
  name: string
  scope: 'personal' | 'shared'
}
