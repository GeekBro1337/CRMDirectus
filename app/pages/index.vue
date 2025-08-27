<script setup lang="ts">
const { data: users, error } = await useAsyncData("all-users", () =>
  $fetch("http://localhost:8055/items/users_custom", {
    headers: {
      Authorization: "Bearer KSU4y09XAXyHZzX1LyEeKXwAickumCoR",
    },
  }).then((r: any) => r.data)
);

const admins = computed(() => users.value?.filter((u) => u.role === "Admin"));
const normalUsers = computed(() =>
  users.value?.filter((u) => u.role === "User")
);
</script>

<template>
  <div class="min-h-screen bg-gray-900 text-white p-8 space-y-10">
    <h1 class="text-3xl font-bold">Users Custom</h1>

    <!-- Admins -->
    <section>
      <h2 class="text-2xl font-semibold mb-4 text-red-400">Admins</h2>
      <div
        v-if="admins?.length"
        class="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        <div
          v-for="a in admins"
          :key="a.id"
          class="p-6 rounded-2xl shadow-lg bg-gray-800 hover:bg-gray-700 transition"
        >
          <h3 class="text-xl font-semibold">{{ a.username }}</h3>
          <p class="text-red-300">{{ a.role }}</p>
        </div>
      </div>
      <p v-else class="text-gray-400">Нет админов</p>
    </section>

    <!-- Users -->
    <section>
      <h2 class="text-2xl font-semibold mb-4 text-indigo-400">Users</h2>
      <div
        v-if="normalUsers?.length"
        class="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        <div
          v-for="u in normalUsers"
          :key="u.id"
          class="p-6 rounded-2xl shadow-lg bg-gray-800 hover:bg-gray-700 transition"
        >
          <h3 class="text-xl font-semibold">{{ u.username }}</h3>
          <p class="text-indigo-300">{{ u.role }}</p>
        </div>
      </div>
      <p v-else class="text-gray-400">Нет пользователей</p>
    </section>

    <p v-if="error" class="text-red-400">Ошибка: {{ error.message }}</p>
  </div>
</template>
