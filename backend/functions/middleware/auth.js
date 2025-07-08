const { admin } = require('../config/firebase');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No Authorization header or invalid format');
      return res.status(401).json({ message: 'ไม่พบ token กรุณาเข้าสู่ระบบ' });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Token received, length:', token.length);
    
    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log('Token verified for user:', decodedToken.email);
    console.log('Decoded token claims:', decodedToken);
    
    // Determine role based on email (for testing)
    let role = 'client';
    if (decodedToken.email === 'admin@test.com') {
      role = 'hr';
    }
    
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: role
    };
    
    console.log('User object set:', req.user);
    next();
  } catch (error) {
    console.error('Auth error:', error);
    console.error('Auth error details:', error.message);
    res.status(401).json({ message: 'Token ไม่ถูกต้อง' });
  }
};

const authHR = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'ไม่พบ token กรุณาเข้าสู่ระบบ' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log('HR Auth - Decoded token claims:', decodedToken);
    
    // Determine role based on email (for testing)
    let role = 'client';
    if (decodedToken.email === 'admin@test.com') {
      role = 'hr';
    }
    console.log('HR Auth - User role:', role);
    
    // Check if user has HR role
    if (role !== 'hr') {
      console.log('HR Auth - Access denied, user role:', role);
      return res.status(403).json({ message: 'ไม่มีสิทธิ์เข้าถึง' });
    }
    
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.role
    };
    
    next();
  } catch (error) {
    console.error('Auth HR error:', error);
    res.status(401).json({ message: 'Token ไม่ถูกต้อง' });
  }
};

module.exports = { auth, authHR }; 