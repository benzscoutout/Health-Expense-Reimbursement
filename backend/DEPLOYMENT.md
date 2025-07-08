# Firebase Cloud Functions Deployment

This guide explains how to deploy the Health Expense Reimbursement backend to Firebase Cloud Functions.

## 🚀 Prerequisites

1. **Firebase CLI** - Install globally:
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase Project** - Make sure you have access to the Firebase project

3. **Node.js 18** - Required for Cloud Functions

## 🔧 Setup Steps

### 1. Login to Firebase
```bash
firebase login
```

### 2. Initialize Firebase (if not already done)
```bash
firebase init functions
```

### 3. Install Dependencies
```bash
cd functions
npm install
```

### 4. Set Environment Variables
The environment variables are already configured in `config.env`. For production, you may want to set them in Firebase Console:

```bash
firebase functions:config:set firebase.project_id="scoutout-mang-test-e17bf"
firebase functions:config:set firebase.private_key_id="your-private-key-id"
# ... set other variables as needed
```

## 🚀 Deployment

### Deploy Functions
```bash
firebase deploy --only functions
```

### Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### Deploy Everything
```bash
firebase deploy
```

## 📋 API Endpoints

After deployment, your API will be available at:
```
https://us-central1-scoutout-mang-test-e17bf.cloudfunctions.net/api
```

### Available Endpoints:
- `GET /api/health` - Health check
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify token
- `GET /api/claims` - Get all claims (HR only)
- `GET /api/claims/my-claims` - Get user's claims
- `POST /api/claims` - Submit new claim
- `PATCH /api/claims/:id` - Update claim status
- `GET /api/claims/:id` - Get claim by ID

## 🔧 Local Development

### Start Local Emulator
```bash
firebase emulators:start --only functions
```

### Test Functions Locally
```bash
cd functions
npm run serve
```

## 📊 Monitoring

### View Function Logs
```bash
firebase functions:log
```

### Monitor in Firebase Console
1. Go to Firebase Console
2. Navigate to Functions
3. View logs, metrics, and performance

## 🔒 Security

### Firestore Rules
The Firestore rules are configured to:
- Allow HR users to read all claims
- Allow users to read only their own claims
- Allow authenticated users to create claims
- Allow only HR users to update/delete claims

### CORS Configuration
CORS is enabled for all origins in development. For production, you may want to restrict it to your frontend domain.

## 🛠️ Troubleshooting

### Common Issues:

1. **Function Timeout**: Increase timeout in `firebase.json`
2. **Memory Issues**: Increase memory allocation
3. **Cold Start**: Consider using Firebase Hosting with SSR

### Debug Commands:
```bash
# View function logs
firebase functions:log

# Test function locally
firebase emulators:start

# Check function status
firebase functions:list
```

## 📈 Performance

### Optimization Tips:
1. **Use Connection Pooling** for database connections
2. **Implement Caching** for frequently accessed data
3. **Optimize Image Processing** for receipt uploads
4. **Use CDN** for static assets

### Monitoring:
- Monitor function execution time
- Track memory usage
- Monitor error rates
- Set up alerts for failures 