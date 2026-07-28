# FitAI Auth, Onboarding & User Profile Starter Module

A complete, production-ready, standalone fullstack authentication, onboarding, and user profile management module extracted from FitAI. This repository contains zero hardcoded demo data and is ready for deployment or integration into any MERN/React fitness application.

---

## 🚀 Key Features

- **JWT Authentication**: Password hashing with `bcryptjs`, secure token handling, login, registration, and session persistence (`/api/auth/me`).
- **Gamified Onboarding Wizard**: Multi-step user onboarding collecting physical metrics (height, weight, age), fitness level, activity level, equipment inventory, workout preferences, dietary preferences, and target goals.
- **Comprehensive User Profile**: Detailed profile view and edit modal featuring stats radar, equipment selector, goal configuration, and medical condition management.
- **Robust Mongoose User Model**: Rich schema covering profile details, health profiles, active injuries, preferences, and gamification ranks.
- **Redux Toolkit Integration**: Pre-configured `authSlice` for auth state management and seamless UI reactivity.
- **Clean Architecture**: Decoupled Express backend & React 18 + Vite + TailwindCSS frontend.

---

## 📂 Project Structure

```
fitai-auth-onboarding-starter/
├── backend/
│   ├── src/
│   │   ├── config/db.js           # MongoDB connection helper
│   │   ├── controllers/authController.js  # Register, Login, GetMe, UpdateProfile
│   │   ├── middleware/auth.js      # JWT Bearer token protection middleware
│   │   ├── models/User.js          # Unified User Mongoose schema
│   │   ├── routes/authRoutes.js    # /api/auth API routes
│   │   └── server.js               # Express server entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── profile/            # Onboarding, Profile, EditModal, EquipmentSelector, GoalSetting
│   │   │   └── routing/            # ProtectedRoute route guard
│   │   ├── pages/                  # Login, Register, Onboarding, Profile pages
│   │   ├── redux/                  # Store & authSlice
│   │   ├── services/api.js         # Axios client with JWT interceptor
│   │   ├── App.jsx                 # Routes setup
│   │   └── main.jsx                # App bootstrap
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## ⚙️ Quick Start & Local Setup

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file based on `.env.example`:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/fitai
JWT_SECRET=your_super_secret_jwt_key_here
```

Start the backend server:
```bash
npm run dev
# Server will run on http://localhost:3000
```

### 2. Frontend Setup

```bash
cd ../frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
# Frontend will run on http://localhost:5173
```

---

## 📡 API Reference (`/api/auth`)

| Endpoint | Method | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | No | Registers new user and returns JWT token + user doc |
| `/api/auth/login` | `POST` | No | Authenticates user and returns JWT token + user doc |
| `/api/auth/me` | `GET` | Yes | Retrieves authenticated user profile |
| `/api/auth/me` | `PATCH` | Yes | Updates profile fields, equipment, goals, and onboarding status |

---

## 🔒 Security Best Practices Implemented

- Passwords are salted and hashed using `bcryptjs` (salt rounds: 10).
- Passwords are strictly omitted from JWT tokens and API responses (`stripPassword` utility).
- Express route handlers validate Bearer token headers via `protect` middleware.
- Axios request interceptor injects `Authorization: Bearer <token>` dynamically and handles session expiration (`401`).
