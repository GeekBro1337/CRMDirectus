<script setup lang="ts">
const { me, fetchMe } = useAuth();

// Подстраховка на SSR/клиенте — если state пустой
if (!me.value) await fetchMe();

const displayName = computed(() => {
  const u = me.value;
  if (!u) return "";
  return u.first_name || u.last_name
    ? `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim()
    : u.email;
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
</script>

<template>
  <!-- Основной контейнер со светлой темой -->
  <div class="min-h-screen bg-white text-black">
    <UContainer class="py-8">
      <!-- Верхний блок с аватаром и именем -->
      <UCard class="border border-gray-200 bg-white shadow-sm">
        <div class="flex flex-col sm:flex-row sm:items-center gap-6">
          <UAvatar
            :src="me?.avatar_url || undefined"
            :alt="displayName"
            :text="!me?.avatar_url ? initials : undefined"
            size="xl"
            class="shrink-0"
          />

          <div class="flex-1">
            <h1 class="text-2xl font-semibold leading-tight text-gray-900">
              {{ displayName }}
            </h1>
            <p class="text-gray-600">{{ me?.email }}</p>
            <p v-if="me?.role?.name" class="text-gray-600">
              Роль: {{ me.role.name }}
            </p>
          </div>
        </div>
      </UCard>

      <!-- Детали -->
      <div class="mt-6 grid gap-6 md:grid-cols-2">
        <UCard class="border border-gray-200 bg-white shadow-sm">
          <template #header>
            <div class="font-medium text-gray-900">Общая информация</div>
          </template>
          <dl class="divide-y divide-gray-200">
            <div class="flex items-center justify-between py-3">
              <dt class="text-sm text-gray-500">ID</dt>
              <dd class="text-sm text-gray-900 ml-4 truncate max-w-[60%]">
                {{ me?.id }}
              </dd>
            </div>
            <div class="flex items-center justify-between py-3">
              <dt class="text-sm text-gray-500">Email</dt>
              <dd class="text-sm text-gray-900 ml-4">{{ me?.email }}</dd>
            </div>
            <div
              v-if="me?.first_name || me?.last_name"
              class="flex items-center justify-between py-3"
            >
              <dt class="text-sm text-gray-500">Имя</dt>
              <dd class="text-sm text-gray-900 ml-4">
                {{ (me?.first_name || "") + " " + (me?.last_name || "") }}
              </dd>
            </div>
          </dl>
        </UCard>

        <UCard class="border border-gray-200 bg-white shadow-sm">
          <template #header>
            <div class="font-medium text-gray-900">Безопасность</div>
          </template>
          <p class="text-sm text-gray-700">
            Смена пароля и двухфакторная аутентификация — скоро.
          </p>
        </UCard>
      </div>
    </UContainer>
  </div>
</template>
