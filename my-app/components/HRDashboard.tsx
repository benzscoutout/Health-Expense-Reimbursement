import React, { useState, useCallback, useEffect } from 'react';
import { Claim, ClaimStatus } from '../types';
import Header from './Header';
import AdminDashboard from './dashboards/AdminDashboard';
import { claimsAPI } from '../services/api';

const HRDashboard: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg text-black font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-bg text-black font-sans flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg text-black font-sans">
      <Header />
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <AdminDashboard claims={claims} updateClaim={updateClaim} />
      </main>
    </div>
  );
};

export default HRDashboard; 