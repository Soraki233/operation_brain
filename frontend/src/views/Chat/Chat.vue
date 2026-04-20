<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { Pencil, Trash2, Flame } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import ChatSidebar from './components/ChatSidebar.vue'
import ChatInput from './components/ChatInput.vue'
import ChatMessage from './components/ChatMessage.vue'
import ChatEmpty from './components/ChatEmpty.vue'
import KbSelector from './components/KbSelector.vue'
import RenameSessionDialog from './components/RenameSessionDialog.vue'
import { useChatStore } from '@/stores/chat'
import type { ChatSession } from '@/types/chat'

const store = useChatStore()

const scrollEl = ref<HTMLDivElement | null>(null)
const inputRef = ref<InstanceType<typeof ChatInput> | null>(null)

const renameOpen = ref(false)
const renameLoading = ref(false)
const renamingSession = ref<ChatSession | null>(null)

const deleteOpen = ref(false)
const deletingSession = ref<ChatSession | null>(null)
const deleteLoading = ref(false)

onMounted(async () => {
  await store.loadSessions()
  void store.loadKbOptions()
})

const showEmpty = computed(
  () => !store.messagesLoading && store.messages.length === 0,
)

const lastAssistantIdx = computed(() => {
  for (let i = store.messages.length - 1; i >= 0; i--) {
    if (store.messages[i].role === 'assistant') return i
  }
  return -1
})

async function scrollToBottom(smooth = true) {
  await nextTick()
  const el = scrollEl.value
  if (!el) return
  el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
}

watch(
  () => store.messages.length,
  () => scrollToBottom(true),
)
watch(
  () => store.activeId,
  () => scrollToBottom(false),
)
// Auto-scroll during streaming as content grows
watch(
  () => store.messages[store.messages.length - 1]?.content,
  () => {
    if (store.streaming) scrollToBottom(false)
  },
)

async function send(content: string) {
  try {
    await store.sendMessage(content)
  } catch (e) {
    toast.error(e instanceof Error ? e.message : '发送失败')
  }
}

async function createNew() {
  await store.createSession('新问答')
  inputRef.value?.focus()
}

function openRename(s: ChatSession) {
  renamingSession.value = s
  renameOpen.value = true
}

async function submitRename(title: string) {
  if (!renamingSession.value) return
  renameLoading.value = true
  try {
    await store.renameSession(renamingSession.value.id, title)
    toast.success('已重命名')
    renameOpen.value = false
  } catch (e) {
    toast.error(e instanceof Error ? e.message : '重命名失败')
  } finally {
    renameLoading.value = false
  }
}

function openDelete(s: ChatSession) {
  deletingSession.value = s
  deleteOpen.value = true
}

async function confirmDelete() {
  if (!deletingSession.value) return
  deleteLoading.value = true
  try {
    await store.deleteSession(deletingSession.value.id)
    toast.success('已删除')
    deleteOpen.value = false
  } catch (e) {
    toast.error(e instanceof Error ? e.message : '删除失败')
  } finally {
    deleteLoading.value = false
  }
}

function pickSuggestion(p: string) {
  inputRef.value?.insert(p)
}
</script>

<template>
  <div class="flex h-[calc(100vh-3.5rem)] w-full overflow-hidden bg-background">
    <!-- Sidebar -->
    <ChatSidebar @new="createNew" @rename="openRename" @delete="openDelete" />

    <!-- Main -->
    <section class="flex-1 flex flex-col min-w-0">
      <!-- Header -->
      <header class="h-14 shrink-0 border-b bg-card/60 glass-surface flex items-center gap-3 px-5">
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <Flame class="size-4 text-brand shrink-0" />
            <h2 class="text-sm font-semibold truncate">
              {{ store.activeSession?.title || 'OpsBrain · 运行助手' }}
            </h2>
          </div>
          <div class="text-[11.5px] text-muted-foreground mt-0.5 truncate">
            {{
              store.activeSession
                ? `${store.activeSession.messageCount ?? store.messages.length} 条消息 · ${
                    store.activeSession.kbName || '未绑定知识库'
                  }`
                : '基于全厂知识库与运行经验答疑'
            }}
          </div>
        </div>

        <KbSelector />

        <Button
          v-if="store.activeSession"
          variant="ghost"
          size="icon-sm"
          title="重命名问答"
          @click="openRename(store.activeSession)"
        >
          <Pencil class="size-4" />
        </Button>
        <Button
          v-if="store.activeSession"
          variant="ghost"
          size="icon-sm"
          class="text-destructive hover:text-destructive"
          title="删除该问答"
          @click="openDelete(store.activeSession)"
        >
          <Trash2 class="size-4" />
        </Button>
      </header>

      <!-- Messages -->
      <div
        ref="scrollEl"
        class="flex-1 overflow-y-auto ob-scrollbar"
      >
        <div class="mx-auto w-full max-w-[820px] px-6 py-6 space-y-6">
          <template v-if="store.messagesLoading">
            <Skeleton v-for="i in 3" :key="i" class="h-20 w-full rounded-2xl" />
          </template>

          <ChatEmpty v-else-if="showEmpty" @pick="pickSuggestion" />

          <template v-else>
            <ChatMessage
              v-for="(msg, idx) in store.messages"
              :key="msg.id"
              :message="msg"
              :is-last-assistant="idx === lastAssistantIdx"
              :streaming="store.streaming && idx === lastAssistantIdx"
              @regenerate="store.regenerateLast()"
              @feedback="(v) => store.setFeedback(msg.id, v)"
            />
          </template>
        </div>
      </div>

      <!-- Input -->
      <div class="shrink-0 border-t bg-gradient-to-b from-background to-muted/30">
        <ChatInput
          ref="inputRef"
          :streaming="store.streaming"
          @submit="send"
          @stop="store.stopStreaming()"
        />
      </div>
    </section>

    <!-- Dialogs -->
    <RenameSessionDialog
      v-model:open="renameOpen"
      :initial-title="renamingSession?.title ?? ''"
      :loading="renameLoading"
      @submit="submitRename"
    />

    <AlertDialog v-model:open="deleteOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>删除该问答？</AlertDialogTitle>
          <AlertDialogDescription>
            删除后「{{ deletingSession?.title }}」及其全部问答记录将无法恢复，建议重要复盘先导出留底。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel :disabled="deleteLoading">取消</AlertDialogCancel>
          <AlertDialogAction
            class="bg-destructive text-white hover:bg-destructive/90"
            :disabled="deleteLoading"
            @click="confirmDelete"
          >
            {{ deleteLoading ? '删除中…' : '删除' }}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
