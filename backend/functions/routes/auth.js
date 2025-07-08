const express = require('express');
const { admin } = require('../config/firebase');
const router = express.Router();

// Mock user data for testing (in production, this would be in Firestore)
const users = {
  'admin@test.com': {
    email: 'admin@test.com',
    password: 'password123',
    role: 'hr'
  },
  'client@test.com': {
    email: 'client@test.com',
    password: 'password123',
    role: 'client'
  }
};

// Login route - creates Firebase custom token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'กรุณากรอกอีเมลและรหัสผ่าน' });
    }

    const user = users[email];
    
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    // Create custom token for Firebase Auth
    const customToken = await admin.auth().createCustomToken(user.email, {
      role: user.role
    });

    res.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      customToken,
      user: {
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
  }
});

// Verify token route
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'ไม่พบ token' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    res.json({ 
      valid: true, 
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: decodedToken.role || 'client'
      }
    });
  } catch (error) {
    res.status(401).json({ message: 'Token ไม่ถูกต้อง' });
  }
});

module.exports = router; 