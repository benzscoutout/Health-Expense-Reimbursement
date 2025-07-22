import React from 'react';
import { BellIcon, Bars3Icon } from './Icons';

interface TopNavigationProps {
  activeTab: 'analytics' | 'expenses' | 'employees';
  onCreateNewClaim?: () => void;
  onMobileSidebarToggle?: () => void;
  isMobileSidebarOpen?: boolean;
}

const TopNavigation: React.FC<TopNavigationProps> = ({ 
  activeTab, 
  onCreateNewClaim,
  onMobileSidebarToggle,
  isMobileSidebarOpen
}) => {
  const handleCreateNewClaim = () => {
    if (onCreateNewClaim) {
      onCreateNewClaim();
    }
  };

  return (
    <div className="top-nav">
      <div className="breadcrumb">
        <button 
          className="mobile-sidebar-toggle md:hidden"
          onClick={onMobileSidebarToggle}
          aria-label="Toggle sidebar"
        >
          <Bars3Icon className="w-5 h-5" />
        </button>
        <span>หน้าแรก</span>
        <span className="breadcrumb-separator">/</span>
        <span>แดชบอร์ด</span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">
          {activeTab === 'analytics' ? 'วิเคราะห์ข้อมูล' : 
           activeTab === 'expenses' ? 'รายการค่าใช้จ่าย' : 'จัดการพนักงาน'}
        </span>
      </div>
      
      {/* <div className="top-nav-actions">
        <button className="btn btn-secondary btn-sm">
          <BellIcon className="w-4 h-4" />
        </button>
        <button 
          className="btn btn-primary btn-sm"
          onClick={handleCreateNewClaim}
        >
          + สร้างคำร้องใหม่
        </button>
      </div> */}
    </div>
  );
};

export default TopNavigation; 