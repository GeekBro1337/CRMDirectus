export function useAuth() {
  const me = useState<any>("me", () => null);

  const login = async (email: string, password: string) => {
    await $fetch("/api/auth/login", {
      method: "POST",
      body: { email, password },
    });
    me.value = await $fetch("/api/me"); // подтягиваем профиль
  };

  const logout = async () => {
    await $fetch("/api/auth/logout", { method: "POST" });
    me.value = null;
  };

  const fetchUsersCustom = async (params?: Record<string, any>) => {
    // идём через серверный прокси (куки приложатся автоматически)
    const res: any = await $fetch("/api/users_custom", { query: params });
    return res.data ?? res; // в Directus обычно { data: [...] }
  };

  return { me, login, logout, fetchUsersCustom };
}
