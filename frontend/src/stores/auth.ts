import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { clearToken, getToken, setToken } from '@/utils/request'
import type { LoginPayload, LoginResult, UserProfile } from '@/types/user'
import * as authApi from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(getToken() ?? '')
  const user = ref<UserProfile | null>(
    JSON.parse(localStorage.getItem('opsbrain_user') || 'null'),
  )

  const isAuthenticated = computed(() => !!token.value)

  function setAuth(payload: LoginResult) {
    token.value = payload.token
    user.value = payload.user
    setToken(payload.token)
    localStorage.setItem('opsbrain_user', JSON.stringify(payload.user))
  }

  async function login(payload: LoginPayload) {
    const result = await authApi.login(payload)
    setAuth(result)
    return result
  }

  function logout() {
    token.value = ''
    user.value = null
    clearToken()
    localStorage.removeItem('opsbrain_user')
  }

  return { token, user, isAuthenticated, setAuth, login, logout }
})
