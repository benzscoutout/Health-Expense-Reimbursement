import React, { useState, useEffect } from 'react';
import { Employee, EmployeeListResponse, EmployeeFilters, employeeAPI } from '../services/api';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  FunnelIcon,
  UserGroupIcon,
  BuildingOffice2Icon,
  CurrencyDollarIcon,
  CalendarIcon
} from './Icons';

interface EmployeeManagementProps {
  onTabChange?: (tab: 'analytics' | 'expenses' | 'employees') => void;
}

const EmployeeManagement: React.FC<EmployeeManagementProps> = ({ onTabChange }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<EmployeeFilters>({
    page: 1,
    limit: 10,
    search: '',
    department: '',
    status: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [availableFilters, setAvailableFilters] = useState<{
    departments: string[];
    statuses: string[];
  }>({
    departments: [],
    statuses: []
  });
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    inactiveEmployees: 0,
    terminatedEmployees: 0,
    averageSalary: 0
  });

  // Load employees
  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response: EmployeeListResponse = await employeeAPI.getEmployees(filters);
      setEmployees(response.employees);
      setPagination(response.pagination);
      setAvailableFilters(response.filters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  // Load employee statistics
  const loadStats = async () => {
    try {
      const statsData = await employeeAPI.getEmployeeStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  useEffect(() => {
    loadEmployees();
    loadStats();
  }, [filters]);

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
  };

  const handleDepartmentFilter = (department: string) => {
    setFilters(prev => ({ ...prev, department, page: 1 }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ ...prev, status, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeModal(true);
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบพนักงานคนนี้?')) {
      try {
        await employeeAPI.deleteEmployee(employeeId);
        loadEmployees();
        loadStats();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการลบพนักงาน');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-success';
      case 'inactive': return 'text-warning';
      case 'terminated': return 'text-error';
      default: return 'text-secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'ทำงาน';
      case 'inactive': return 'ไม่ทำงาน';
      case 'terminated': return 'ลาออก';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูลพนักงาน...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => loadEmployees()} 
          className="btn btn-primary"
        >
          ลองใหม่
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="metric-card">
          <div className="flex items-center">
            <UserGroupIcon className="w-8 h-8 text-primary" />
            <div className="ml-4">
              <p className="text-sm text-secondary">พนักงานทั้งหมด</p>
              <p className="text-2xl font-bold text-primary">{stats.totalEmployees}</p>
            </div>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="flex items-center">
            <BuildingOffice2Icon className="w-8 h-8 text-success" />
            <div className="ml-4">
              <p className="text-sm text-secondary">พนักงานที่ทำงาน</p>
              <p className="text-2xl font-bold text-success">{stats.activeEmployees}</p>
            </div>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="flex items-center">
            <CurrencyDollarIcon className="w-8 h-8 text-warning" />
            <div className="ml-4">
              <p className="text-sm text-secondary">เงินเดือนเฉลี่ย</p>
              <p className="text-2xl font-bold text-warning">฿{stats.averageSalary.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="flex items-center">
            <CalendarIcon className="w-8 h-8 text-info" />
            <div className="ml-4">
              <p className="text-sm text-secondary">พนักงานใหม่</p>
              <p className="text-2xl font-bold text-info">{employees.filter(emp => {
                const hireDate = new Date(emp.hireDate);
                const threeMonthsAgo = new Date();
                threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
                return hireDate > threeMonthsAgo;
              }).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="search-filters">
        <div className="search-container">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="ค้นหาพนักงาน..." 
              className="search-input pl-10"
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          
          <select 
            className="filter-dropdown"
            value={filters.department}
            onChange={(e) => handleDepartmentFilter(e.target.value)}
          >
            <option value="">ทุกแผนก</option>
            {availableFilters.departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          
          <select 
            className="filter-dropdown"
            value={filters.status}
            onChange={(e) => handleStatusFilter(e.target.value)}
          >
            <option value="">ทุกสถานะ</option>
            <option value="active">ทำงาน</option>
            <option value="inactive">ไม่ทำงาน</option>
            <option value="terminated">ลาออก</option>
          </select>
          
          <button className="btn btn-primary btn-sm">
            <PlusIcon className="w-4 h-4" />
            เพิ่มพนักงาน
          </button>
        </div>
      </div>

      {/* Employee Table */}
      <div className="data-table">
        <div className="table-header">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">รายชื่อพนักงานทั้งหมด</h3>
            <div className="flex gap-2">
              <button className="btn btn-secondary btn-sm">ส่งออก</button>
              <button className="btn btn-primary btn-sm">พิมพ์</button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  รหัสพนักงาน
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ชื่อ-นามสกุล
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ตำแหน่ง
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  แผนก
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สถานะ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  วันที่เริ่มงาน
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  เงินเดือน
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  การดำเนินการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.length > 0 ? employees.map(employee => (
                <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {employee.employeeId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {employee.firstName} {employee.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{employee.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(employee.status)}`}>
                      {getStatusText(employee.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(employee.hireDate).toLocaleDateString('th-TH')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ฿{employee.salary.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewEmployee(employee)}
                        className="btn btn-secondary btn-sm"
                        title="ดูรายละเอียด"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        title="แก้ไข"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(employee.id)}
                        className="btn btn-error btn-sm"
                        title="ลบ"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    ไม่พบข้อมูลพนักงานที่ตรงกับเงื่อนไขที่เลือก
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            แสดง {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} ถึง{' '}
            {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} จาก{' '}
            {pagination.totalItems} รายการ
          </div>
          <div className="pagination">
            <button 
              className="pagination-button"
              disabled={pagination.currentPage === 1}
              onClick={() => handlePageChange(pagination.currentPage - 1)}
            >
              ‹
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`pagination-button ${page === pagination.currentPage ? 'active' : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
            <button 
              className="pagination-button"
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => handlePageChange(pagination.currentPage + 1)}
            >
              ›
            </button>
          </div>
        </div>
      )}

      {/* Employee Detail Modal */}
      {showEmployeeModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">รายละเอียดพนักงาน</h2>
              <button 
                onClick={() => setShowEmployeeModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">ข้อมูลส่วนตัว</h3>
                <p><strong>รหัสพนักงาน:</strong> {selectedEmployee.employeeId}</p>
                <p><strong>ชื่อ:</strong> {selectedEmployee.firstName} {selectedEmployee.lastName}</p>
                <p><strong>อีเมล:</strong> {selectedEmployee.email}</p>
                <p><strong>เบอร์โทร:</strong> {selectedEmployee.phone}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">ข้อมูลการทำงาน</h3>
                <p><strong>ตำแหน่ง:</strong> {selectedEmployee.position}</p>
                <p><strong>แผนก:</strong> {selectedEmployee.department}</p>
                <p><strong>วันที่เริ่มงาน:</strong> {new Date(selectedEmployee.hireDate).toLocaleDateString('th-TH')}</p>
                <p><strong>เงินเดือน:</strong> ฿{selectedEmployee.salary.toLocaleString()}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">ที่อยู่</h3>
                <p>{selectedEmployee.address.street}</p>
                <p>{selectedEmployee.address.city} {selectedEmployee.address.postalCode}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">ผู้ติดต่อฉุกเฉิน</h3>
                <p><strong>ชื่อ:</strong> {selectedEmployee.emergencyContact.name}</p>
                <p><strong>เบอร์โทร:</strong> {selectedEmployee.emergencyContact.phone}</p>
                <p><strong>ความสัมพันธ์:</strong> {selectedEmployee.emergencyContact.relationship}</p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-2">
              <button 
                onClick={() => setShowEmployeeModal(false)}
                className="btn btn-secondary"
              >
                ปิด
              </button>
              <button className="btn btn-primary">
                แก้ไขข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement; 