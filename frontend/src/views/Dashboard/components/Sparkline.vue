<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  data: number[]
  width?: number
  height?: number
  /** stroke color (css var or hsl). Defaults to brand. */
  color?: string
  /** area fill opacity */
  fillOpacity?: number
  /** positive trend uses color; negative uses destructive */
  auto?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  width: 120,
  height: 36,
  color: 'var(--brand)',
  fillOpacity: 0.14,
  auto: true,
})

const trendColor = computed(() => {
  if (!props.auto) return props.color
  const d = props.data
  if (d.length < 2) return props.color
  return d[d.length - 1] >= d[0] ? 'var(--success)' : 'var(--destructive)'
})

const path = computed(() => {
  const d = props.data
  if (!d.length) return { line: '', area: '' }
  const w = props.width
  const h = props.height
  const min = Math.min(...d)
  const max = Math.max(...d)
  const range = max - min || 1
  const stepX = d.length > 1 ? w / (d.length - 1) : w
  const points = d.map((v, i) => {
    const x = i * stepX
    const y = h - ((v - min) / range) * (h - 4) - 2
    return [x, y] as const
  })
  const line = points
    .map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`))
    .join(' ')
  const area = `${line} L${points[points.length - 1][0]},${h} L0,${h} Z`
  return { line, area }
})

const gradId = `spark-${Math.random().toString(36).slice(2, 8)}`
</script>

<template>
  <svg
    :width="width"
    :height="height"
    :viewBox="`0 0 ${width} ${height}`"
    class="block"
    role="img"
    aria-label="趋势图"
  >
    <defs>
      <linearGradient :id="gradId" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" :stop-color="trendColor" :stop-opacity="fillOpacity + 0.05" />
        <stop offset="100%" :stop-color="trendColor" stop-opacity="0" />
      </linearGradient>
    </defs>
    <path :d="path.area" :fill="`url(#${gradId})`" />
    <path :d="path.line" :stroke="trendColor" stroke-width="1.75" fill="none" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>
