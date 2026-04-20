<script setup lang="ts">
import {
  Upload,
  MessageSquare,
  FolderPlus,
  Users,
  CheckCircle2,
} from 'lucide-vue-next'
import type { DashboardActivity } from '@/api/dashboard'
import { formatRelativeTime } from '@/utils/format'

interface Props {
  activities: DashboardActivity[]
}

defineProps<Props>()

const iconMap = {
  upload: { icon: Upload, className: 'bg-brand-soft text-brand' },
  chat: { icon: MessageSquare, className: 'bg-info-soft text-info' },
  folder: { icon: FolderPlus, className: 'bg-warning-soft text-warning' },
  share: { icon: Users, className: 'bg-success-soft text-success' },
  parse: { icon: CheckCircle2, className: 'bg-success-soft text-success' },
} as const

function meta(type: DashboardActivity['type']) {
  return iconMap[type] ?? iconMap.chat
}
</script>

<template>
  <div class="relative">
    <div
      v-for="(a, i) in activities"
      :key="a.id"
      class="relative flex gap-3 pb-5 last:pb-0"
    >
      <!-- Vertical rail -->
      <div
        v-if="i !== activities.length - 1"
        class="absolute left-[17px] top-9 bottom-0 w-px bg-gradient-to-b from-border to-transparent"
      />
      <div
        :class="[
          'size-[34px] shrink-0 rounded-full flex items-center justify-center ring-4 ring-card',
          meta(a.type).className,
        ]"
      >
        <component :is="meta(a.type).icon" class="size-4" />
      </div>
      <div class="flex-1 min-w-0 pt-1">
        <div class="text-sm text-foreground">
          <span class="font-medium">{{ a.actor || '系统' }}</span>
          <span class="mx-1 text-muted-foreground">·</span>
          <span>{{ a.title }}</span>
        </div>
        <div v-if="a.subtitle" class="mt-0.5 text-xs text-muted-foreground truncate">
          {{ a.subtitle }}
        </div>
        <div class="mt-0.5 text-[11px] text-muted-foreground tabular-nums">
          {{ formatRelativeTime(a.at) }}
        </div>
      </div>
    </div>
  </div>
</template>
