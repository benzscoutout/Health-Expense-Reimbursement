# Health Expense Reimbursement Backend

Firebase Cloud Functions backend for the Health Expense Reimbursement System.

## 🏗️ Project Structure

```
backend/
├── functions/                 # Cloud Functions source code
│   ├── index.js              # Main function entry point
│   ├── package.json          # Function dependencies
│   ├── config/               # Firebase configuration
│   ├── middleware/           # Authentication middleware
│   ├── routes/               # API routes
│   └── config.env            # Environment variables
├── firebase.json             # Firebase project configuration
├── .firebaserc              # Project selection
├── firestore.rules           # Database security rules
├── firestore.indexes.json    # Database indexes
├── DEPLOYMENT.md            # Deployment guide
└── README.md                # This file
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd functions
npm install
```

### 2. Deploy to Firebase
```bash
firebase deploy --only functions
```

### 3. Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

## 📋 API Endpoints

After deployment, your API will be available at:
```
https://us-central1-scoutout-mang-test-e17bf.cloudfunctions.net/api
```

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify token

### Claims Management
- `GET /api/claims` - Get all claims (HR only)
- `GET /api/claims/my-claims` - Get user's claims
- `POST /api/claims` - Submit new claim
- `PATCH /api/claims/:id` - Update claim status
- `GET /api/claims/:id` - Get claim by ID

### Health Check
- `GET /api/health` - API health check

## 🔐 Authentication

### Test Users
- **HR Login:** `admin@test.com` / `password`
- **Client Login:** `client@test.com` / `password`

## 🔧 Development

### Local Testing
```bash
cd functions
npm run serve
```

### View Logs
```bash
firebase functions:log
```

## 📚 Documentation

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 🔒 Security

- Firebase Authentication integration
- Role-based access control
- Firestore security rules
- CORS configuration for frontend integration 