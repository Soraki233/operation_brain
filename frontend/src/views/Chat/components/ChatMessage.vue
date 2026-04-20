<script setup lang="ts">
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'
import {
  Bot,
  User as UserIcon,
  Copy,
  Check,
  RotateCw,
  ThumbsUp,
  ThumbsDown,
  FileText,
  AlertTriangle,
  Loader2,
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import type { ChatMessage as ChatMessageT } from '@/types/chat'
import MessageContent from './MessageContent.vue'
import { formatRelativeTime } from '@/utils/format'
import { cn } from '@/lib/utils'

interface Props {
  message: ChatMessageT
  isLastAssistant?: boolean
  streaming?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'regenerate'): void
  (e: 'feedback', value: 1 | -1): void
}>()

const isUser = computed(() => props.message.role === 'user')
const isAssistant = computed(() => props.message.role === 'assistant')
const isStreaming = computed(() => props.message.status === 'streaming')
const hasError = computed(() => props.message.status === 'error')
const isStopped = computed(() => props.message.status === 'stopped')
const isEmpty = computed(() => isAssistant.value && !props.message.content && isStreaming.value)

const copied = ref(false)
async function copyContent() {
  try {
    await navigator.clipboard.writeText(props.message.content)
    copied.value = true
    toast.success('已复制')
    setTimeout(() => (copied.value = false), 1500)
  } catch {
    toast.error('复制失败')
  }
}

function giveFeedback(v: 1 | -1) {
  emit('feedback', props.message.feedback === v ? 0 as unknown as 1 : v)
  toast.success(v === 1 ? '感谢你的反馈' : '我们会继续优化')
}
</script>

<template>
  <div :class="cn('flex gap-3 group', isUser && 'flex-row-reverse')">
    <!-- Avatar -->
    <div
      v-if="isUser"
      class="shrink-0 size-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground"
    >
      <UserIcon class="size-4" />
    </div>
    <div
      v-else
      class="shrink-0 size-8 rounded-lg brand-gradient flex items-center justify-center text-brand-foreground shadow-sm"
    >
      <Bot class="size-4" />
    </div>

    <!-- Body -->
    <div :class="cn('min-w-0 max-w-[min(760px,calc(100%-44px))]', isUser && 'text-right')">
      <div
        :class="
          cn(
            'flex items-center gap-2 text-xs text-muted-foreground mb-1',
            isUser && 'justify-end',
          )
        "
      >
        <span>{{ isUser ? '你' : 'OpsBrain AI' }}</span>
        <span v-if="isStreaming" class="status-pill bg-brand-soft text-brand-soft-foreground">
          <span class="status-dot bg-brand animate-pulse" /> 生成中
        </span>
        <span v-else-if="hasError" class="status-pill bg-destructive/10 text-destructive">
          <span class="status-dot bg-destructive" /> 失败
        </span>
        <span v-else-if="isStopped" class="status-pill bg-muted text-muted-foreground">
          <span class="status-dot bg-muted-foreground" /> 已停止
        </span>
        <span>{{ formatRelativeTime(message.createdAt) }}</span>
      </div>

      <!-- User bubble -->
      <div
        v-if="isUser"
        class="inline-block rounded-2xl rounded-tr-md bg-brand text-brand-foreground px-4 py-2.5 text-[14.5px] leading-relaxed text-left whitespace-pre-wrap shadow-sm max-w-full break-words"
      >
        {{ message.content }}
      </div>

      <!-- Assistant bubble -->
      <div v-else>
        <div
          v-if="isEmpty"
          class="inline-flex items-center gap-2 rounded-2xl border bg-card px-4 py-3 text-sm text-muted-foreground"
        >
          <Loader2 class="size-4 text-brand animate-spin" />
          正在思考你的问题…
        </div>
        <div
          v-else-if="hasError"
          class="inline-flex items-start gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          <AlertTriangle class="size-4 mt-0.5" />
          <span>{{ message.content || '生成失败，请重试' }}</span>
        </div>
        <div
          v-else
          class="rounded-2xl rounded-tl-md border bg-card px-4 py-3 shadow-xs"
        >
          <MessageContent :content="message.content" :streaming="isStreaming" />

          <!-- References -->
          <div
            v-if="message.references && message.references.length"
            class="mt-3 border-t pt-3 space-y-1.5"
          >
            <div class="text-[11px] font-medium text-muted-foreground mb-1">规程出处</div>
            <div
              v-for="(ref, i) in message.references"
              :key="i"
              class="group/ref flex items-start gap-2 rounded-lg border bg-muted/30 px-2.5 py-2 text-xs hover:bg-muted/60 hover:border-brand/30 transition-colors cursor-pointer"
            >
              <span
                class="flex size-5 shrink-0 items-center justify-center rounded bg-background text-brand text-[10px] font-semibold"
              >{{ i + 1 }}</span>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1.5">
                  <FileText class="size-3 text-muted-foreground" />
                  <span class="truncate font-medium">{{ ref.fileName }}</span>
                  <span v-if="ref.page" class="shrink-0 text-muted-foreground">· 第 {{ ref.page }} 页</span>
                </div>
                <p class="mt-0.5 text-muted-foreground leading-relaxed line-clamp-2">
                  {{ ref.snippet }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Assistant action toolbar -->
        <div
          v-if="!isStreaming && !isEmpty"
          class="mt-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Button variant="ghost" size="icon-sm" @click="copyContent">
            <Check v-if="copied" class="size-3.5 text-success" />
            <Copy v-else class="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            :class="message.feedback === 1 && 'text-success bg-success-soft'"
            @click="giveFeedback(1)"
          >
            <ThumbsUp class="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            :class="message.feedback === -1 && 'text-destructive bg-destructive/10'"
            @click="giveFeedback(-1)"
          >
            <ThumbsDown class="size-3.5" />
          </Button>
          <Button
            v-if="isLastAssistant"
            variant="ghost"
            size="sm"
            class="text-xs text-muted-foreground h-7"
            @click="emit('regenerate')"
          >
            <RotateCw class="size-3.5" />
            重新生成
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
