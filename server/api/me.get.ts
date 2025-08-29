import { defineEventHandler } from "h3";
import { directusFetch } from "../utils/directusFetch";

export default defineEventHandler(async (event) => {
  // Получаем текущего пользователя из Directus
  const res: any = await directusFetch(event, "/users/me", {
    query: {
      // avatar нужен для построения ссылки
      fields: "id,first_name,last_name,email,role.name,avatar",
    },
  });

  // Directus обычно возвращает { data: {...} }
  const user = res?.data ?? res;

  const base = process.env.DIRECTUS_URL as string;
  const avatarId = typeof user?.avatar === "string" ? user.avatar : user?.avatar?.id;

  return {
    ...user,
    avatar_url: avatarId ? `${base}/assets/${avatarId}` : null,
  };
});
