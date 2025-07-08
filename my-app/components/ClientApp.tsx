import React, { useState, useCallback, useEffect } from 'react';
import { Claim, ClaimStatus } from '../types';
import Header from './Header';
import EmployeeDashboard from './dashboards/EmployeeDashboard';
import { claimsAPI } from '../services/api';

const ClientApp: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user's claims
  useEffect(() => {
    const loadClaims = async () => {
      try {
        setLoading(true);
        const data = await claimsAPI.getMyClaims();
        setClaims(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setLoading(false);
      }
    };

    loadClaims();
  }, []);

  const addClaim = useCallback(async (newClaim: Omit<Claim, 'id' | 'submittedDate' | 'employeeName'>) => {
    try {
      const formData = new FormData();
      
      // Handle file upload with FormData
      
      // Handle file upload
      if (newClaim.receiptImage instanceof File) {
        formData.append('receiptImage', newClaim.receiptImage);
        console.log('Using File object:', newClaim.receiptImage.name, newClaim.receiptImage.size);
      } else if (typeof newClaim.receiptImage === 'string' && newClaim.receiptImage.startsWith('data:')) {
        // For base64, create a simple blob
        const base64Data = newClaim.receiptImage.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });
        const file = new File([blob], 'receipt.jpg', { type: 'image/jpeg' });
        formData.append('receiptImage', file);
        console.log('Converted base64 to File:', file.name, file.size);
      } else {
        throw new Error('ไม่พบรูปภาพที่ถูกต้อง');
      }
      
      // Add receipt data
      formData.append('vendor', newClaim.receiptData.vendor);
      formData.append('date', newClaim.receiptData.date);
      formData.append('total', newClaim.receiptData.total.toString());
      if (newClaim.receiptData.items) {
        formData.append('items', JSON.stringify(newClaim.receiptData.items));
      }
      
      // Debug: Log FormData contents
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value);
      }
      
      await claimsAPI.submitClaim(formData);
      
      // Refresh claims after submission
      const updatedClaims = await claimsAPI.getMyClaims();
      setClaims(updatedClaims);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการส่งคำร้อง');
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
        <EmployeeDashboard claims={claims} addClaim={addClaim} />
      </main>
    </div>
  );
};

export default ClientApp; 