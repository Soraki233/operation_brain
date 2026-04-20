<script setup lang="ts">
import { Flame, Droplets, Wind, ShieldAlert, Zap } from 'lucide-vue-next'

interface Suggestion {
  icon: typeof Flame
  title: string
  desc: string
  prompt: string
}

const suggestions: Suggestion[] = [
  {
    icon: Flame,
    title: '炉膛工况异常',
    desc: '炉膛出口温度跌到 830℃ 以下，怎么处置？',
    prompt: '炉膛出口温度持续低于 850℃，请按照规程给我一份快速处置思路，最好附带配风调节建议。',
  },
  {
    icon: Droplets,
    title: '汽包水位保护',
    desc: '汽包水位三取二逻辑和低 II 值联锁',
    prompt: '请介绍一下余热锅炉汽包水位三级保护逻辑，低 II 值联锁哪些动作？',
  },
  {
    icon: Wind,
    title: '烟气净化调整',
    desc: 'NOx 偏高但氨逃逸也偏高怎么办？',
    prompt: 'NOx 排口数据在 120mg 左右，但氨逃逸偏高，怎样调整 SNCR 喷氨量？',
  },
  {
    icon: ShieldAlert,
    title: '应急预案查阅',
    desc: '锅炉爆管 / 全厂停电等关键预案',
    prompt: '请给我《锅炉爆管事故应急预案》的关键处置步骤，值班员第一时间要做什么？',
  },
]

const emit = defineEmits<{ (e: 'pick', prompt: string): void }>()
</script>

<template>
  <div class="mx-auto w-full max-w-[820px] py-10 px-6">
    <div class="flex flex-col items-center text-center">
      <div class="relative">
        <div class="absolute inset-0 rounded-full brand-gradient blur-2xl opacity-40" />
        <div class="relative size-14 rounded-2xl brand-gradient flex items-center justify-center text-brand-foreground shadow-lg">
          <Zap class="size-6" />
        </div>
      </div>
      <h2 class="mt-5 text-2xl font-semibold tracking-tight">
        问 OpsBrain · 运行助手
      </h2>
      <p class="mt-2 text-sm text-muted-foreground max-w-lg">
        选择一个知识库（焚烧炉 / 锅炉 / 汽轮机 / 烟气净化等），然后在下方描述你遇到的工况或需要查阅的章节，AI 会基于规程给出带引用出处的答复。
      </p>
    </div>

    <div class="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
      <button
        v-for="(s, i) in suggestions"
        :key="i"
        class="group text-left rounded-xl border bg-card p-4 hover:border-brand/40 hover:bg-brand-soft/40 transition-all card-hover cursor-pointer"
        @click="emit('pick', s.prompt)"
      >
        <div class="flex items-center gap-2">
          <div class="size-8 rounded-lg bg-brand-soft text-brand-soft-foreground flex items-center justify-center group-hover:bg-brand group-hover:text-brand-foreground transition-colors">
            <component :is="s.icon" class="size-4" />
          </div>
          <div class="text-sm font-medium">{{ s.title }}</div>
        </div>
        <p class="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {{ s.desc }}
        </p>
      </button>
    </div>
  </div>
</template>
