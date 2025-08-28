export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === "/login") return;
  try {
    const me = await $fetch("/api/me");
    if (!me) return navigateTo("/login");
  } catch {
    return navigateTo("/login");
  }
});
