export type KbScope = 'personal' | 'shared'

export type KbNodeType = 'folder' | 'library'

export interface KbNode {
  id: string
  parentId: string | null
  name: string
  type: KbNodeType
  scope: KbScope
  fileCount?: number
  children?: KbNode[]
  createdAt: string
  updatedAt: string
}

export type FileStatus = 'parsing' | 'ready' | 'failed'

export type FileKind =
  | 'pdf'
  | 'word'
  | 'excel'
  | 'ppt'
  | 'markdown'
  | 'txt'
  | 'image'
  | 'other'

export interface KbFile {
  id: string
  folderId: string
  scope: KbScope
  name: string
  kind: FileKind
  size: number
  status: FileStatus
  errorMessage?: string
  uploadedBy: string
  uploadedAt: string
  updatedAt: string
  mime?: string
}

export interface ListFilesQuery {
  folderId: string
  scope: KbScope
  page: number
  pageSize: number
  keyword?: string
  status?: FileStatus
  sortBy?: 'name' | 'size' | 'uploadedAt'
  sortOrder?: 'asc' | 'desc'
}

export interface CreateFolderPayload {
  parentId: string | null
  scope: KbScope
  name: string
}

export interface RenameNodePayload {
  id: string
  scope: KbScope
  name: string
}

export interface DeleteNodePayload {
  id: string
  scope: KbScope
}

export interface UploadFilePayload {
  folderId: string
  scope: KbScope
  file: File
}

export type UploadStatus = 'queued' | 'uploading' | 'parsing' | 'ready' | 'failed'

export interface UploadTask {
  id: string
  file: File
  folderId: string
  scope: KbScope
  progress: number
  status: UploadStatus
  errorMessage?: string
  serverFileId?: string
}
