<!-- layouts/default.vue -->
<script setup lang="ts">
const { fetchMe } = useAuth();
await fetchMe(); // SSR: сработает на сервере, данные будут в state
</script>

<template>
  <div>
    <AppHeader />
    <NuxtPage />
  </div>
</template>
