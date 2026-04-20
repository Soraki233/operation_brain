<script setup lang="ts">
import { FolderUp, Upload } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

interface Props {
  title?: string
  desc?: string
  canUpload?: boolean
}

withDefaults(defineProps<Props>(), {
  title: '这个目录还没有规程',
  desc: '上传运行规程、处置卡或事故案例，AI 运行助手就能基于它们给出带出处的答复。',
  canUpload: true,
})

defineEmits<{ (e: 'upload'): void }>()
</script>

<template>
  <div class="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
    <div
      class="relative flex size-20 items-center justify-center rounded-2xl bg-brand-soft text-brand shadow-inner"
    >
      <FolderUp class="size-8" />
      <span class="absolute inset-0 rounded-2xl ring-8 ring-brand/5" />
    </div>
    <h3 class="mt-5 text-base font-semibold">{{ title }}</h3>
    <p class="mt-1.5 text-sm text-muted-foreground max-w-sm leading-relaxed">
      {{ desc }}
    </p>
    <Button v-if="canUpload" class="mt-5" @click="$emit('upload')">
      <Upload class="size-4" />
      上传文件
    </Button>
    <div class="mt-4 text-[11px] text-muted-foreground">
      支持 PDF / Word / Excel / PPT / 图片 / Markdown · 单文件最大 50MB
    </div>
  </div>
</template>
