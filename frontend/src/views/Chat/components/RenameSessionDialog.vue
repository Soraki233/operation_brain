<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
  open: boolean
  initialTitle?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), { initialTitle: '' })
const emit = defineEmits<{
  (e: 'update:open', v: boolean): void
  (e: 'submit', title: string): void
}>()

const value = ref(props.initialTitle)
const error = ref<string | null>(null)

watch(
  () => props.open,
  (v) => {
    if (v) {
      value.value = props.initialTitle
      error.value = null
    }
  },
)

function submit() {
  const t = value.value.trim()
  if (!t) {
    error.value = '名称不能为空'
    return
  }
  if (t.length > 40) {
    error.value = '最多 40 个字符'
    return
  }
  error.value = null
  emit('submit', t)
}
</script>

<template>
  <Dialog :open="open" @update:open="(v: boolean) => emit('update:open', v)">
    <DialogContent class="sm:max-w-[420px]">
      <DialogHeader>
        <DialogTitle>重命名问答</DialogTitle>
        <DialogDescription>给这组问答一个更容易识别的名字，方便以后追溯。</DialogDescription>
      </DialogHeader>
      <div class="space-y-1.5 py-2">
        <Label for="rename-input">问答名称</Label>
        <Input
          id="rename-input"
          v-model="value"
          placeholder="例如：数据库应急预案讨论"
          :class="error && 'border-destructive focus-visible:ring-destructive/40'"
          @keydown.enter="submit"
        />
        <p v-if="error" class="text-xs text-destructive">{{ error }}</p>
        <p v-else class="text-xs text-muted-foreground">
          {{ value.length }} / 40
        </p>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="emit('update:open', false)">取消</Button>
        <Button :disabled="loading" @click="submit">
          {{ loading ? '保存中…' : '保存' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
