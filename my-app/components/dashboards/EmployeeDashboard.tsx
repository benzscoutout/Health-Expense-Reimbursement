
import React, { useState } from 'react';
import { Claim, ClaimStatus } from '../../types';
import { PlusIcon, EyeIcon, ExclamationTriangleIcon, ShieldExclamationIcon } from '../Icons';
import ClaimForm from '../claims/ClaimForm';

interface EmployeeDashboardProps {
  claims: Claim[];
  addClaim: (newClaim: Omit<Claim, 'id' | 'submittedDate' | 'employeeName'>) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB'
  }).format(amount);
};

const getStatusColor = (status: ClaimStatus) => {
  switch (status) {
    case ClaimStatus.Approved:
      return 'bg-green-100 text-green-800';
    case ClaimStatus.Rejected:
      return 'bg-red-100 text-red-800';
    case ClaimStatus.Pending:
      return 'bg-yellow-100 text-yellow-800';
    case ClaimStatus.Flagged:
      return 'bg-red-100 text-red-800';
    case ClaimStatus.UnderReview:
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getFraudRiskColor = (riskLevel?: string) => {
  switch (riskLevel) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'medium':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const StatusBadge: React.FC<{ status: ClaimStatus }> = ({ status }) => (
  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
    {status}
  </span>
);

const FraudRiskBadge: React.FC<{ riskLevel?: string }> = ({ riskLevel }) => {
  if (!riskLevel) return null;
  
  const getRiskText = (level: string) => {
    switch (level) {
      case 'high': return 'ความเสี่ยงสูง';
      case 'medium': return 'ความเสี่ยงปานกลาง';
      case 'low': return 'ความเสี่ยงต่ำ';
      default: return level;
    }
  };
  
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getFraudRiskColor(riskLevel)}`}>
      <ShieldExclamationIcon className="w-3 h-3 inline mr-1" />
      ความเสี่ยง: {getRiskText(riskLevel)}
    </span>
  );
};

const AuthenticityScore: React.FC<{ score?: number }> = ({ score }) => {
  if (score === undefined) return null;
  
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-600">ความน่าเชื่อถือ:</span>
      <span className={`text-sm font-medium ${getScoreColor(score)}`}>
        {Math.round(score * 100)}%
      </span>
    </div>
  );
};

const ClaimDetailModal: React.FC<{ claim: Claim; onClose: () => void }> = ({ claim, onClose }) => {
  const [showImageModal, setShowImageModal] = useState(false);

  return (
    <>
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fade-in" style={{marginTop: '-10vh'}}>
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800">รายละเอียดคำร้อง: {claim.id}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>
          </div>
          <div className="flex-grow overflow-y-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Receipt Image */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg text-gray-800">รูปใบเสร็จ</h4>
                <img
                  src={typeof claim.receiptImage === 'string' ? claim.receiptImage : ''}
                  alt="Receipt"
                  className="rounded-lg shadow-md w-full cursor-pointer hover:opacity-80 transition"
                  onClick={() => setShowImageModal(true)}
                />
              </div>
              
              {/* Claim Details */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg text-gray-800">ข้อมูลเกี่ยวกับใบเบิกจ่าย</h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <p className="text-gray-800"><strong>ร้านค้า:</strong> {claim.receiptData.vendor}</p>
                  <p className="text-gray-800"><strong>วันที่:</strong> {claim.receiptData.date}</p>
                  <p className="text-gray-800"><strong>รวม:</strong> <span className="font-bold text-xl">{formatCurrency(claim.receiptData.total)}</span></p>
                  <div className="text-gray-800">
                    <strong>รายการ:</strong>
                    <ul className="list-disc pl-5 mt-1 text-sm">
                      {claim.receiptData.items.map((item, index) => <li key={index}>{item.description}: {formatCurrency(item.amount)}</li>)}
                    </ul>
                  </div>
                </div>

                {/* Fraud Detection Section - Only show if there are indicators */}
                {claim.fraudIndicators && claim.fraudIndicators.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg text-orange-800 flex items-center gap-2">
                      <ExclamationTriangleIcon className="w-5 h-5" />
                      แจ้งเตือนการตรวจพบความเสี่ยง
                    </h4>
                    <div className="bg-orange-50 p-4 rounded-lg space-y-3">
                      <p className="text-sm text-orange-800">
                        ระบบของเราตรวจพบปัญหาที่อาจเกิดขึ้นกับใบเสร็จนี้ นี่ไม่ได้หมายความว่าคำร้องของคุณจะถูกปฏิเสธ แต่อาจต้องมีการตรวจสอบเพิ่มเติม
                      </p>
                      <div className="space-y-2">
                        {claim.fraudIndicators.map((indicator, index) => (
                          <div key={index} className="border-l-4 border-orange-400 pl-3">
                            <p className="text-sm font-medium text-orange-700">
                              {indicator.type.replace('_', ' ').toUpperCase()} ({indicator.severity})
                            </p>
                            <p className="text-sm text-gray-700">{indicator.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Duplicate Check */}
                {claim.duplicateCheck?.isDuplicate && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg text-blue-800 flex items-center gap-2">
                      <ShieldExclamationIcon className="w-5 h-5" />
                      ตรวจพบคำร้องที่คล้ายคลึง
                    </h4>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-800">
                        ระบบของเราพบคำร้องที่คล้ายคลึงจากบัญชีของคุณ นี่เป็นเรื่องปกติหากคุณส่งคำร้องหลายรายการสำหรับบริการเดียวกัน
                      </p>
                    </div>
                  </div>
                )}

                {/* Authenticity Score */}
                {claim.authenticityScore !== undefined && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-lg text-gray-800">การวิเคราะห์ใบเสร็จ</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <AuthenticityScore score={claim.authenticityScore} />
                      <FraudRiskBadge riskLevel={claim.fraudRiskLevel} />
                    </div>
                  </div>
                )}

                {/* Status and Feedback */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg text-gray-800">สถานะคำร้อง</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={claim.status} />
                      <FraudRiskBadge riskLevel={claim.fraudRiskLevel} />
                    </div>
                    {claim.feedback && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-800">ความคิดเห็นจากฝ่ายบุคคล:</p>
                        <p className="text-sm text-blue-700 mt-1">"{claim.feedback}"</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showImageModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"  onClick={() => setShowImageModal(false)}>
          <img
            src={typeof claim.receiptImage === 'string' ? claim.receiptImage : ''}
            alt="Receipt Large View"
            className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl border-4 border-white"
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-6 right-6 bg-black/60 text-white rounded-full p-2 hover:bg-black/80 z-10"
          >
            &times;
          </button>
        </div>
      )}
    </>
  );
};

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ claims, addClaim }) => {
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);

  const getStatusCounts = () => {
    const counts = { Pending: 0, Approved: 0, Rejected: 0, Flagged: 0, UnderReview: 0 };
    claims.forEach(claim => {
      counts[claim.status as keyof typeof counts]++;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  // Wrapper function to handle claim submission and close modal
  const handleClaimSubmit = async (newClaim: Omit<Claim, 'id' | 'submittedDate' | 'employeeName'>) => {
    try {
      await addClaim(newClaim);
      // Close the modal after successful submission
      setShowClaimForm(false);
    } catch (error) {
      // Keep modal open if there's an error
      console.error('Error submitting claim:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">แดชบอร์ดพนักงาน</h1>
          <p className="text-gray-600">จัดการคำร้องค่าใช้จ่ายด้านสุขภาพของคุณ</p>
        </div>
        <button
          onClick={() => setShowClaimForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          ส่งคำร้องใหม่
        </button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">ทั้งหมด</p>
          <p className="text-2xl font-bold text-gray-900">{claims.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">รอดำเนินการ</p>
          <p className="text-2xl font-bold text-yellow-600">{statusCounts.Pending}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">อนุมัติ</p>
          <p className="text-2xl font-bold text-green-600">{statusCounts.Approved}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">ปฏิเสธ</p>
          <p className="text-2xl font-bold text-red-600">{statusCounts.Rejected}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">ตรวจสอบ</p>
          <p className="text-2xl font-bold text-orange-600">{statusCounts.Flagged + statusCounts.UnderReview}</p>
        </div>
      </div>

      {/* Claims List */}
      <div className="liquid-glass-card overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {claims.length > 0 ? claims.map(claim => (
            <li key={claim.id} className="p-4 hover:bg-gray-50 transition-colors duration-150">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-sm font-semibold text-gray-800 truncate">{claim.receiptData.vendor}</p>
                    <StatusBadge status={claim.status} />
                    <FraudRiskBadge riskLevel={claim.fraudRiskLevel} />
                  </div>
                  <p className="text-xs text-gray-500">ส่งเมื่อ: {claim.submittedDate}</p>
                  {claim.fraudIndicators && claim.fraudIndicators.length > 0 && (
                    <p className="text-xs text-orange-600 mt-1">
                      ⚠️ ตรวจพบ {claim.fraudIndicators.length} ความเสี่ยงในการเบิกจ่าย
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-lg font-bold text-gray-800">{formatCurrency(claim.receiptData.total)}</p>
                  <button
                    onClick={() => setSelectedClaim(claim)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <EyeIcon className="w-4 h-4" />
                    ดู
                  </button>
                </div>
              </div>
              {claim.feedback && (
                <div className="mt-2 pl-2 border-l-2 border-gray-200">
                  <p className="text-xs text-gray-600 font-medium">ความคิดเห็นจากฝ่ายบุคคล:</p>
                  <p className="text-xs text-gray-500 italic">"{claim.feedback}"</p>
                </div>
              )}
            </li>
          )) : (
            <li className="p-8 text-center text-gray-500">
              คุณยังไม่มีคำร้องใดๆ
            </li>
          )}
        </ul>
      </div>

      {/* Modals */}
      {showClaimForm && (
        <ClaimForm
          onClaimSubmit={handleClaimSubmit}
          onCancel={() => setShowClaimForm(false)}
        />
      )}

      {selectedClaim && (
        <ClaimDetailModal
          claim={selectedClaim}
          onClose={() => setSelectedClaim(null)}
        />
      )}
    </div>
  );
};

export default EmployeeDashboard;
