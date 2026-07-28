# FitAI X - AI Powered Adaptive Fitness Ecosystem

FitAI X is an AI-driven adaptive fitness ecosystem that learns from user biometrics, goals, recovery, and injuries to dynamically generate personalized workouts, nutrition plans, and habit schedules.

---

## 🌟 Key System Features

- 🏋️ **Adaptive AI Planning Engine**: Real-time workout generation based on daily sleep, recovery, mood, and equipment.
- 🔀 **Workout Version Control**: Git-for-Workouts version control ($v1, v2, v3$), side-by-side diff viewer, and rollback engine.
- 🕸️ **AI Exercise & Dependency Graph**: Node-based visualizer for exercise dependencies, muscle engagement, and injury contraindications.
- 📆 **Smart Calendar & Scenario Planner**: Drag-to-shift workouts, Hotel/Travel scenarios, Rainy day swaps, and 5-min streak saver.
- 🧮 **AI Recovery Calculator**: Live biometric sliders for sleep, hydration, stress, soreness, resting HR $\rightarrow$ recovery score & fatigue risk.
- 🥗 **Meal & Grocery Budget Planner**: Budget-aware meal planner with hostel/apartment modes, ingredient reuse optimization, and estimated grocery costs.
- 🔐 **Standalone Authentication & Account Recovery System**: OTP-based forgot password & password reset backend services (`server/`) and React UI (`client/`).

---

## 🚀 Getting Started

### 1. Frontend Web Application
```bash
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173/`*

### 2. Backend Services
```bash
cd backend
npm run dev
```
*Backend runs on `http://localhost:4001/`*

### 3. Authentication & Forgot Password Service
```bash
npm run auth-server
```
*Auth server runs on `http://localhost:5000/`*
