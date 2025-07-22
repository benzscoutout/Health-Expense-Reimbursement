import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, signInWithEmailAndPassword } from '../config/firebase';

interface LoginPageProps {
  userType: 'hr' | 'client';
}

const LoginPage: React.FC<LoginPageProps> = ({ userType }) => {
  // Autofill based on userType
  const defaultEmail = userType === 'hr' ? 'admin@test.com' : 'client@test.com';
  const defaultPassword = 'password123';

  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState(defaultPassword);
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
        navigate('/employee');
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 lg:p-8 w-full max-w-sm sm:max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-[#ec068d] to-[#d1057a] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-lg">H</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Health Expense
          </h1>
          <p className="text-sm sm:text-base text-gray-600">{getTitle()}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
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
              className="w-full p-3 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec068d] focus:border-transparent h-12 text-base transition-all duration-200"
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
              className="w-full p-3 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ec068d] focus:border-transparent h-12 text-base transition-all duration-200"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#ec068d] text-white py-3 sm:py-3 rounded-lg font-semibold text-base hover:bg-[#d1057a] transition-all duration-200 h-12 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-[#ec068d] hover:text-[#d1057a] text-sm transition-colors duration-200"
          >
            ← กลับไปหน้าหลัก
          </button>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
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