import React, { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Claim, ClaimStatus } from '../types';
import Sidebar from './Sidebar';
import TopNavigation from './TopNavigation';
import SearchFilters from './SearchFilters';
import ExpenseList from './ExpenseList';
import AnalyticsDashboard from './AnalyticsDashboard';
import { claimsAPI } from '../services/api';

const HRDashboard: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab from URL
  const getActiveTab = () => {
    if (location.pathname.includes('/expenses')) return 'expenses';
    if (location.pathname.includes('/analytics')) return 'analytics';
    return 'analytics'; // default to analytics
  };

  const [activeTab, setActiveTab] = useState<'analytics' | 'expenses'>(getActiveTab());

  // Update active tab when URL changes
  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname]);

  // Load all claims for HR
  useEffect(() => {
    const loadClaims = async () => {
      try {
        setLoading(true);
        const data = await claimsAPI.getAllClaims();
        setClaims(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setLoading(false);
      }
    };

    loadClaims();
  }, []);

  const updateClaim = useCallback(async (claimId: string, status: ClaimStatus, feedback?: string) => {
    try {
      await claimsAPI.updateClaimStatus(claimId, status, feedback);
      // Refresh claims after update
      const updatedClaims = await claimsAPI.getAllClaims();
      setClaims(updatedClaims);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการอัปเดต');
    }
  }, []);

  const handleTabChange = (tab: 'analytics' | 'expenses') => {
    setActiveTab(tab);
    // Update URL based on tab
    if (tab === 'analytics') {
      navigate('/hr/analytics', { replace: true });
    } else {
      navigate('/hr/expenses', { replace: true });
    }
  };

  const handleLogout = () => {
    // Handle logout logic here
    navigate('/');
  };

  const handleCreateNewClaim = () => {
    // Handle create new claim logic here
    console.log('Create new claim clicked');
  };

  const handleSearch = (query: string) => {
    // Handle search logic here
    console.log('Search query:', query);
  };

  const handleStatusFilter = (status: string) => {
    // Handle status filter logic here
    console.log('Status filter:', status);
  };

  const handleRiskFilter = (risk: string) => {
    // Handle risk filter logic here
    console.log('Risk filter:', risk);
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleMobileSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-primary"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onLogout={handleLogout}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleSidebarToggle}
        isMobileOpen={sidebarOpen}
      />

      {/* Main Content */}
      <main className="main-content">
        {/* Top Navigation */}
        <TopNavigation 
          activeTab={activeTab}
          onCreateNewClaim={handleCreateNewClaim}
        />

        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">
            {activeTab === 'analytics' ? 'วิเคราะห์ข้อมูล' : 'รายการค่าใช้จ่าย'}
          </h1>
          <p className="page-subtitle">
            {activeTab === 'analytics' 
              ? 'ภาพรวมและสถิติการเบิกจ่ายค่าใช้จ่ายด้านสุขภาพ' 
              : 'จัดการคำร้องค่าใช้จ่ายด้านสุขภาพทั้งหมด'
            }
          </p>
        </div>

        {/* Search and Filters */}
        {/* <SearchFilters 
          activeTab={activeTab}
          claimsCount={claims.length}
          onTabChange={handleTabChange}
          onSearch={handleSearch}
          onStatusFilter={handleStatusFilter}
          onRiskFilter={handleRiskFilter}
        /> */}

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'analytics' ? (
            <AnalyticsDashboard claims={claims} />
          ) : (
            <ExpenseList claims={claims} updateClaim={updateClaim} />
          )}
        </div>
      </main>

     
    </div>
  );
};

export default HRDashboard; 