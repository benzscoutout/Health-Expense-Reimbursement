const API_BASE_URL = import.meta.env.VITE_API_URL;

// Employee Types
export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  hireDate: string;
  status: 'active' | 'inactive' | 'terminated';
  salary: number;
  manager: string | null;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  address: {
    street: string;
    city: string;
    postalCode: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  terminatedEmployees: number;
  departmentStats: Record<string, number>;
  averageSalary: number;
}

export interface EmployeeListResponse {
  employees: Employee[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  filters: {
    departments: string[];
    statuses: string[];
  };
}

export interface EmployeeFilters {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  status?: string;
}

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

// Employee API calls
export const employeeAPI = {
  // Get all employees with filters
  getEmployees: async (filters: {
    page?: number;
    limit?: number;
    search?: string;
    department?: string;
    status?: string;
  } = {}) => {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.department) params.append('department', filters.department);
    if (filters.status) params.append('status', filters.status);

    const response = await fetch(`${API_BASE_URL}/employees?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลพนักงาน');
    }

    return response.json();
  },

  // Get employee by ID
  getEmployee: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลพนักงาน');
    }

    return response.json();
  },

  // Create new employee
  createEmployee: async (employeeData: any) => {
    const response = await fetch(`${API_BASE_URL}/employees`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(employeeData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'เกิดข้อผิดพลาดในการเพิ่มพนักงาน');
    }

    return response.json();
  },

  // Update employee
  updateEmployee: async (id: string, employeeData: any) => {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(employeeData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลพนักงาน');
    }

    return response.json();
  },

  // Delete employee (soft delete)
  deleteEmployee: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'เกิดข้อผิดพลาดในการลบพนักงาน');
    }

    return response.json();
  },

  // Get employee statistics
  getEmployeeStats: async () => {
    const response = await fetch(`${API_BASE_URL}/employees/stats/overview`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'เกิดข้อผิดพลาดในการดึงสถิติพนักงาน');
    }

    return response.json();
  },
};

// Health check
export const healthCheck = async () => {
  const response = await fetch(`${API_BASE_URL}/health`);
  return response.json();
}; 