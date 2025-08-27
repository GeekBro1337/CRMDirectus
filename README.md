# Directus + PostgreSQL + Schema-as-Code (+ Nuxt пример)

## 0) Что нужно

- Docker + Docker Compose
- Git (по желанию)
- Postman (удобно для проверки API)
- Windows/PowerShell или Linux/macOS (команды дам для обоих)

---

## 1) Структура проекта

```
CRMDirectus/
├─ .env                 # переменные окружения (БД/Directus)
├─ docker-compose.yml   # Postgres + Directus
├─ snapshots/           # тут храним schema.yaml (snapshot)
└─ README.md
```

---

## 2) Создай `.env`

```env
# Postgres
POSTGRES_USER=directus
POSTGRES_PASSWORD=directus123
POSTGRES_DB=directus

# Directus (админ создастся при первом старте)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeMe!123

# Хост/порт приложения
PUBLIC_URL=http://localhost:8055
PORT=8055

# Секреты Directus (сгенерируй свои: `openssl rand -hex 32`)
KEY=dev_key_change_me_please_1234567890
SECRET=dev_secret_change_me_please_1234567890

# Таймзона
TZ=Asia/Almaty
```

> На проде ОБЯЗАТЕЛЬНО поменяй `KEY/SECRET/пароли`.

---

## 3) `docker-compose.yml`

```yaml
name: directus-stack

services:
  database:
    image: postgres:16
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
      TZ: ${TZ}
    volumes:
      - db_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB"]
      interval: 10s
      timeout: 5s
      retries: 5

  directus:
    image: directus/directus:11.6.0 # можешь закрепить 11.x, позже обновишь
    restart: unless-stopped
    depends_on:
      database:
        condition: service_healthy
    ports:
      - "${PORT}:8055"
    environment:
      # БД
      DB_CLIENT: pg
      DB_HOST: database
      DB_PORT: 5432
      DB_DATABASE: ${POSTGRES_DB}
      DB_USER: ${POSTGRES_USER}
      DB_PASSWORD: ${POSTGRES_PASSWORD}
      # Directus
      ADMIN_EMAIL: ${ADMIN_EMAIL}
      ADMIN_PASSWORD: ${ADMIN_PASSWORD}
      PUBLIC_URL: ${PUBLIC_URL}
      KEY: ${KEY}
      SECRET: ${SECRET}
      WEBSOCKETS_ENABLED: "true"
      LOG_LEVEL: info
      TZ: ${TZ}
      CORS_ENABLED: "true"
      CORS_ORIGIN: "*"
    volumes:
      - directus_uploads:/directus/uploads
      - directus_extensions:/directus/extensions
      # Храним snapshot локально, чтобы редактировать в VS Code
      - ./snapshots:/directus/snapshots

volumes:
  db_data:
  directus_uploads:
  directus_extensions:
```

> **Важно:** не смешивай одновременно именованный и bind-том на один путь (`/directus/snapshots`). Используем только bind `./snapshots`.

---

## 4) Запуск контейнеров

Создай папку для snapshot (Windows/PowerShell):

```powershell
mkdir snapshots
```

Старт:

```powershell
docker compose up -d
```

Проверь:

- Directus: `http://localhost:8055`
- Логи: `docker compose logs -f directus` (Ctrl+C для выхода)

Первый вход: `admin@example.com` / `ChangeMe!123`

---

## 5) Схема как код (Schema-as-Code)

### 5.1. Снять текущий снимок схемы

```powershell
docker compose exec directus npx directus schema snapshot /directus/snapshots/schema.yaml
```

Файл появится в `./snapshots/schema.yaml`.

### 5.2. Отредактировать `snapshots/schema.yaml`

Пример коллекции `users_custom` с полями `id / username / role`:

```yaml
version: 1
directus: 11.6.0
vendor: postgres

collections:
  - collection: users_custom
    meta:
      collection: users_custom
      hidden: false
      singleton: false
    schema:
      name: users_custom
      comment: "Custom users table"

fields:
  - collection: users_custom
    field: id
    type: integer
    schema:
      name: id
      is_primary_key: true
      is_nullable: false
      has_auto_increment: true

  - collection: users_custom
    field: username
    type: string
    schema:
      name: username
      is_nullable: false

  - collection: users_custom
    field: role
    type: string
    schema:
      name: role
      is_nullable: false

relations: []
```

_(Права добавим ниже; для прав нужен UUID роли.)_

### 5.3. Применить изменения

В 11.6 нет `schema diff`, сразу делаем apply:

```powershell
docker compose exec directus npx directus schema apply /directus/snapshots/schema.yaml
```

Команда покажет план изменений, спросит подтверждение → отвечай `Yes`.

---

## 6) Права доступа (Roles/Permissions/Policies)

### 6.1. Узнать UUID роли Administrator

Через Postgres (используем твои креды из `.env`):

```powershell
docker compose exec database psql -U directus -d directus -c "SELECT id,name FROM directus_roles;"
```

Скопируй UUID для `Administrator`, например:

```
2034febb-f59f-47a0-bede-5bf1de1031ec
```

### 6.2. Добавить права администратору в `schema.yaml`

Добавь блок:

```yaml
permissions:
  - role: 2034febb-f59f-47a0-bede-5bf1de1031ec
    collection: users_custom
    action: read
    permissions: {}
  - role: 2034febb-f59f-47a0-bede-5bf1de1031ec
    collection: users_custom
    action: create
    permissions: {}
  - role: 2034febb-f59f-47a0-bede-5bf1de1031ec
    collection: users_custom
    action: update
    permissions: {}
  - role: 2034febb-f59f-47a0-bede-5bf1de1031ec
    collection: users_custom
    action: delete
    permissions: {}
```

Снова:

```powershell
docker compose exec directus npx directus schema apply /directus/snapshots/schema.yaml
```

> Альтернатива: Права можно выдать через UI: **Settings → Roles & Permissions → Administrator → users_custom**.

### 6.3. (Опционально) Роль/политика для API

Через UI:

1. **Settings → User Roles → Create Role**: `API`
2. **Settings → Access Policies → Create**: `API Permission`

   - Subject: Role = `API`
   - Collections: `users_custom` → **Read**
   - (по желанию) Filter: `role = Superman` — токен будет видеть только этих пользователей.

3. **Users → Create User**: `api@local.dev`, Role = `API`, Status = Active
4. Открой пользователя → **Token → Generate** → скопируй → **Save**

Теперь токеном `API`-пользователя можно безопасно читать из твоего фронта.

---

## 7) Проверка API (Postman)

**Кто я?**

```
GET http://localhost:8055/users/me
Authorization: Bearer <STATIC_TOKEN_ИЛИ_JWT>
```

**Все пользователи (кастомная коллекция):**

```
GET http://localhost:8055/items/users_custom
Authorization: Bearer <TOKEN>
```

**Фильтр по роли:**

```
GET http://localhost:8055/items/users_custom?filter[role][_eq]=Superman
Authorization: Bearer <TOKEN>
```

> Если хочешь без токена — в роли **Public** выдай `Read` на `users_custom`.

**Получить JWT вместо статик-токена:**

```
POST http://localhost:8055/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "ChangeMe!123"
}
```

Дальше используй `data.access_token` как Bearer.

---

## 8) Nuxt: пример главной страницы (Admins + Users)

`pages/index.vue`:

```vue
<script setup lang="ts">
const { data: rows, error } = await useAsyncData("all-users", () =>
  $fetch("http://localhost:8055/items/users_custom", {
    headers: { Authorization: `Bearer ${import.meta.env.VITE_DIRECTUS_TOKEN}` },
  }).then((r: any) => r.data)
);

const admins = computed(() =>
  rows.value?.filter((x: any) => x.role === "Admin")
);
const users = computed(() => rows.value?.filter((x: any) => x.role === "User"));
</script>

<template>
  <div class="min-h-screen bg-gray-900 text-white p-8 space-y-10">
    <h1 class="text-3xl font-bold">Users Custom</h1>

    <section>
      <h2 class="text-2xl font-semibold mb-4 text-red-400">Admins</h2>
      <div
        v-if="admins?.length"
        class="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        <div
          v-for="a in admins"
          :key="a.id"
          class="p-6 rounded-2xl shadow-lg bg-gray-800 hover:bg-gray-700"
        >
          <h3 class="text-xl font-semibold">{{ a.username }}</h3>
          <p class="text-red-300">{{ a.role }}</p>
        </div>
      </div>
      <p v-else class="text-gray-400">Нет админов</p>
    </section>

    <section>
      <h2 class="text-2xl font-semibold mb-4 text-indigo-400">Users</h2>
      <div
        v-if="users?.length"
        class="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        <div
          v-for="u in users"
          :key="u.id"
          class="p-6 rounded-2xl shadow-lg bg-gray-800 hover:bg-gray-700"
        >
          <h3 class="text-xl font-semibold">{{ u.username }}</h3>
          <p class="text-indigo-300">{{ u.role }}</p>
        </div>
      </div>
      <p v-else class="text-gray-400">Нет пользователей</p>

      <p v-if="error" class="text-red-400 mt-6">Ошибка: {{ error.message }}</p>
    </section>
  </div>
</template>
```

`.env` для Nuxt:

```
VITE_DIRECTUS_TOKEN=<STATIC_TOKEN_API_USER>
```

---

## 9) Резервные копии БД

**Бэкап:**

```powershell
docker compose exec -T database pg_dump -U ${POSTGRES_USER} -d ${POSTGRES_DB} > backup.sql
```

**Восстановление:**

```powershell
type backup.sql | docker compose exec -T database psql -U ${POSTGRES_USER} -d ${POSTGRES_DB}
```

---

## 10) Обновление Directus

1. Поменяй тег образа (например, `directus/directus:11.10.2`).
2. Перезапуск:

```powershell
docker compose pull
docker compose up -d
```

3. Проверяй логи Directus.

---

## 11) Частые ошибки

- **database unhealthy** → смотри `docker compose logs -f database`; проверь пароль/том.
- **EACCES при snapshot** → нет прав на `/directus/snapshots`; создай локальную папку `./snapshots` и монтируй bind.
- **Invalid protocol: get http** в Postman → не пиши `GET` в строке URL; метод выбирается слева.
- **401 INVALID_CREDENTIALS** → токен неверный/не сохранён; проверь `GET /users/me`.
- **403 FORBIDDEN** → нет прав на коллекцию; проверь роли/политики.
- **/schema/snapshot не существует** → это нормально для OSS; используй CLI (`npx directus schema ...` внутри контейнера).

---

## 12) Полезные команды

```powershell
# Логи
docker compose logs -f directus
docker compose logs -f database

# Снимок/применение схемы
docker compose exec directus npx directus schema snapshot /directus/snapshots/schema.yaml
docker compose exec directus npx directus schema apply    /directus/snapshots/schema.yaml

# Войти в БД (psql)
docker compose exec database psql -U directus -d directus

# Узнать UUID роли администратора
docker compose exec database psql -U directus -d directus -c "SELECT id,name FROM directus_roles;"
```
