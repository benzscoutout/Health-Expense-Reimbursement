import React from 'react';
import { 
  HomeIcon, 
  ChartBarIcon, 
  DocumentTextIcon, 
  UserGroupIcon, 
  CogIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from './Icons';

interface SidebarProps {
  activeTab?: 'analytics' | 'expenses';
  onTabChange?: (tab: 'analytics' | 'expenses') => void;
  onLogout?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab = 'analytics', 
  onTabChange,
  onLogout,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false
}) => {
  const handleTabClick = (tab: 'analytics' | 'expenses') => {
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const handleToggleCollapse = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    }
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="flex items-center justify-between w-full">
          <div className={`${isCollapsed ? 'hidden' : ''}`}>
            <h2 className="text-xl font-bold text-primary">Health Expense</h2>
            <p className="text-sm text-secondary">Management System</p>
          </div>
          <button 
            onClick={handleToggleCollapse}
            className="sidebar-toggle-btn"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <Bars3Icon className="w-5 h-5" /> : <XMarkIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <a 
          href="#" 
          className={`sidebar-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => handleTabClick('analytics')}
          title={isCollapsed ? 'วิเคราะห์ข้อมูล' : undefined}
        >
          <ChartBarIcon className="sidebar-nav-icon" />
          {!isCollapsed && <span>วิเคราะห์ข้อมูล</span>}
        </a>
        <a 
          href="#" 
          className={`sidebar-nav-item ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => handleTabClick('expenses')}
          title={isCollapsed ? 'รายการค่าใช้จ่าย' : undefined}
        >
          <DocumentTextIcon className="sidebar-nav-icon" />
          {!isCollapsed && <span>รายการค่าใช้จ่าย</span>}
        </a>
        <a 
          href="#" 
          className="sidebar-nav-item"
          title={isCollapsed ? 'จัดการพนักงาน' : undefined}
        >
          <UserGroupIcon className="sidebar-nav-icon" />
          {!isCollapsed && <span>จัดการพนักงาน</span>}
        </a>
        <a 
          href="#" 
          className="sidebar-nav-item"
          title={isCollapsed ? 'ตั้งค่า' : undefined}
        >
          <CogIcon className="sidebar-nav-icon" />
          {!isCollapsed && <span>ตั้งค่า</span>}
        </a>
      </nav>

      {/* Logout Section */}
      <div className={`mt-auto p-4 border-t border-gray-200 ${isCollapsed ? 'px-2' : ''}`}>
        <button 
          onClick={handleLogout}
          className="sidebar-nav-item w-full text-left"
          title={isCollapsed ? 'ออกจากระบบ' : undefined}
        >
          <ArrowRightOnRectangleIcon className="sidebar-nav-icon" />
          {!isCollapsed && <span>ออกจากระบบ</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar; 