<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { storeToRefs } from 'pinia'
import { useKnowledgeStore } from '@/stores/knowledge'
import { knowledgeApi } from '@/api'
import type { KbFile, KbNode } from '@/types/knowledge'
import KnowledgeSidebar from './components/KnowledgeSidebar.vue'
import KnowledgeToolbar from './components/KnowledgeToolbar.vue'
import KnowledgeFileList from './components/KnowledgeFileList.vue'
import UploadDialog from './components/UploadDialog.vue'
import FolderFormDialog from './components/FolderFormDialog.vue'
import DeleteConfirmDialog from './components/DeleteConfirmDialog.vue'
import FilePreviewDrawer from './components/FilePreviewDrawer.vue'
import { useFileList } from './composables/useFileList'

const store = useKnowledgeStore()
const { currentFolderId, currentNode, scope } = storeToRefs(store)

const fileList = useFileList()

// --- Dialog states ---
const uploadOpen = ref(false)

interface FolderDialogState {
  open: boolean
  mode: 'create' | 'rename'
  parent: KbNode | null
  node: KbNode | null
}
const folderDialog = ref<FolderDialogState>({
  open: false,
  mode: 'create',
  parent: null,
  node: null,
})

interface DeleteState {
  open: boolean
  kind: 'folder' | 'file' | null
  target: KbNode | KbFile | null
  loading: boolean
}
const deleteState = ref<DeleteState>({ open: false, kind: null, target: null, loading: false })

const previewState = ref<{ open: boolean; file: KbFile | null }>({
  open: false,
  file: null,
})

// --- Lifecycle ---
onMounted(async () => {
  await store.loadTree('personal')
})

// When current folder changes, reload file list
watch(
  [currentFolderId, scope],
  ([id, s]) => {
    fileList.setFolder(id ?? null, s)
  },
  { immediate: true },
)

// --- Folder CRUD ---
function onCreateFolder(parent: KbNode | null) {
  folderDialog.value = { open: true, mode: 'create', parent, node: null }
}
function onRenameFolder(node: KbNode) {
  folderDialog.value = { open: true, mode: 'rename', parent: null, node }
}
function onDeleteFolder(node: KbNode) {
  deleteState.value = { open: true, kind: 'folder', target: node, loading: false }
}

async function submitFolderForm(name: string) {
  try {
    if (folderDialog.value.mode === 'create') {
      await store.createFolder(folderDialog.value.parent?.id ?? null, name)
      toast.success('文件夹已创建')
    } else if (folderDialog.value.node) {
      await store.renameNode(folderDialog.value.node.id, name)
      toast.success('已重命名')
    }
    folderDialog.value.open = false
  } catch (e) {
    toast.error(e instanceof Error ? e.message : '操作失败')
  }
}

// --- File ops ---
function onPreview(file: KbFile) {
  previewState.value = { open: true, file }
}
function onDeleteFile(file: KbFile) {
  deleteState.value = { open: true, kind: 'file', target: file, loading: false }
}

async function confirmDelete() {
  const s = deleteState.value
  if (!s.target) return
  s.loading = true
  try {
    if (s.kind === 'folder') {
      await store.deleteNode((s.target as KbNode).id)
      toast.success('文件夹已删除')
    } else if (s.kind === 'file') {
      await knowledgeApi.deleteFile((s.target as KbFile).id)
      toast.success('文件已删除')
      // if deleting from preview, close drawer
      if (previewState.value.file?.id === (s.target as KbFile).id) {
        previewState.value = { open: false, file: null }
      }
      fileList.refresh()
    }
    s.open = false
  } catch (e) {
    toast.error(e instanceof Error ? e.message : '删除失败')
  } finally {
    s.loading = false
  }
}

// --- Upload ---
function openUpload() {
  if (!currentFolderId.value) {
    toast.warning('请先选择一个目录')
    return
  }
  uploadOpen.value = true
}
function onUploaded() {
  fileList.refresh()
}
</script>

<template>
  <div class="flex h-full overflow-hidden">
    <KnowledgeSidebar
      @create="onCreateFolder"
      @rename="onRenameFolder"
      @delete="onDeleteFolder"
    />

    <section class="flex flex-1 min-w-0 flex-col bg-muted/20">
      <KnowledgeToolbar
        :keyword="fileList.keyword.value"
        @update:keyword="fileList.setKeyword"
        @upload="openUpload"
        @new-folder="onCreateFolder(currentNode)"
        @refresh="fileList.refresh"
      />

      <KnowledgeFileList
        :items="fileList.items.value"
        :total="fileList.total.value"
        :page="fileList.page.value"
        :page-size="fileList.pageSize.value"
        :loading="fileList.loading.value"
        :error="fileList.error.value"
        :keyword="fileList.keyword.value"
        :has-folder="!!currentFolderId"
        @preview="onPreview"
        @delete="onDeleteFile"
        @upload="openUpload"
        @retry="fileList.refresh"
        @page-change="fileList.changePage"
      />
    </section>

    <!-- Dialogs / Drawers -->
    <UploadDialog
      v-model:open="uploadOpen"
      :folder-id="currentFolderId"
      :folder-name="currentNode?.name"
      :scope="scope"
      @uploaded="onUploaded"
    />

    <FolderFormDialog
      v-model:open="folderDialog.open"
      :mode="folderDialog.mode"
      :initial-name="folderDialog.node?.name"
      :parent-name="folderDialog.parent?.name"
      @submit="submitFolderForm"
    />

    <DeleteConfirmDialog
      v-model:open="deleteState.open"
      :loading="deleteState.loading"
      :title="deleteState.kind === 'folder' ? '删除文件夹？' : '删除文件？'"
      :description="
        deleteState.kind === 'folder'
          ? `将删除「${(deleteState.target as KbNode)?.name}」及其中全部文件，不可恢复。`
          : `将永久删除「${(deleteState.target as KbFile)?.name}」，不可恢复。`
      "
      @confirm="confirmDelete"
    />

    <FilePreviewDrawer
      v-model:open="previewState.open"
      :file="previewState.file"
      @delete="onDeleteFile"
    />
  </div>
</template>
