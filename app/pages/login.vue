<script setup lang="ts">
const { login } = useAuth();
const form = reactive({ email: "", password: "" });
const err = ref<string | null>(null);

const submit = async () => {
  err.value = null;
  try {
    await login(form.email, form.password);
    return navigateTo("/");
  } catch (e: any) {
    err.value = e?.data?.errors?.[0]?.message || "Ошибка входа";
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 p-6">
    <form
      @submit.prevent="submit"
      class="w-full max-w-sm bg-white p-6 rounded-2xl shadow space-y-4"
    >
      <h1 class="text-2xl font-semibold">Вход</h1>
      <input
        v-model="form.email"
        type="email"
        placeholder="Email"
        class="w-full border rounded px-3 py-2"
      />
      <input
        v-model="form.password"
        type="password"
        placeholder="Пароль"
        class="w-full border rounded px-3 py-2"
      />
      <button class="w-full py-2 rounded bg-black text-white">Войти</button>
      <p v-if="err" class="text-red-600 text-sm">{{ err }}</p>
    </form>
  </div>
</template>
