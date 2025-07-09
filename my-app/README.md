# Health Expense Reimbursement Frontend

Frontend application for the Health Expense Reimbursement System using React, TypeScript, and Firebase.

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory with the following variables:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyBoYsRRXr5nNokR-k26TVjykavLSbdHldM
VITE_FIREBASE_AUTH_DOMAIN=scoutout-mang-test-e17bf.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=scoutout-mang-test-e17bf
VITE_FIREBASE_STORAGE_BUCKET=scoutout-mang-test-e17bf.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=436987830723
VITE_FIREBASE_APP_ID=1:436987830723:web:9601c7ba3cf81fcedc1d76
```

### 3. Start Development Server
```bash
npm run dev
```

## 🔐 Authentication

### Test Users
- **HR Login:**
  - Email: `admin@test.com`
  - Password: `password123`

- **Client Login:**
  - Email: `client@test.com`
  - Password: `password123`

## 📁 Project Structure

```
my-app/
├── components/
│   ├── LandingPage.tsx
│   ├── LoginPage.tsx
│   ├── ClientApp.tsx
│   ├── HRDashboard.tsx
│   └── ...
├── config/
│   └── firebase.ts
├── services/
│   └── api.ts
├── .env (create this file)
└── README.md
```

## 🔧 Development

### Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Environment Variables
All Firebase configuration is stored in environment variables for security. The `VITE_` prefix makes them available to the frontend application.

## 🌐 Backend Integration

The frontend communicates with the backend API running on `http://localhost:5000`. Make sure the backend is running before testing the application.
