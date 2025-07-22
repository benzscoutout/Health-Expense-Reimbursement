import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Claim, ClaimStatus } from '../types';
import { claimsAPI } from '../services/api';
import { extractReceiptData } from '../services/geminiService';
import { 
  CameraIcon, 
  PlusIcon, 
  DocumentTextIcon, 
  UserIcon,
  ArrowUpOnSquareIcon,
  EyeIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChevronDownIcon,
  CogIcon,
  LogoutIcon
} from './Icons';

const EmployeeApp: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'submit' | 'history'>('submit');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    vendor: '',
    date: '',
    total: '',
    description: ''
  });
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  // Load user's claims
  useEffect(() => {
    loadClaims();
  }, []);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

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

  const handleImageProcessing = useCallback(async (base64Image: string) => {
    setIsProcessingImage(true);
    setError(null);
    try {
      const data = await extractReceiptData(base64Image);
      
      // Format items data for description field
      let descriptionText = '';
      if (data.items && data.items.length > 0) {
        descriptionText = data.items.map(item => 
          `${item.description}: ${item.amount.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}`
        ).join('\n');
      }
      
      setFormData({
        vendor: data.vendor,
        date: data.date,
        total: data.total.toString(),
        description: descriptionText
      });
    } catch (e) {
      console.error(e);
      setError('ไม่สามารถสกัดข้อมูลจากใบเสร็จได้ กรุณากรอกข้อมูลด้วยตนเอง');
    } finally {
      setIsProcessingImage(false);
    }
  }, []);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Image = e.target?.result as string;
        setImagePreview(base64Image);
        handleImageProcessing(base64Image);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Image = e.target?.result as string;
        setImagePreview(base64Image);
        handleImageProcessing(base64Image);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedImage) {
      setError('กรุณาเลือกรูปใบเสร็จ');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const formDataToSend = new FormData();
      formDataToSend.append('receiptImage', selectedImage);
      formDataToSend.append('vendor', formData.vendor);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('total', formData.total);
      formDataToSend.append('description', formData.description);

      await claimsAPI.submitClaim(formDataToSend);
      
      // Reset form
      setSelectedImage(null);
      setImagePreview(null);
      setFormData({
        vendor: '',
        date: '',
        total: '',
        description: ''
      });
      
      // Reload claims
      await loadClaims();
      
      // Show success message
      alert('ส่งคำร้องเรียบร้อยแล้ว');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการส่งคำร้อง');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusText = (status: ClaimStatus) => {
    switch (status) {
      case ClaimStatus.Pending: return 'รอดำเนินการ';
      case ClaimStatus.Approved: return 'อนุมัติแล้ว';
      case ClaimStatus.Rejected: return 'ปฏิเสธแล้ว';
      case ClaimStatus.Flagged: return 'ทำเครื่องหมาย';
      case ClaimStatus.UnderReview: return 'อยู่ระหว่างตรวจสอบ';
      default: return status;
    }
  };

  const getStatusColor = (status: ClaimStatus) => {
    switch (status) {
      case ClaimStatus.Pending: return 'pending';
      case ClaimStatus.Approved: return 'approved';
      case ClaimStatus.Rejected: return 'rejected';
      case ClaimStatus.Flagged: return 'flagged';
      case ClaimStatus.UnderReview: return 'flagged';
      default: return 'pending';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="employee-layout">
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="employee-layout">
      {/* Header */}
      <header className="employee-header">
        <div className="header-content">
          <div className="flex items-center gap-3">
           
            <div>
              <h1 className="header-title">Health Expense</h1>
              <p className="text-xs text-secondary">ระบบเบิกจ่ายค่าใช้จ่ายด้านสุขภาพ</p>
            </div>
          </div>
          
          <div className="header-actions" ref={profileMenuRef}>
            <button 
              className="profile-menu-button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="profile-avatar">
                <UserIcon className="w-4 h-4 text-white" />
              </div>
              <ChevronDownIcon className={`w-4 h-4 text-secondary transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Profile Menu Dropdown */}
            {showProfileMenu && (
              <div className="profile-dropdown">
                <div className="profile-dropdown-header">
                  <p className="text-sm font-medium text-text-color">พนักงาน</p>
                  <p className="text-xs text-secondary">client@test.com</p>
                </div>
                
                <div className="py-1">
                  <button 
                    className="profile-dropdown-item"
                    onClick={() => {
                      setShowProfileMenu(false);
                      setActiveTab('submit');
                    }}
                  >
                    <UserIcon className="w-4 h-4" />
                    โปรไฟล์
                  </button>
                  
                  <button 
                    className="profile-dropdown-item"
                    onClick={() => {
                      setShowProfileMenu(false);
                      setActiveTab('history');
                    }}
                  >
                    <DocumentTextIcon className="w-4 h-4" />
                    ประวัติ
                  </button>
                  
                  <div className="profile-dropdown-divider"></div>
                  
                  <button 
                    className="profile-dropdown-item logout"
                    onClick={handleLogout}
                  >
                    <LogoutIcon className="w-4 h-4" />
                    ออกจากระบบ
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="employee-container">
        {/* Tab Navigation */}
        <div className="employee-card">
          <div className="flex gap-2">
            <button
              className={`btn btn-sm ${activeTab === 'submit' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('submit')}
            >
              <PlusIcon className="w-4 h-4" />
              ส่งคำร้อง
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('history')}
            >
              <DocumentTextIcon className="w-4 h-4" />
              ประวัติ ({claims.length})
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="message error">
            {error}
          </div>
        )}

        {/* Submit Claim Tab */}
        {activeTab === 'submit' && (
          <form onSubmit={handleSubmit}>
            {/* Camera Section */}
            <div className="employee-card">
              <div className="employee-card-header">
                <div>
                  <h2 className="card-title">ถ่ายรูปใบเสร็จ</h2>
                  <p className="card-subtitle">อัปโหลดรูปใบเสร็จเพื่อส่งคำร้อง</p>
                </div>
              </div>

              {!imagePreview ? (
                <div
                  className="camera-section"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <CameraIcon className="camera-icon" />
                  <p className="camera-text">คลิกเพื่อเลือกรูปหรือลากไฟล์มาวาง</p>
                  <p className="camera-hint">รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 10MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-input"
                  />
                  <label htmlFor="image-input" className="btn btn-primary">
                    <CameraIcon className="w-5 h-5" />
                    เลือกรูปใบเสร็จ
                  </label>
                </div>
              ) : (
                <div className="image-preview">
                  <img src={imagePreview} alt="Receipt preview" className="preview-image" />
                  
                  {/* Processing Indicator */}
                  {isProcessingImage && (
                    <div className="processing-overlay">
                      <div className="processing-spinner"></div>
                      <p className="processing-text">กำลังประมวลผลใบเสร็จ...</p>
                    </div>
                  )}
                  
                  <div className="preview-overlay">
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview(null);
                        setFormData({
                          vendor: '',
                          date: '',
                          total: '',
                          description: ''
                        });
                      }}
                    >
                      <TrashIcon className="w-4 h-4" />
                      ลบรูป
                    </button>
                    <label htmlFor="image-input" className="btn btn-sm btn-primary">
                      <CameraIcon className="w-4 h-4" />
                      เปลี่ยนรูป
                    </label>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-input"
                  />
                </div>
              )}
            </div>

            {/* Form Section */}
            <div className="employee-card">
              <div className="employee-card-header">
                <h2 className="card-title">รายละเอียดค่าใช้จ่าย</h2>
              </div>

              <div className="form-group">
                <label className="form-label">ร้านค้า/สถานพยาบาล</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="ชื่อร้านค้าหรือสถานพยาบาล"
                  value={formData.vendor}
                  onChange={(e) => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">วันที่</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">จำนวนเงินรวม</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="0.00"
                  value={formData.total}
                  onChange={(e) => setFormData(prev => ({ ...prev, total: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">รายละเอียด (ไม่บังคับ)</label>
                <textarea
                  className="form-textarea"
                  placeholder="อธิบายรายละเอียดค่าใช้จ่าย..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || !selectedImage}
              >
                {submitting ? (
                  <>
                    <div className="loading-spinner"></div>
                    กำลังส่ง...
                  </>
                ) : (
                  <>
                    <ArrowUpOnSquareIcon className="w-5 h-5" />
                    ส่งคำร้อง
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="claims-list">
            {claims.length === 0 ? (
              <div className="employee-card text-center">
                <DocumentTextIcon className="w-16 h-16 text-secondary mx-auto mb-4" />
                <h3 className="card-title mb-2">ยังไม่มีคำร้อง</h3>
                <p className="card-subtitle">เริ่มต้นด้วยการส่งคำร้องแรกของคุณ</p>
              </div>
            ) : (
              claims.map((claim) => (
                <div key={claim.id} className="claim-item">
                  <div className="claim-header">
                    <h3 className="claim-title">{claim.receiptData.vendor}</h3>
                    <span className={`status-badge ${getStatusColor(claim.status)}`}>
                      {getStatusText(claim.status)}
                    </span>
                  </div>
                  
                  <div className="claim-details">
                    <div>
                      <p className="claim-amount">{formatCurrency(claim.receiptData.total)}</p>
                      <p className="claim-vendor">{claim.receiptData.vendor}</p>
                    </div>
                    <div className="text-right">
                      <p className="claim-date">{claim.submittedDate}</p>
                      {claim.feedback && (
                        <p className="text-sm text-secondary mt-1">{claim.feedback}</p>
                      )}
                    </div>
                  </div>

                  {claim.fraudIndicators && claim.fraudIndicators.length > 0 && (
                    <div className="mt-2">
                      <span className="status-badge flagged">
                        ตรวจพบความเสี่ยง
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <div className="bottom-nav-content">
          <button
            className={`nav-item ${activeTab === 'submit' ? 'active' : ''}`}
            onClick={() => setActiveTab('submit')}
          >
            <PlusIcon className="nav-icon" />
            ส่งคำร้อง
          </button>
          <button
            className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <DocumentTextIcon className="nav-icon" />
            ประวัติ
          </button>
        </div>
      </nav>
    </div>
  );
};

export default EmployeeApp; 