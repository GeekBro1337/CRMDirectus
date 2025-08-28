import { defineEventHandler, getCookie, setCookie } from "h3";

export default defineEventHandler(async (event) => {
  const refresh = getCookie(event, "refresh_token");
  const base = process.env.DIRECTUS_URL!;
  if (refresh) {
    try {
      await $fetch(`${base}/auth/logout`, {
        method: "POST",
        body: { refresh_token: refresh },
      });
    } catch {
      /* ignore */
    }
  }
  // очистка куков
  setCookie(event, "access_token", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  setCookie(event, "refresh_token", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return { ok: true };
});
