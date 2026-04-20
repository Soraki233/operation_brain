import { ref, watch } from 'vue'
import type { KbFile, KbScope } from '@/types/knowledge'
import { knowledgeApi } from '@/api'

export function useFileList() {
  const items = ref<KbFile[]>([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(10)
  const keyword = ref('')
  const loading = ref(false)
  const error = ref<string | null>(null)

  const folderId = ref<string | null>(null)
  const scope = ref<KbScope>('personal')

  async function load() {
    if (!folderId.value) {
      items.value = []
      total.value = 0
      return
    }
    loading.value = true
    error.value = null
    try {
      const res = await knowledgeApi.listFiles({
        folderId: folderId.value,
        scope: scope.value,
        page: page.value,
        pageSize: pageSize.value,
        keyword: keyword.value || undefined,
      })
      items.value = res.items
      total.value = res.total
    } catch (e) {
      error.value = e instanceof Error ? e.message : '加载失败'
    } finally {
      loading.value = false
    }
  }

  function setFolder(id: string | null, s: KbScope) {
    folderId.value = id
    scope.value = s
    page.value = 1
    keyword.value = ''
    void load()
  }

  function changePage(p: number) {
    page.value = p
    void load()
  }

  function setKeyword(k: string) {
    keyword.value = k
    page.value = 1
    void load()
  }

  function refresh() {
    void load()
  }

  // auto-poll parsing files (light-weight)
  let timer: number | null = null
  watch(items, (list) => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    if (list.some((f) => f.status === 'parsing')) {
      timer = window.setTimeout(() => refresh(), 2200)
    }
  })

  return {
    items,
    total,
    page,
    pageSize,
    keyword,
    loading,
    error,
    folderId,
    scope,
    load,
    setFolder,
    changePage,
    setKeyword,
    refresh,
  }
}
