import { defineEventHandler, getQuery } from "h3";
import { directusFetch } from "../utils/directusFetch";

export default defineEventHandler(async (event) => {
  const q = getQuery(event); // пробрасываем фильтры если нужно
  return await directusFetch(event, "/items/users_custom", { query: q });
});
