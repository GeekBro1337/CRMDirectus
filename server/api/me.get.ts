import { defineEventHandler } from "h3";
import { directusFetch } from "../utils/directusFetch";

export default defineEventHandler(async (event) => {
  return await directusFetch(event, "/users/me");
});
