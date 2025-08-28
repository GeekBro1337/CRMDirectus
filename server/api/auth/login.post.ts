// Логин: принимает { email, password }, кладёт access/refresh в httpOnly cookies
import { defineEventHandler, readBody, setCookie } from "h3";

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody<{
    email: string;
    password: string;
  }>(event);
  const base = process.env.DIRECTUS_URL!;
  const res = await $fetch<{
    data: { access_token: string; refresh_token: string };
  }>(`${base}/auth/login`, { method: "POST", body: { email, password } });

  // httpOnly + secure (на prod включай secure: true)
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
