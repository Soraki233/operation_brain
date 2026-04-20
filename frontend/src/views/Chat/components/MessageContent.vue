<script setup lang="ts">
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'
import { Check, Copy } from 'lucide-vue-next'
import { parseMarkdown, type MdBlock, type MdInline } from '../utils/markdownLite'

interface Props {
  content: string
  streaming?: boolean
}

const props = defineProps<Props>()

const blocks = computed<MdBlock[]>(() => parseMarkdown(props.content))

const copiedBlockIdx = ref<number | null>(null)
async function copyCode(code: string, idx: number) {
  try {
    await navigator.clipboard.writeText(code)
    copiedBlockIdx.value = idx
    toast.success('已复制代码')
    setTimeout(() => {
      if (copiedBlockIdx.value === idx) copiedBlockIdx.value = null
    }, 1500)
  } catch {
    toast.error('复制失败')
  }
}

function isStrong(inline: MdInline) {
  return inline.type === 'strong'
}
function isEm(inline: MdInline) {
  return inline.type === 'em'
}
function isCode(inline: MdInline) {
  return inline.type === 'code'
}
function isLink(inline: MdInline) {
  return inline.type === 'link'
}
</script>

<template>
  <div class="prose-message text-[14.5px] leading-[1.75] text-foreground/90 break-words">
    <template v-for="(block, bi) in blocks" :key="bi">
      <!-- heading -->
      <h1 v-if="block.type === 'h' && block.level === 1" class="text-xl font-semibold mt-3 mb-2">
        {{ block.text }}
      </h1>
      <h2 v-else-if="block.type === 'h' && block.level === 2" class="text-lg font-semibold mt-3 mb-2">
        {{ block.text }}
      </h2>
      <h3 v-else-if="block.type === 'h' && block.level === 3" class="text-base font-semibold mt-2 mb-1.5">
        {{ block.text }}
      </h3>

      <!-- paragraph -->
      <p v-else-if="block.type === 'p'" class="my-2 first:mt-0 last:mb-0">
        <template v-for="(inline, ii) in block.children" :key="ii">
          <strong v-if="isStrong(inline)" class="font-semibold text-foreground">{{ inline.value }}</strong>
          <em v-else-if="isEm(inline)" class="italic">{{ inline.value }}</em>
          <code
            v-else-if="isCode(inline)"
            class="mx-0.5 rounded bg-muted px-1.5 py-0.5 text-[0.85em] font-mono text-foreground"
          >{{ inline.value }}</code>
          <a
            v-else-if="isLink(inline)"
            :href="inline.href"
            target="_blank"
            rel="noreferrer"
            class="text-brand hover:underline"
          >{{ inline.value }}</a>
          <template v-else>{{ inline.value }}</template>
        </template>
      </p>

      <!-- unordered list -->
      <ul v-else-if="block.type === 'ul'" class="my-2 space-y-1 list-disc pl-5">
        <li v-for="(item, ii) in block.items" :key="ii">
          <template v-for="(inline, iii) in item" :key="iii">
            <strong v-if="isStrong(inline)" class="font-semibold text-foreground">{{ inline.value }}</strong>
            <em v-else-if="isEm(inline)" class="italic">{{ inline.value }}</em>
            <code
              v-else-if="isCode(inline)"
              class="mx-0.5 rounded bg-muted px-1.5 py-0.5 text-[0.85em] font-mono"
            >{{ inline.value }}</code>
            <a
              v-else-if="isLink(inline)"
              :href="inline.href"
              target="_blank"
              rel="noreferrer"
              class="text-brand hover:underline"
            >{{ inline.value }}</a>
            <template v-else>{{ inline.value }}</template>
          </template>
        </li>
      </ul>

      <!-- ordered list -->
      <ol v-else-if="block.type === 'ol'" class="my-2 space-y-1 list-decimal pl-5">
        <li v-for="(item, ii) in block.items" :key="ii">
          <template v-for="(inline, iii) in item" :key="iii">
            <strong v-if="isStrong(inline)" class="font-semibold text-foreground">{{ inline.value }}</strong>
            <em v-else-if="isEm(inline)" class="italic">{{ inline.value }}</em>
            <code
              v-else-if="isCode(inline)"
              class="mx-0.5 rounded bg-muted px-1.5 py-0.5 text-[0.85em] font-mono"
            >{{ inline.value }}</code>
            <a
              v-else-if="isLink(inline)"
              :href="inline.href"
              target="_blank"
              rel="noreferrer"
              class="text-brand hover:underline"
            >{{ inline.value }}</a>
            <template v-else>{{ inline.value }}</template>
          </template>
        </li>
      </ol>

      <!-- code block -->
      <div
        v-else-if="block.type === 'code'"
        class="my-3 rounded-xl border bg-[#0f172a] text-slate-100 dark:bg-black/40 overflow-hidden group"
      >
        <div class="flex items-center justify-between px-3 py-1.5 border-b border-white/10 bg-white/5 text-[11px] text-slate-300">
          <span class="font-mono uppercase tracking-wider">{{ block.lang || 'text' }}</span>
          <button
            class="inline-flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-white/10 transition-colors cursor-pointer"
            @click="copyCode(block.code, bi)"
          >
            <Check v-if="copiedBlockIdx === bi" class="size-3" />
            <Copy v-else class="size-3" />
            {{ copiedBlockIdx === bi ? '已复制' : '复制' }}
          </button>
        </div>
        <pre class="m-0 overflow-x-auto ob-scrollbar p-3 text-[12.5px] leading-relaxed font-mono"><code>{{ block.code }}</code></pre>
      </div>

      <!-- quote -->
      <blockquote
        v-else-if="block.type === 'quote'"
        class="my-3 border-l-2 border-brand/40 bg-brand-soft/30 px-3 py-2 text-sm italic text-muted-foreground"
      >
        <template v-for="(inline, ii) in block.children" :key="ii">
          <template v-if="isStrong(inline)"><strong>{{ inline.value }}</strong></template>
          <template v-else-if="isEm(inline)"><em>{{ inline.value }}</em></template>
          <template v-else>{{ (inline as { value: string }).value }}</template>
        </template>
      </blockquote>

      <!-- divider -->
      <hr v-else-if="block.type === 'divider'" class="my-3 border-border" />
    </template>

    <!-- Streaming caret -->
    <span
      v-if="streaming"
      class="inline-block w-[2px] h-[1.1em] align-[-0.2em] bg-brand ml-0.5 animate-pulse"
    />
  </div>
</template>
