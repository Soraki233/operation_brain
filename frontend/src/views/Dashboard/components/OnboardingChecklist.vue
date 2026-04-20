<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Check, ArrowRight, Circle } from 'lucide-vue-next'
import { Progress } from '@/components/ui/progress'
import type { DashboardOnboardingItem } from '@/api/dashboard'
import { cn } from '@/lib/utils'

interface Props {
  items: DashboardOnboardingItem[]
}

const props = defineProps<Props>()
const router = useRouter()

const done = computed(() => props.items.filter((x) => x.done).length)
const total = computed(() => props.items.length)
const percent = computed(() =>
  total.value ? Math.round((done.value / total.value) * 100) : 0,
)

function go(href?: string) {
  if (href) router.push(href)
}
</script>

<template>
  <div class="panel p-5">
    <div class="flex items-center justify-between">
      <div>
        <div class="text-sm font-semibold">运行人员上手指引</div>
        <div class="mt-0.5 text-xs text-muted-foreground">
          完成下面几步，把常用的规程和处置经验接入 AI 助手
        </div>
      </div>
      <div class="text-right shrink-0">
        <div class="text-xs text-muted-foreground">进度</div>
        <div class="text-sm font-semibold tabular-nums">
          {{ done }} / {{ total }}
        </div>
      </div>
    </div>
    <Progress :model-value="percent" class="mt-3 h-1.5" />

    <ul class="mt-4 space-y-2">
      <li
        v-for="item in items"
        :key="item.key"
        :class="
          cn(
            'group flex items-center gap-3 rounded-lg border border-transparent px-2 py-2 -mx-2',
            item.href && 'cursor-pointer hover:border-border hover:bg-muted/50',
          )
        "
        @click="go(item.href)"
      >
        <span
          :class="
            cn(
              'size-6 shrink-0 rounded-full flex items-center justify-center transition-colors',
              item.done
                ? 'bg-success text-success-foreground'
                : 'border border-dashed border-muted-foreground/40 text-muted-foreground',
            )
          "
        >
          <Check v-if="item.done" class="size-3.5" />
          <Circle v-else class="size-2 fill-current" />
        </span>
        <div class="flex-1 min-w-0">
          <div
            :class="
              cn(
                'text-sm font-medium truncate',
                item.done && 'line-through text-muted-foreground',
              )
            "
          >
            {{ item.label }}
          </div>
          <div class="text-xs text-muted-foreground truncate">{{ item.description }}</div>
        </div>
        <ArrowRight
          v-if="item.href && !item.done"
          class="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </li>
    </ul>
  </div>
</template>
