require('dotenv').config();
const admin = require('firebase-admin');

// Firebase Admin configuration for Firestore
const serviceAccount = {
  type: "service_account",
  project_id: process.env.NODE_FIREBASE_PROJECT_ID || 'scoutout-mang-test-e17bf',
  private_key_id: process.env.NODE_FIREBASE_PRIVATE_KEY_ID,
  private_key: (process.env.NODE_FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  client_email: process.env.NODE_FIREBASE_CLIENT_EMAIL,
  client_id: process.env.NODE_FIREBASE_CLIENT_ID,
  auth_uri: process.env.NODE_FIREBASE_AUTH_URI,
  token_uri: process.env.NODE_FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.NODE_FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.NODE_FIREBASE_CLIENT_X509_CERT_URL
};

// Initialize Firebase Admin for Firestore
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  storageBucket: process.env.NODE_FIREBASE_STORAGE_BUCKET
});

const db = admin.firestore();
const storage = admin.storage();

// Test Firestore connection
console.log('Firebase Admin initialized');
console.log('Firestore database initialized');
console.log('Firebase Storage initialized, bucket:', process.env.NODE_FIREBASE_STORAGE_BUCKET);

module.exports = { admin, db, storage }; 