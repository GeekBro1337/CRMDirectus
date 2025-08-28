import { defineEventHandler, getCookie, setCookie } from "h3";

export default defineEventHandler(async (event) => {
  const refresh = getCookie(event, "refresh_token");
  if (!refresh) return { ok: false };

  const base = process.env.DIRECTUS_URL!;
  const res = await $fetch<{
    data: { access_token: string; refresh_token: string };
  }>(`${base}/auth/refresh`, {
    method: "POST",
    body: { refresh_token: refresh },
  });

  setCookie(event, "access_token", res.data.access_token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  setCookie(event, "refresh_token", res.data.refresh_token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  return { ok: true };
});
