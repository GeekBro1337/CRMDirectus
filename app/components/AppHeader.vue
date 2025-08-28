<!-- components/AppHeader.vue -->
<script setup lang="ts">
const { me, logout } = useAuth();

const initials = computed(() => {
  if (!me.value) return "";
  const fn = me.value.first_name || "";
  const ln = me.value.last_name || "";
  const email = me.value.email || "";
  const base = fn || ln ? `${fn} ${ln}` : email;
  return base
    .split("@")[0]
    .split(" ")
    .filter(Boolean)
    .map((s) => s[0]?.toUpperCase())
    .slice(0, 2)
    .join("");
});
</script>

<template>
  <header class="w-full border-b bg-white/70 backdrop-blur sticky top-0 z-50">
    <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
      <NuxtLink to="/" class="font-semibold">My App</NuxtLink>

      <div v-if="me" class="flex items-center gap-3">
        <div class="text-right leading-tight">
          <div class="font-medium">
            {{
              me.first_name || me.last_name
                ? me.first_name + " " + me.last_name
                : me.email
            }}
          </div>
          <div class="text-xs text-gray-500">{{ me.role?.name }}</div>
        </div>

        <!-- аватар/инициалы -->
        <div
          class="w-9 h-9 rounded-full bg-gray-900 text-white grid place-items-center"
        >
          {{ initials }}
        </div>

        <button
          @click="
            logout();
            navigateTo('/login');
          "
          class="ml-2 px-3 py-1.5 rounded bg-gray-900 text-white text-sm"
        >
          Выйти
        </button>
      </div>

      <div v-else>
        <NuxtLink
          to="/login"
          class="px-3 py-1.5 rounded bg-gray-900 text-white text-sm"
        >
          Войти
        </NuxtLink>
      </div>
    </div>
  </header>
</template>
