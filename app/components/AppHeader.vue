<!-- components/AppHeader.vue -->
<script setup lang="ts">
const { me, logout } = useAuth();

const displayName = computed(() => {
  const u = me.value;
  if (!u) return "";
  return u.first_name || u.last_name ? `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() : u.email;
});

const initials = computed(() => {
  const base = displayName.value || me.value?.email || "";
  return base
    .split("@")[0]
    .split(" ")
    .filter(Boolean)
    .map((s) => s[0]?.toUpperCase())
    .slice(0, 2)
    .join("");
});

const onLogout = async () => {
  await logout();
  navigateTo('/login');
};

// При клике на аватар переходим в личный кабинет
</script>

<template>
  <header class="sticky top-0 z-50 border-b bg-white/70 text-black backdrop-blur supports-[backdrop-filter]:bg-white/60">
    <UContainer class="h-14 flex items-center justify-between">
      <NuxtLink to="/" class="flex items-center gap-2 font-semibold text-black">
        <UIcon name="i-simple-icons-nuxtdotjs" class="w-5 h-5 text-emerald-600" />
        <span>CRM</span>
      </NuxtLink>

      <div v-if="me" class="flex items-center gap-3">
        <div class="hidden sm:block text-right leading-tight">
          <div class="font-medium">{{ displayName }}</div>
          <div class="text-xs text-gray-500">{{ me.email }}</div>
        </div>

        <UButton to="/profile" color="neutral" variant="ghost" class="p-0 rounded-full" aria-label="Открыть профиль">
          <UAvatar
            :src="me.avatar_url || undefined"
            :alt="displayName"
            :text="!me.avatar_url ? initials : undefined"
            size="md"
          />
        </UButton>

        <UButton color="neutral" variant="ghost" class="hidden sm:inline-flex" @click="onLogout">
          Выйти
        </UButton>
      </div>

      <div v-else>
        <UButton to="/login" color="primary">Войти</UButton>
      </div>
    </UContainer>
  </header>

</template>
