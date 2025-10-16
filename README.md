# User Service API

A service for managing users with the ability to register, log in, view profiles, and manage status.

## ✨ Features
- 🔐 User authorization with JWT and cookies
- 👥 Getting a list of users
- 🚫 Blocking users
- ✅ Assigning roles

![Express](https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white&style=for-the-badge)
![TypeScript](https://shields.io/badge/TypeScript-3178C6?logo=TypeScript&logoColor=FFF&style=for-the-badge)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Prisma](https://img.shields.io/badge/SQLite-4169E1?logo=sqlite&logoColor=fff&style=for-the-badge)

## 🚀 Install

1. Clone repository
```bash
git clone https://github.com/acidless/user-service.git
cd user-service
```
2. Install dependencies
```bash
npm install
```
3. You can configure the environment by creating a .env file in the project root.
Default environment parameters:
```.env
PORT=3000
ADMIN_EMAIL=admin@example.com
SECRET=secret
```
4. Start server
```bash
npm start
```

## 📦 User model

Each user contains the following fields:

| Field | Type | Description |
|------|-----|--------- -|
| id | number | Identifier |
| fullname | string | User's full name |
| email | string | Email, unique value |
| password | string | Password (hashed) |
| role | string | User role: `admin` or `user` |
| status | string | User status: active/inactive |

## 🔗 API Endpoints

### 1. Register user

**POST** `/api/users`  
**Body:**

```json
{
  "fullname": "Иван Иванов",
  "email": "ivan@example.com",
  "password": "securePassword"
}
```

**Response:**
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
To register as an administrator, you need to use the email address from the ADMIN_EMAIL environment variable.

### 2. Authorize user

**PATCH** `/api/users`  
**Body:**

```json
{
  "email": "ivan@example.com",
  "password": "securePassword"
}
```

**Response:**
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

### 3. Get user by ID

**GET** `/api/users/:id`  
**Access:** admin or yourself

**Response:**
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

### 4. Get list of users

**GET** `/api/users`  
**Access:** only admin

**Query params:**

| Parameter | Type | Description |
|-----------|-----|----------|
| page      | number | Page number for paginated output (optional, default is 0) |

**Response:**

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

### 5. Block users

**DELETE** `/api/users/:id/`<br>
**Access:** admin or yourself

### 6. Set user role

**PATCH** `/api/users/:id/roles`<br>
**Access:** only admin

**Body:**

```jsonc
{
  "role": "ADMIN" // или "USER"
}
```

**Response:**

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

## 📜 License
MIT License © 2025
