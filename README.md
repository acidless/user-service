# User Service API

Сервис для управления пользователями с возможностью регистрации, авторизации, просмотра профиля и управления статусом.

## ✨ Возможности
- 🔐 Авторизация пользователей с JWT и cookies
- 👥 Получение списка пользлвателей
- 🚫 Блокировка пользователей
- ✅ Выдача роли

![Express](https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white&style=for-the-badge)
![TypeScript](https://shields.io/badge/TypeScript-3178C6?logo=TypeScript&logoColor=FFF&style=for-the-badge)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Prisma](https://img.shields.io/badge/SQLite-4169E1?logo=sqlite&logoColor=fff&style=for-the-badge)

## 🚀 Установка и запуск

1. Клонируйте репозиторий
```bash
git clone https://github.com/acidless/user-service.git
cd user-service
```
2. Установите зависимости
```bash
npm install
```
3. Вы можете настроить окружение, создав файл .env в корне проекта<br>
Параметры окружения по умолчанию:
```.env
PORT=3000
ADMIN_EMAIL=admin@example.com
SECRET=secret
```
4. Запуск сервера
```bash
npm start
```

## 📦 Модель пользователя

Каждый пользователь содержит следующие поля:

| Поле | Тип | Описание |
|------|-----|----------|
| id | number | Идентификатор |
| fullname | string | ФИО пользователя |
| email | string | Email, уникальное значение |
| password | string | Пароль (в хешированном виде) |
| role | string | Роль пользователя: `admin` или `user` |
| status | string | Статус пользователя: активен/не активен |

## 🔗 API Endpoints

### 1. Регистрация пользователя

**POST** `/api/users`  
**Тело запроса:**

```json
{
  "fullname": "Иван Иванов",
  "email": "ivan@example.com",
  "password": "securePassword"
}
```

**Ответ:**
```json
{
    "success": true,
    "user": {
        "id": 1,
        "email": "ivan@example.com",
        "fullname": "Иван Иванов",
        "role": "USER",
        "status": "ACTIVE"
    }
}
```
Для регистрации администратором нужно использовать почту из переменной окружения ADMIN_EMAIL 

### 2. Авторизация пользователя

**PATCH** `/api/users`  
**Тело запроса:**

```json
{
  "email": "ivan@example.com",
  "password": "securePassword"
}
```

**Ответ:**
```json
{
    "success": true,
    "user": {
        "id": 1,
        "email": "ivan@example.com",
        "fullname": "Иван Иванов",
        "role": "USER",
        "status": "ACTIVE"
    }
}
```

### 3. Получение пользователя по ID

**GET** `/api/users/:id`  
**Доступ:** админ или пользователь сам себя

**Ответ:**
```json
{
    "success": true,
    "user": {
        "id": 1,
        "email": "ivan@example.com",
        "fullname": "Иван Иванов",
        "role": "USER",
        "status": "ACTIVE"
    }
}
```

### 4. Получение списка пользователей

**GET** `/api/users`  
**Доступ:** только админ  

**Query параметры:**

| Параметр | Тип | Описание |
|-----------|-----|----------|
| page      | number | Номер страницы для постраничной выдачи (опционально, по умолчанию 0) |

**Ответ:**

```json
{
    "success": true,
    "users": [
      {
        "id": "user-id",
        "fullName": "Иван Иванов",
        "email": "ivan@example.com",
        "role": "USER",
        "status": "ACTIVE"
      },
      "..."
    ]
}
```

### 5. Блокировка пользователя

**DELETE** `/api/users/:id/`<br>
**Доступ:** админ или пользователь сам себя

### 6. Установка роли пользователю

**PATCH** `/api/users/:id/roles`<br>
**Доступ:** только админ

**Тело запроса:**

```jsonc
{
  "role": "ADMIN" // или "USER"
}
```

**Ответ:**

```json
{
  "success": true,
  "user": {
    "id": "123",
    "fullName": "Иван Иванов",
    "email": "ivan@example.com",
    "role": "ADMIN",
    "status": "ACTIVE"
  }
}
```

## 📜 Лицензия
MIT License © 2025
