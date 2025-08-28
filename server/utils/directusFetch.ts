import type { H3Event } from "h3";
import { getCookie, setCookie } from "h3";

export async function directusFetch<T = any>(
  event: H3Event,
  path: string,
  opts: any = {}
): Promise<T> {
  const base = process.env.DIRECTUS_URL!;
  const access = getCookie(event, "access_token");
  try {
    return await $fetch<T>(`${base}${path}`, {
      ...opts,
      headers: { ...(opts.headers || {}), Authorization: `Bearer ${access}` },
    });
  } catch (e: any) {
    // если 401 — пробуем refresh и повтор
    if (e?.status === 401) {
      const refresh = getCookie(event, "refresh_token");
      if (!refresh) throw e;
      const rr = await $fetch<{
        data: { access_token: string; refresh_token: string };
      }>(`${base}/auth/refresh`, {
        method: "POST",
        body: { refresh_token: refresh },
      });
      setCookie(event, "access_token", rr.data.access_token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
      setCookie(event, "refresh_token", rr.data.refresh_token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
      return await $fetch<T>(`${base}${path}`, {
        ...opts,
        headers: {
          ...(opts.headers || {}),
          Authorization: `Bearer ${rr.data.access_token}`,
        },
      });
    }
    throw e;
  }
}
