import React from 'react';
import { BellIcon } from './Icons';

interface TopNavigationProps {
  activeTab: 'analytics' | 'expenses';
  onCreateNewClaim?: () => void;
}

const TopNavigation: React.FC<TopNavigationProps> = ({ 
  activeTab, 
  onCreateNewClaim 
}) => {
  const handleCreateNewClaim = () => {
    if (onCreateNewClaim) {
      onCreateNewClaim();
    }
  };

  return (
    <div className="top-nav">
      <div className="breadcrumb">
        <span>หน้าแรก</span>
        <span className="breadcrumb-separator">/</span>
        <span>แดชบอร์ด</span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">
          {activeTab === 'analytics' ? 'วิเคราะห์ข้อมูล' : 'รายการค่าใช้จ่าย'}
        </span>
      </div>
      
      <div className="top-nav-actions">
        <button className="btn btn-secondary btn-sm">
          <BellIcon className="w-4 h-4" />
        </button>
        <button 
          className="btn btn-primary btn-sm"
          onClick={handleCreateNewClaim}
        >
          + สร้างคำร้องใหม่
        </button>
      </div>
    </div>
  );
};

export default TopNavigation; 