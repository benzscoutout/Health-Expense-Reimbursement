import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[#ec068d] to-[#d1057a] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">H</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Health Expense
          </h1>
          <p className="text-gray-600">
            ระบบเบิกจ่ายค่าใช้จ่ายด้านสุขภาพ
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => navigate('/login/client')}
            className="w-full bg-[#ec068d] text-white rounded-xl py-4 px-6 font-semibold text-lg hover:bg-[#d1057a] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            สำหรับพนักงาน
          </button>
          <button
            onClick={() => navigate('/login/hr')}
            className="w-full bg-[#ec068d] text-white rounded-xl py-4 px-6 font-semibold text-lg hover:bg-[#d1057a] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            สำหรับฝ่ายบุคคล
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 