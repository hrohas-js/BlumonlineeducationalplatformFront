# Blum Education API

Базовый URL: `https://api.blumteam.ru/api/v1`

Swagger (dev): `https://api.blumteam.ru/docs`

---

## Авторизация

После логина приходят два токена. `access_token` живёт ~30 минут — идёт в каждый запрос заголовком `Authorization: Bearer <token>`. `refresh_token` живёт 30 дней — используется только для обновления access.

```
POST /auth/login
{ "email", "password" }

→ {
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "user": {
      "id", "email", "first_name", "last_name",
      "role",           ← "student", "user" (legacy) или "admin"
      "email_verified",
      "has_paid"
    }
  }
```

Когда access протух (401) — обновляй:
```
POST /auth/refresh
{ "refresh_token": "eyJ..." }

→ { "access_token": "eyJ...", "refresh_token": "eyJ..." }
```

Если и refresh протух (401) — отправляй на логин.

---

## Регистрация

```
POST /auth/register
{ "email", "password", "first_name", "last_name" }
→ 201, { "user_id", "email", "message" }
```

На почту придёт письмо со ссылкой. Токен из query-параметра `?token=` подтверждаешь:
```
POST /auth/verify-email
{ "token": "eyJ..." }
→ объект пользователя
```

Письмо не дошло:
```
POST /auth/resend-verification
{ "email" }
```

---

## Сброс пароля

```
POST /auth/forgot-password
{ "email" }
→ 200 (всегда, даже если email не найден — защита от перебора)

POST /auth/reset-password
{ "token": "eyJ...", "new_password" }
→ закрывает все сессии

POST /auth/change-password  🔒
{ "old_password", "new_password" }
→ закрывает все сессии
```

---

## Профиль

```
GET /auth/me  🔒✉️
→ {
    id, email, first_name, last_name, middle_name, phone, about,
    role, email_verified, has_paid, avatar_url, created_at, updated_at
  }

PATCH /auth/me  🔒✉️
{
  "first_name"?: string,
  "last_name"?: string,
  "phone"?: string,
  "about"?: string,
  "avatar_url"?: string
}
→ объект пользователя (как в GET /auth/me)
```

---

## Выход

```
POST /auth/logout       🔒   { "refresh_token" }   — текущая сессия
POST /auth/logout-all   🔒                          — все сессии
```

---

## Каталог курсов

Публичный, авторизация не нужна.

```
GET /products
GET /products?product_type=course    ← course | webinar | project
GET /products?skip=0&limit=20

→ {
    "items": [{ id, product_type, title, description, price, image_url, is_published }],
    "total", "skip", "limit"
  }
```

---

## Покупка курса

```
POST /payments/create
{ "product_id", "email", "payment_type": "purchase" }

→ { "payment_url": "https://robokassa...", "inv_id": 42 }
```

Редиректишь пользователя на `payment_url`. После оплаты Robokassa сама вызывает сервер и открывает доступ. Затем возвращает пользователя на:
- успех → `/payment/success?InvId=42`
- ошибка → `/payment/fail?InvId=42`

Проверить итог:
```
GET /payments/success?InvId=42
→ { "status": "success", "payment": { id, amount, status, ... } }

GET /payments/fail?InvId=42
→ { "status": "failed", "payment": { ... } }
```

---

## Мои курсы

```
GET /products/my-courses  🔒
→ [{ id, product_type, title, description, price, image_url }]
```

Курсы, к которым открыт доступ (не завершённые).

---

## Содержимое курса

```
GET /products/{id}  🔒

→ {
    id, title, description, price,
    "modules": [{
      id, title, order_index,
      "lessons": [{
        id, title, description, order_index,
        "video_url": "https://s3...?X-Amz-Signature=...",   ← signed URL ~1 час
        "files": [{
          id, file_name, file_type, file_size,
          "file_url": "https://s3...?X-Amz-Signature=..."   ← signed URL ~1 час
        }]
      }]
    }]
  }
```

`video_url` и `file_url` — готовые ссылки, ничего дополнительно запрашивать не нужно. Передаёшь напрямую в плеер или `<a href>`. Живут ~1 час, после истечения просто заново запросить `/products/{id}`.

---

## Прогресс

```
POST /products/lessons/{id}/complete  🔒
{ "watch_time": 600 }    ← секунды просмотра, необязательно
→ { id, lesson_id, is_completed, completed_at, watch_time }

GET /products/{id}/progress  🔒
→ {
    product_id, total_lessons, completed_lessons, progress_percent,
    deadline, days_left,
    "modules": [{
      module_id, title,
      "lessons": [{ id, title, is_completed, completed_at, watch_time }]
    }]
  }
```

---

## История платежей и продление

```
GET /payments/history  🔒
→ { "payments": [{ id, product_id, amount, status, payment_type, created_at }], total }

POST /payments/renew  🔒
{ "product_id" }
→ { "payment_url", "inv_id" }    ← то же что /payments/create
```

---

## Администратор

Все запросы ниже требуют `role = "admin"`.

### Курс

```
POST   /admin/products
       { product_type, title, description, price, is_published: false }
       → ProductResponse

GET    /admin/products?product_type=&is_published=&skip=&limit=
GET    /admin/products/{id}           ← с модулями и уроками
PUT    /admin/products/{id}           { title?, description?, price?, is_published? }
DELETE /admin/products/{id}

POST   /admin/products/{id}/image     multipart/form-data, поле: file
       → { file_url, file_name, file_size, file_type }
```

### Модули

```
POST   /admin/products/{course_id}/modules          { title, description }
PUT    /admin/products/modules/{id}                 { title?, description? }
DELETE /admin/products/modules/{id}
PUT    /admin/products/{course_id}/modules/reorder
       { "modules": [{ module_id, order_index }] }
POST   /admin/products/modules/{id}/copy            { target_product_id }
```

### Уроки

```
POST   /admin/products/modules/{module_id}/lessons  { title, description, video_url? }
PUT    /admin/products/lessons/{id}                 { title?, description?, video_url? }
DELETE /admin/products/lessons/{id}
PUT    /admin/products/modules/{id}/lessons/reorder
       { "lessons": [{ lesson_id, order_index }] }
POST   /admin/products/lessons/{id}/copy            { target_module_id }

POST   /admin/products/lessons/{id}/video   multipart/form-data, поле: file
POST   /admin/products/lessons/{id}/files   multipart/form-data, поле: file
DELETE /admin/products/files/{id}
```

### Доступы

```
POST   /admin/products/users/{user_id}/access
       {
         product_id,
         access_type: "immediate" | "delayed" | "manual",
         delay_days,     ← только для delayed
         deadline        ← до когда (необязательно)
       }

POST   /admin/products/users/{uid}/products/{pid}/grant-access
       ← вручную открыть доступ для access_type: manual

PUT    /admin/products/users/{uid}/products/{pid}/deadline
       { "deadline": "2026-12-31T00:00:00Z" }

DELETE /admin/products/users/{uid}/products/{pid}

GET    /admin/products/{id}/students?skip=&limit=
       → { items: [{ user_id, email, first_name, last_name, access_type,
                      access_granted_at, deadline, is_completed, progress_percent }], total }

GET    /admin/products/{id}/students/export    ← скачать CSV
```

### Платежи

```
GET /admin/payments?status_filter=&limit=&offset=
GET /admin/payments/successful
GET /admin/payments/pending
GET /admin/payments/user/{email}
```

---

## Ошибки

```json
{ "error": { "code": "...", "message": "..." } }
```

| code | HTTP | |
|---|---|---|
| `invalid_credentials` | 401 | Неверный пароль |
| `invalid_token` | 401 | Токен протух → рефреш |
| `email_not_verified` | 403 | Email не подтверждён |
| `permission_denied` | 403 | Нет доступа к курсу / не admin |
| `not_found` | 404 | Объект не найден |
| `email_already_exists` | 409 | Email уже зарегистрирован |
| `validation_error` | 400 | Неверный формат данных |
| `rate_limited` | 429 | Слишком много запросов |

---

## Обозначения

```
🔒  — нужен Authorization: Bearer <access_token>
✉️  — нужен подтверждённый email
```
