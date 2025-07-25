
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightOnRectangleIcon } from './Icons';

const Header: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <header className="liquid-glass-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-pink-600 truncate">ระบบเบิกจ่ายค่าใช้จ่ายด้านสุขภาพ</h1>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">ออกจากระบบ</span>
              <span className="sm:hidden">ออก</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
