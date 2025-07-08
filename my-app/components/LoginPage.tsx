import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, signInWithEmailAndPassword } from '../config/firebase';

interface LoginPageProps {
  userType: 'hr' | 'client';
}

const LoginPage: React.FC<LoginPageProps> = ({ userType }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Sign in with Firebase using email/password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get the ID token for API calls
      const idToken = await user.getIdToken();
      
      // Store token and user info
      localStorage.setItem('token', idToken);
      localStorage.setItem('user', JSON.stringify({
        email: user.email,
        role: userType === 'hr' ? 'hr' : 'client'
      }));

      // Navigate based on user type
      if (userType === 'hr') {
        navigate('/hr');
      } else {
        navigate('/app');
      }

    } catch (error: any) {
      let errorMessage = 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'รูปแบบอีเมลไม่ถูกต้อง';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'มีการพยายามเข้าสู่ระบบมากเกินไป กรุณาลองใหม่ภายหลัง';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    return userType === 'hr' ? 'เข้าสู่ระบบสำหรับฝ่ายบุคคล' : 'เข้าสู่ระบบสำหรับพนักงาน';
  };

  const getDefaultEmail = () => {
    return userType === 'hr' ? 'admin@test.com' : 'client@test.com';
  };

  return (
    <div className="min-h-screen gradient-bg text-black font-sans flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            ระบบเบิกจ่ายค่าใช้จ่ายด้านสุขภาพ
          </h1>
          <p className="text-gray-600">{getTitle()}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              อีเมล
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={getDefaultEmail()}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              รหัสผ่าน
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            ← กลับไปหน้าหลัก
          </button>
        </div>

                  <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">ข้อมูลสำหรับทดสอบ:</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>อีเมล:</strong> {getDefaultEmail()}</p>
              <p><strong>รหัสผ่าน:</strong> password123</p>
            </div>
          </div>
      </div>
    </div>
  );
};

export default LoginPage; 