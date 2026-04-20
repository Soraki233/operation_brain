<script setup lang="ts">
import { ref, watch } from 'vue'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface Props {
  open: boolean
  mode: 'create' | 'rename'
  initialName?: string
  parentName?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:open', v: boolean): void
  (e: 'submit', name: string): void
}>()

const schema = z
  .string()
  .min(1, '名称不能为空')
  .max(50, '最多 50 个字符')
  .regex(/^[^\\/:*?"<>|]+$/, '不能包含特殊字符 \\ / : * ? " < > |')

const name = ref('')
const error = ref<string | null>(null)
const submitting = ref(false)

watch(
  () => props.open,
  (v) => {
    if (v) {
      name.value = props.initialName ?? ''
      error.value = null
      submitting.value = false
    }
  },
)

function validate(): boolean {
  const res = schema.safeParse(name.value.trim())
  if (!res.success) {
    error.value = res.error.issues[0]?.message ?? '名称不合法'
    return false
  }
  error.value = null
  return true
}

async function onSubmit() {
  if (!validate()) return
  submitting.value = true
  try {
    emit('submit', name.value.trim())
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="(v) => emit('update:open', v)">
    <DialogContent class="sm:max-w-[420px]">
      <DialogHeader>
        <DialogTitle>
          {{ mode === 'create' ? '新建文件夹' : '重命名' }}
        </DialogTitle>
        <DialogDescription>
          <template v-if="mode === 'create'">
            <template v-if="parentName">在 <span class="font-medium text-foreground">{{ parentName }}</span> 下创建子文件夹</template>
            <template v-else>创建一个新的根目录</template>
          </template>
          <template v-else>为文件夹设置一个新名称</template>
        </DialogDescription>
      </DialogHeader>
      <div class="space-y-1.5 py-1">
        <Label for="folder-name">文件夹名称</Label>
        <Input
          id="folder-name"
          v-model="name"
          placeholder="例如：产品需求"
          autofocus
          @keyup.enter="onSubmit"
          @input="error && validate()"
        />
        <p
          v-if="error"
          class="text-xs text-destructive mt-1"
        >
          {{ error }}
        </p>
        <p v-else class="text-xs text-muted-foreground mt-1">
          长度 1~50，不支持 \\ / : * ? " &lt; &gt; |
        </p>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="emit('update:open', false)">取消</Button>
        <Button :disabled="submitting" @click="onSubmit">
          {{ mode === 'create' ? '创建' : '保存' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
