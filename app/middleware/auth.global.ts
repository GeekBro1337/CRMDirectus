export default defineNuxtRouteMiddleware(async (to) => {
  // Не проверяем авторизацию на странице логина
  if (to.path === "/login") return;

  // Используем общее состояние авторизации
  const { me, fetchMe } = useAuth();

  // Если данных нет — пытаемся получить их один раз
  if (!me.value) {
    try {
      await fetchMe();
    } catch {
      // игнорируем — обработаем ниже
    }
  }

  // Если после запроса пользователя все еще нет — отправляем на логин
  if (!me.value) return navigateTo("/login");
});
