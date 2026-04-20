<script setup lang="ts">
import { computed } from 'vue'
import { TrendingUp, TrendingDown, Minus } from 'lucide-vue-next'
import Sparkline from './Sparkline.vue'
import type { DashboardStat } from '@/api/dashboard'
import { cn } from '@/lib/utils'

interface Props {
  stat: DashboardStat
  /** slot for icon on the left */
}

const props = defineProps<Props>()

const formatted = computed(() => {
  const n = props.stat.value
  if (n >= 10000) return (n / 1000).toFixed(1) + 'k'
  return n.toLocaleString('en-US')
})

const delta = computed(() => props.stat.delta ?? 0)
const isUp = computed(() => delta.value > 0)
const isDown = computed(() => delta.value < 0)
const isFlat = computed(() => delta.value === 0)
</script>

<template>
  <div
    class="relative panel p-4 card-hover cursor-pointer overflow-hidden"
  >
    <div class="flex items-start justify-between">
      <div class="space-y-1 min-w-0">
        <div class="text-xs text-muted-foreground flex items-center gap-1.5">
          <slot name="icon" />
          <span class="truncate">{{ stat.label }}</span>
        </div>
        <div class="flex items-baseline gap-1.5">
          <span class="text-[28px] leading-none font-semibold tabular-nums tracking-tight">
            {{ formatted }}
          </span>
          <span v-if="stat.unit" class="text-xs text-muted-foreground">{{ stat.unit }}</span>
        </div>
      </div>
      <Sparkline
        v-if="stat.trend?.length"
        :data="stat.trend"
        :width="96"
        :height="32"
      />
    </div>

    <div class="mt-3 flex items-center gap-1.5 text-xs">
      <span
        :class="
          cn(
            'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 tabular-nums font-medium',
            isUp && 'bg-success-soft text-success',
            isDown && 'bg-destructive/10 text-destructive',
            isFlat && 'bg-muted text-muted-foreground',
          )
        "
      >
        <TrendingUp v-if="isUp" class="size-3" />
        <TrendingDown v-else-if="isDown" class="size-3" />
        <Minus v-else class="size-3" />
        {{ delta > 0 ? '+' : '' }}{{ delta }}
      </span>
      <span class="text-muted-foreground truncate">{{ stat.hint || '较上周' }}</span>
    </div>
  </div>
</template>
