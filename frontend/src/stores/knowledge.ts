import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { KbNode, KbScope } from '@/types/knowledge'
import * as knowledgeApi from '@/api/knowledge'

export const useKnowledgeStore = defineStore('knowledge', () => {
  const scope = ref<KbScope>('personal')
  const personalTree = ref<KbNode[]>([])
  const sharedTree = ref<KbNode[]>([])
  const treeLoading = ref(false)

  const currentFolderId = ref<string | null>(null)
  const expandedIds = ref<Set<string>>(new Set())

  const currentTree = computed(() =>
    scope.value === 'personal' ? personalTree.value : sharedTree.value,
  )

  function flatten(nodes: KbNode[]): KbNode[] {
    const out: KbNode[] = []
    const walk = (list: KbNode[]) => {
      for (const n of list) {
        out.push(n)
        if (n.children?.length) walk(n.children)
      }
    }
    walk(nodes)
    return out
  }

  const currentNode = computed<KbNode | null>(() => {
    if (!currentFolderId.value) return null
    return flatten(currentTree.value).find((n) => n.id === currentFolderId.value) ?? null
  })

  function breadcrumb(): KbNode[] {
    if (!currentFolderId.value) return []
    const trail: KbNode[] = []
    const walk = (list: KbNode[], path: KbNode[]): boolean => {
      for (const n of list) {
        const next = [...path, n]
        if (n.id === currentFolderId.value) {
          trail.push(...next)
          return true
        }
        if (n.children?.length && walk(n.children, next)) return true
      }
      return false
    }
    walk(currentTree.value, [])
    return trail
  }

  async function loadTree(targetScope: KbScope = scope.value) {
    treeLoading.value = true
    try {
      const data = await knowledgeApi.getTree(targetScope)
      if (targetScope === 'personal') personalTree.value = data
      else sharedTree.value = data
      // default select first root if nothing selected
      if (!currentFolderId.value && data.length) {
        selectFolder(data[0].id)
        expandedIds.value.add(data[0].id)
      }
    } finally {
      treeLoading.value = false
    }
  }

  function setScope(next: KbScope) {
    if (scope.value === next) return
    scope.value = next
    currentFolderId.value = null
    expandedIds.value = new Set()
    void loadTree(next).then(() => {
      const root = currentTree.value[0]
      if (root) {
        currentFolderId.value = root.id
        expandedIds.value.add(root.id)
      }
    })
  }

  function selectFolder(id: string) {
    currentFolderId.value = id
  }

  function toggleExpand(id: string) {
    const s = new Set(expandedIds.value)
    if (s.has(id)) s.delete(id)
    else s.add(id)
    expandedIds.value = s
  }

  function expand(id: string) {
    if (!expandedIds.value.has(id)) {
      const s = new Set(expandedIds.value)
      s.add(id)
      expandedIds.value = s
    }
  }

  async function createFolder(parentId: string | null, name: string) {
    const node = await knowledgeApi.createFolder({ parentId, scope: scope.value, name })
    await loadTree()
    if (parentId) expand(parentId)
    return node
  }

  async function renameNode(id: string, name: string) {
    await knowledgeApi.renameNode({ id, scope: scope.value, name })
    await loadTree()
  }

  async function deleteNode(id: string) {
    await knowledgeApi.deleteNode({ id, scope: scope.value })
    if (currentFolderId.value === id) currentFolderId.value = null
    await loadTree()
  }

  return {
    scope,
    personalTree,
    sharedTree,
    currentTree,
    currentFolderId,
    currentNode,
    expandedIds,
    treeLoading,
    breadcrumb,
    loadTree,
    setScope,
    selectFolder,
    toggleExpand,
    expand,
    createFolder,
    renameNode,
    deleteNode,
  }
})
