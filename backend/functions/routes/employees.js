const express = require('express');
const { admin } = require('../config/firebase');
const router = express.Router();

// Mock employee data (in production, this would be in Firestore)
let employees = [
  {
    id: 'emp001',
    employeeId: 'EMP001',
    firstName: 'สมชาย',
    lastName: 'ใจดี',
    email: 'somchai@company.com',
    phone: '0812345678',
    department: 'IT',
    position: 'Software Developer',
    hireDate: '2023-01-15',
    status: 'active',
    salary: 45000,
    manager: 'emp005',
    emergencyContact: {
      name: 'สมหญิง ใจดี',
      phone: '0898765432',
      relationship: 'ภรรยา'
    },
    address: {
      street: '123 ถนนสุขุมวิท',
      city: 'กรุงเทพฯ',
      postalCode: '10110'
    },
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'emp002',
    employeeId: 'EMP002',
    firstName: 'สมหญิง',
    lastName: 'รักดี',
    email: 'somying@company.com',
    phone: '0823456789',
    department: 'HR',
    position: 'HR Manager',
    hireDate: '2022-06-20',
    status: 'active',
    salary: 55000,
    manager: null,
    emergencyContact: {
      name: 'สมชาย รักดี',
      phone: '0876543210',
      relationship: 'สามี'
    },
    address: {
      street: '456 ถนนรัชดาภิเษก',
      city: 'กรุงเทพฯ',
      postalCode: '10400'
    },
    createdAt: '2022-06-20T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'emp003',
    employeeId: 'EMP003',
    firstName: 'วิชัย',
    lastName: 'พัฒนาการ',
    email: 'wichai@company.com',
    phone: '0834567890',
    department: 'Finance',
    position: 'Accountant',
    hireDate: '2023-03-10',
    status: 'active',
    salary: 40000,
    manager: 'emp002',
    emergencyContact: {
      name: 'วิชาดี พัฒนาการ',
      phone: '0865432109',
      relationship: 'พ่อ'
    },
    address: {
      street: '789 ถนนลาดพร้าว',
      city: 'กรุงเทพฯ',
      postalCode: '10230'
    },
    createdAt: '2023-03-10T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'emp004',
    employeeId: 'EMP004',
    firstName: 'นิดา',
    lastName: 'สวยงาม',
    email: 'nida@company.com',
    phone: '0845678901',
    department: 'Marketing',
    position: 'Marketing Specialist',
    hireDate: '2023-08-05',
    status: 'active',
    salary: 42000,
    manager: 'emp002',
    emergencyContact: {
      name: 'นิดา สวยงาม',
      phone: '0854321098',
      relationship: 'แม่'
    },
    address: {
      street: '321 ถนนเพชรบุรี',
      city: 'กรุงเทพฯ',
      postalCode: '10310'
    },
    createdAt: '2023-08-05T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'emp005',
    employeeId: 'EMP005',
    firstName: 'ประยุทธ',
    lastName: 'ผู้นำ',
    email: 'prayut@company.com',
    phone: '0856789012',
    department: 'IT',
    position: 'IT Manager',
    hireDate: '2021-12-01',
    status: 'active',
    salary: 65000,
    manager: null,
    emergencyContact: {
      name: 'ประยุทธ์ ผู้นำ',
      phone: '0843210987',
      relationship: 'พ่อ'
    },
    address: {
      street: '654 ถนนสุขุมวิท',
      city: 'กรุงเทพฯ',
      postalCode: '10110'
    },
    createdAt: '2021-12-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  }
];

// Get all employees
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', department = '', status = '' } = req.query;
    
    let filteredEmployees = [...employees];
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredEmployees = filteredEmployees.filter(emp => 
        emp.firstName.toLowerCase().includes(searchLower) ||
        emp.lastName.toLowerCase().includes(searchLower) ||
        emp.email.toLowerCase().includes(searchLower) ||
        emp.employeeId.toLowerCase().includes(searchLower) ||
        emp.department.toLowerCase().includes(searchLower) ||
        emp.position.toLowerCase().includes(searchLower)
      );
    }
    
    // Department filter
    if (department) {
      filteredEmployees = filteredEmployees.filter(emp => emp.department === department);
    }
    
    // Status filter
    if (status) {
      filteredEmployees = filteredEmployees.filter(emp => emp.status === status);
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);
    
    // Get unique departments for filter options
    const departments = [...new Set(employees.map(emp => emp.department))];
    
    res.json({
      employees: paginatedEmployees,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredEmployees.length / limit),
        totalItems: filteredEmployees.length,
        itemsPerPage: parseInt(limit)
      },
      filters: {
        departments,
        statuses: ['active', 'inactive', 'terminated']
      }
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลพนักงาน' });
  }
});

// Get employee by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const employee = employees.find(emp => emp.id === id);
    
    if (!employee) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลพนักงาน' });
    }
    
    res.json(employee);
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลพนักงาน' });
  }
});

// Create new employee
router.post('/', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      department,
      position,
      hireDate,
      salary,
      manager,
      emergencyContact,
      address
    } = req.body;
    
    // Validation
    if (!firstName || !lastName || !email || !phone || !department || !position) {
      return res.status(400).json({ message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' });
    }
    
    // Check if email already exists
    const existingEmployee = employees.find(emp => emp.email === email);
    if (existingEmployee) {
      return res.status(400).json({ message: 'อีเมลนี้มีอยู่ในระบบแล้ว' });
    }
    
    // Generate new employee ID
    const employeeId = `EMP${String(employees.length + 1).padStart(3, '0')}`;
    const newId = `emp${String(employees.length + 1).padStart(3, '0')}`;
    
    const newEmployee = {
      id: newId,
      employeeId,
      firstName,
      lastName,
      email,
      phone,
      department,
      position,
      hireDate: hireDate || new Date().toISOString().split('T')[0],
      status: 'active',
      salary: salary || 0,
      manager: manager || null,
      emergencyContact: emergencyContact || {
        name: '',
        phone: '',
        relationship: ''
      },
      address: address || {
        street: '',
        city: '',
        postalCode: ''
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    employees.push(newEmployee);
    
    res.status(201).json({
      message: 'เพิ่มพนักงานสำเร็จ',
      employee: newEmployee
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเพิ่มพนักงาน' });
  }
});

// Update employee
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const employeeIndex = employees.findIndex(emp => emp.id === id);
    if (employeeIndex === -1) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลพนักงาน' });
    }
    
    // Check if email is being changed and if it already exists
    if (updateData.email && updateData.email !== employees[employeeIndex].email) {
      const existingEmployee = employees.find(emp => emp.email === updateData.email);
      if (existingEmployee) {
        return res.status(400).json({ message: 'อีเมลนี้มีอยู่ในระบบแล้ว' });
      }
    }
    
    // Update employee data
    employees[employeeIndex] = {
      ...employees[employeeIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      message: 'อัปเดตข้อมูลพนักงานสำเร็จ',
      employee: employees[employeeIndex]
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลพนักงาน' });
  }
});

// Delete employee (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const employeeIndex = employees.findIndex(emp => emp.id === id);
    if (employeeIndex === -1) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลพนักงาน' });
    }
    
    // Soft delete - change status to terminated
    employees[employeeIndex].status = 'terminated';
    employees[employeeIndex].updatedAt = new Date().toISOString();
    
    res.json({
      message: 'ลบพนักงานสำเร็จ',
      employee: employees[employeeIndex]
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบพนักงาน' });
  }
});

// Get employee statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(emp => emp.status === 'active').length;
    const inactiveEmployees = employees.filter(emp => emp.status === 'inactive').length;
    const terminatedEmployees = employees.filter(emp => emp.status === 'terminated').length;
    
    // Department statistics
    const departmentStats = employees.reduce((acc, emp) => {
      if (emp.status === 'active') {
        acc[emp.department] = (acc[emp.department] || 0) + 1;
      }
      return acc;
    }, {});
    
    // Average salary
    const activeSalaries = employees
      .filter(emp => emp.status === 'active')
      .map(emp => emp.salary);
    const averageSalary = activeSalaries.length > 0 
      ? activeSalaries.reduce((sum, salary) => sum + salary, 0) / activeSalaries.length 
      : 0;
    
    res.json({
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      terminatedEmployees,
      departmentStats,
      averageSalary: Math.round(averageSalary)
    });
  } catch (error) {
    console.error('Get employee stats error:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงสถิติพนักงาน' });
  }
});

module.exports = router; 