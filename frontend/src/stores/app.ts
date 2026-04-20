import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref<boolean>(
    localStorage.getItem('opsbrain_sidebar_collapsed') === '1',
  )
  const theme = ref<'light' | 'dark'>(
    (localStorage.getItem('opsbrain_theme') as 'light' | 'dark') || 'light',
  )

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
    localStorage.setItem('opsbrain_sidebar_collapsed', sidebarCollapsed.value ? '1' : '0')
  }

  function setTheme(value: 'light' | 'dark') {
    theme.value = value
    localStorage.setItem('opsbrain_theme', value)
    if (value === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }

  function initTheme() {
    setTheme(theme.value)
  }

  return { sidebarCollapsed, theme, toggleSidebar, setTheme, initTheme }
})
