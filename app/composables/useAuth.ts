export function useAuth() {
  const me = useState<any>('me', () => null)

  const fetchMe = async () => {
    try {
      const headers = process.server ? useRequestHeaders(['cookie']) : undefined
      me.value = await $fetch('/api/me', { headers })
    } catch {
      me.value = null
    }
  }

  const login = async (email: string, password: string) => {
    await $fetch('/api/auth/login', { method: 'POST', body: { email, password } })
    await fetchMe()
  }

  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' })
    me.value = null
  }

  const fetchUsersCustom = async (params?: Record<string, any>) => {
    const headers = process.server ? useRequestHeaders(['cookie']) : undefined
    const res: any = await $fetch('/api/users_custom', { query: params, headers })
    return res?.data ?? res
  }

  return { me, fetchMe, login, logout, fetchUsersCustom }
}

