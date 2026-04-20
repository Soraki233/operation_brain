<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  value: string
}

const props = defineProps<Props>()

const score = computed(() => {
  const v = props.value || ''
  if (!v) return 0
  let s = 0
  if (v.length >= 8) s++
  if (/[a-z]/.test(v) && /[A-Z]/.test(v)) s++
  if (/\d/.test(v)) s++
  if (/[^A-Za-z0-9]/.test(v)) s++
  return Math.min(s, 4)
})

const levels = [
  { label: '太弱', color: 'bg-destructive', text: 'text-destructive' },
  { label: '较弱', color: 'bg-destructive', text: 'text-destructive' },
  { label: '一般', color: 'bg-warning', text: 'text-warning' },
  { label: '较强', color: 'bg-brand', text: 'text-brand' },
  { label: '强', color: 'bg-success', text: 'text-success' },
] as const

const level = computed(() => levels[score.value])
</script>

<template>
  <div v-if="value" class="space-y-1">
    <div class="flex gap-1">
      <span
        v-for="i in 4"
        :key="i"
        :class="cn('h-1 flex-1 rounded-full bg-muted transition-colors', i <= score && level.color)"
      />
    </div>
    <div class="flex items-center justify-between text-[11px]">
      <span :class="level.text">密码强度：{{ level.label }}</span>
      <span class="text-muted-foreground">建议包含大小写、数字与符号</span>
    </div>
  </div>
</template>
