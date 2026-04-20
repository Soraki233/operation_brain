import { request } from '@/utils/request'
import type { PageResult } from '@/types/common'
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
import * as mock from './mock/knowledge.mock'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// --- Real API impls (kept aligned with mock signatures) ---

function realGetTree(scope: KbScope) {
  return request.get<KbNode[]>('/knowledge/tree', { scope })
}

function realCreateFolder(payload: CreateFolderPayload) {
  return request.post<KbNode>('/knowledge/folders', payload)
}

function realRenameNode(payload: RenameNodePayload) {
  return request.patch<KbNode>(`/knowledge/nodes/${payload.id}`, payload)
}

function realDeleteNode(payload: DeleteNodePayload) {
  return request.delete<void>(`/knowledge/nodes/${payload.id}`, { params: { scope: payload.scope } })
}

function realListFiles(query: ListFilesQuery) {
  return request.get<PageResult<KbFile>>('/knowledge/files', { ...query })
}

function realUploadFile(payload: UploadFilePayload, onProgress?: (p: number) => void) {
  return request.upload<KbFile>('/knowledge/files/upload', payload.file, {
    extraFields: { folderId: payload.folderId, scope: payload.scope },
    onProgress,
  })
}

function realDeleteFile(fileId: string) {
  return request.delete<void>(`/knowledge/files/${fileId}`)
}

function realGetFile(fileId: string) {
  return request.get<KbFile | null>(`/knowledge/files/${fileId}`)
}

export const getTree = USE_MOCK ? mock.getTree : realGetTree
export const createFolder = USE_MOCK ? mock.createFolder : realCreateFolder
export const renameNode = USE_MOCK ? mock.renameNode : realRenameNode
export const deleteNode = USE_MOCK ? mock.deleteNode : realDeleteNode
export const listFiles = USE_MOCK ? mock.listFiles : realListFiles
export const uploadFile = USE_MOCK ? mock.uploadFile : realUploadFile
export const deleteFile = USE_MOCK ? mock.deleteFile : realDeleteFile
export const getFile = USE_MOCK ? mock.getFile : realGetFile
