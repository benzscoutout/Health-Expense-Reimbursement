const API_BASE_URL = import.meta.env.VITE_API_URL;

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Auth API calls
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    }
    
    return response.json();
  },

  verifyToken: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Token ไม่ถูกต้อง');
    }
    
    return response.json();
  },
};

// Claims API calls
export const claimsAPI = {
  // Get all claims (HR only)
  getAllClaims: async () => {
    const response = await fetch(`${API_BASE_URL}/claims`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
    }
    
    return response.json();
  },

  // Get user's claims (Client only)
  getMyClaims: async () => {
    const response = await fetch(`${API_BASE_URL}/claims/my-claims`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
    }
    
    return response.json();
  },

  // Submit new claim
  submitClaim: async (claimData: FormData | any) => {
    const token = localStorage.getItem('token');
    
    const headers: any = {
      Authorization: `Bearer ${token}`,
    };
    
    let body: any;
    
    if (claimData instanceof FormData) {
      body = claimData;
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(claimData);
    }
    
    const response = await fetch(`${API_BASE_URL}/claims`, {
      method: 'POST',
      headers,
      body,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'เกิดข้อผิดพลาดในการส่งคำร้อง');
    }
    
    return response.json();
  },

  // Update claim status (HR only)
  updateClaimStatus: async (claimId: string, status: string, feedback?: string) => {
    const response = await fetch(`${API_BASE_URL}/claims/${claimId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, feedback }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'เกิดข้อผิดพลาดในการอัปเดต');
    }
    
    return response.json();
  },

  // Get claim by ID
  getClaimById: async (claimId: string) => {
    const response = await fetch(`${API_BASE_URL}/claims/${claimId}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
    }
    
    return response.json();
  },

  // Flag claim for investigation (HR only)
  flagClaim: async (claimId: string, reason: string, investigationNotes?: string[]) => {
    const response = await fetch(`${API_BASE_URL}/claims/${claimId}/flag`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        reason, 
        investigationNotes,
        status: 'Flagged'
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'เกิดข้อผิดพลาดในการทำเครื่องหมาย');
    }
    
    return response.json();
  },

  // Get fraud analytics (HR only)
  getFraudAnalytics: async () => {
    const response = await fetch(`${API_BASE_URL}/claims/fraud-analytics`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
    }
    
    return response.json();
  },

  // Get flagged claims (HR only)
  getFlaggedClaims: async () => {
    const response = await fetch(`${API_BASE_URL}/claims/flagged`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
    }
    
    return response.json();
  },

  // Add investigation notes (HR only)
  addInvestigationNotes: async (claimId: string, notes: string[]) => {
    const response = await fetch(`${API_BASE_URL}/claims/${claimId}/investigation-notes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ notes }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'เกิดข้อผิดพลาดในการเพิ่มบันทึก');
    }
    
    return response.json();
  },
};

// Health check
export const healthCheck = async () => {
  const response = await fetch(`${API_BASE_URL}/health`);
  return response.json();
}; 