<script setup lang="ts">
const { fetchUsersCustom, logout } = useAuth();
const {
  data: rows,
  refresh,
  error,
} = await useAsyncData("users_custom", () => fetchUsersCustom());

const admins = computed(() =>
  (rows.value || []).filter((x: any) => x.role === "Admin")
);
const users = computed(() =>
  (rows.value || []).filter((x: any) => x.role === "User")
);
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-8 space-y-8">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Users Custom</h1>
      <button
        @click="
          logout();
          navigateTo('/login');
        "
        class="px-3 py-2 rounded bg-gray-900 text-white"
      >
        Выйти
      </button>
    </div>

    <section>
      <h2 class="text-xl font-semibold mb-3">Admins</h2>
      <div
        v-if="admins.length"
        class="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        <div
          v-for="a in admins"
          :key="a.id"
          class="p-4 rounded-xl bg-white shadow"
        >
          <div class="font-medium">{{ a.username }}</div>
          <div class="text-sm text-gray-500">{{ a.role }}</div>
        </div>
      </div>
      <p v-else class="text-gray-500">Нет админов</p>
    </section>

    <section>
      <h2 class="text-xl font-semibold mb-3">Users</h2>
      <div v-if="users.length" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="u in users"
          :key="u.id"
          class="p-4 rounded-xl bg-white shadow"
        >
          <div class="font-medium">{{ u.username }}</div>
          <div class="text-sm text-gray-500">{{ u.role }}</div>
        </div>
      </div>
      <p v-else class="text-gray-500">Нет пользователей</p>

      <p v-if="error" class="text-red-600 mt-6">Ошибка: {{ error.message }}</p>
    </section>
  </div>
</template>
