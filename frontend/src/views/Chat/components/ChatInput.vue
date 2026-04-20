<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { ArrowUp, Square, Paperclip, ShieldCheck } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import KbSelector from './KbSelector.vue'
import { cn } from '@/lib/utils'

interface Props {
  streaming?: boolean
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '描述工况或提问…例如：炉膛温度跌到 830℃ 怎么处置？（Enter 发送，Shift + Enter 换行）',
})

const emit = defineEmits<{
  (e: 'submit', content: string): void
  (e: 'stop'): void
}>()

const value = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const canSubmit = computed(() => !props.streaming && value.value.trim().length > 0)

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
    e.preventDefault()
    submit()
  }
}

function submit() {
  if (!canSubmit.value) return
  emit('submit', value.value.trim())
  value.value = ''
  resizeTextarea()
}

function resizeTextarea() {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 220) + 'px'
}

watch(value, () => nextTick(resizeTextarea))

defineExpose({
  focus: () => textareaRef.value?.focus(),
  insert: (text: string) => {
    value.value = text
    nextTick(() => {
      textareaRef.value?.focus()
      resizeTextarea()
    })
  },
})
</script>

<template>
  <div class="px-6 pb-5 pt-3">
    <div
      class="mx-auto w-full max-w-[820px] rounded-2xl border bg-card shadow-sm transition-shadow focus-within:shadow-md focus-within:border-brand/50"
    >
      <Textarea
        ref="textareaRef"
        v-model="value"
        :placeholder="placeholder"
        rows="1"
        class="min-h-[52px] max-h-[220px] resize-none border-0 bg-transparent px-4 pt-3 pb-1 text-[14.5px] shadow-none focus-visible:ring-0 focus-visible:border-0 ob-scrollbar"
        @keydown="handleKeydown"
      />

      <div class="flex items-center gap-2 px-2 pb-2 pt-1">
        <KbSelector variant="inline" />
        <Button
          variant="ghost"
          size="icon-sm"
          class="text-muted-foreground"
          title="上传附件（即将支持）"
          disabled
        >
          <Paperclip class="size-4" />
        </Button>

        <span class="ml-auto text-[11px] text-muted-foreground">
          {{ streaming ? '生成中…' : '基于知识库答疑' }}
        </span>

        <Button
          v-if="streaming"
          variant="outline"
          size="sm"
          class="gap-1.5"
          @click="emit('stop')"
        >
          <Square class="size-3.5 fill-current" />
          停止
        </Button>
        <Button
          v-else
          size="icon-sm"
          :disabled="!canSubmit"
          :class="cn('rounded-full transition-all', canSubmit ? 'brand-gradient text-brand-foreground hover:opacity-90' : 'bg-muted text-muted-foreground')"
          @click="submit"
        >
          <ArrowUp class="size-4" />
        </Button>
      </div>
    </div>

    <div class="mx-auto mt-2 w-full max-w-[820px] flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
      <ShieldCheck class="size-3 text-brand" />
      AI 建议仅供参考，现场操作请以纸质规程、值长指令及 DCS 实际工况为准
    </div>
  </div>
</template>
