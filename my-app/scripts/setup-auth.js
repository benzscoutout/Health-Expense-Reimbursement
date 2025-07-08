// Script to set up Firebase Authentication users
// Run this in the Firebase Console or use Firebase Admin SDK

const admin = require('firebase-admin');

// Initialize Firebase Admin (you'll need to add your service account key)
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

// Users to create
const users = [
  {
    email: 'admin@test.com',
    password: 'password123',
    displayName: 'HR Admin',
    customClaims: { role: 'hr' }
  },
  {
    email: 'client@test.com', 
    password: 'password123',
    displayName: 'Client User',
    customClaims: { role: 'client' }
  }
];

// Function to create users
async function createUsers() {
  for (const user of users) {
    try {
      const userRecord = await admin.auth().createUser({
        email: user.email,
        password: user.password,
        displayName: user.displayName
      });
      
      // Set custom claims for role
      await admin.auth().setCustomUserClaims(userRecord.uid, user.customClaims);
      
      console.log(`Created user: ${user.email} with role: ${user.customClaims.role}`);
    } catch (error) {
      console.error(`Error creating user ${user.email}:`, error.message);
    }
  }
}

// createUsers();

console.log('To create these users:');
console.log('1. Go to Firebase Console > Authentication > Users');
console.log('2. Click "Add User"');
console.log('3. Add the following users:');
users.forEach(user => {
  console.log(`   - Email: ${user.email}, Password: ${user.password}, Role: ${user.customClaims.role}`);
});
console.log('\n4. Set custom claims for each user using Firebase Admin SDK or Console'); 