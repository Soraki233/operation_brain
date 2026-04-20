import { request } from '@/utils/request'
import type {
  ChatMessage,
  ChatSession,
  KnowledgeBaseOption,
  RenameSessionPayload,
  SendMessagePayload,
  StreamChunk,
  StreamHandle,
} from '@/types/chat'
import * as mock from './mock/chat.mock'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// --- Real API ---
function realListSessions() {
  return request.get<ChatSession[]>('/chat/sessions')
}
function realListMessages(sessionId: string) {
  return request.get<ChatMessage[]>(`/chat/sessions/${sessionId}/messages`)
}
function realCreateSession(title: string) {
  return request.post<ChatSession>('/chat/sessions', { title })
}
function realRenameSession(payload: RenameSessionPayload) {
  return request.patch<void>(`/chat/sessions/${payload.id}`, { title: payload.title })
}
function realTogglePinSession(id: string) {
  return request.post<void>(`/chat/sessions/${id}/toggle-pin`)
}
function realDeleteSession(id: string) {
  return request.delete<void>(`/chat/sessions/${id}`)
}
function realListKnowledgeBases() {
  return request.get<KnowledgeBaseOption[]>('/chat/kb-options')
}
function realBindSessionKb(sessionId: string, kb: KnowledgeBaseOption | null) {
  return request.post<void>(`/chat/sessions/${sessionId}/bind-kb`, { kbId: kb?.id ?? null })
}
function realSendMessage(payload: SendMessagePayload) {
  return request.post<ChatMessage>('/chat/messages', payload)
}

/**
 * Real streaming should use SSE / fetch stream. For now this is a placeholder
 * that invokes sendMessage and emits one chunk. Replace with EventSource later.
 */
function realStreamReply(
  payload: { sessionId: string; content: string },
  onChunk: (chunk: StreamChunk) => void,
): StreamHandle {
  let stopped = false
  const promise = realSendMessage({ sessionId: payload.sessionId, content: payload.content })
    .then((msg) => {
      if (stopped) return
      onChunk({ type: 'delta', content: msg.content })
      if (msg.references?.length) onChunk({ type: 'references', references: msg.references })
      onChunk({ type: 'done' })
    })
    .catch((e) => {
      onChunk({ type: 'error', message: e instanceof Error ? e.message : 'stream error' })
    })
  return { stop: () => (stopped = true), promise }
}

export const listSessions = USE_MOCK ? mock.listSessions : realListSessions
export const listMessages = USE_MOCK ? mock.listMessages : realListMessages
export const createSession = USE_MOCK ? mock.createSession : realCreateSession
export const renameSession = USE_MOCK ? mock.renameSession : realRenameSession
export const togglePinSession = USE_MOCK ? mock.togglePinSession : realTogglePinSession
export const deleteSession = USE_MOCK ? mock.deleteSession : realDeleteSession
export const listKnowledgeBases = USE_MOCK ? mock.listKnowledgeBases : realListKnowledgeBases
export const bindSessionKb = USE_MOCK ? mock.bindSessionKb : realBindSessionKb
export const streamReply = USE_MOCK ? mock.streamReply : realStreamReply
export const appendMessage = USE_MOCK ? mock.appendMessage : () => {}
