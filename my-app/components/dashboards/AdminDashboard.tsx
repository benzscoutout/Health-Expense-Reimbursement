
import React, { useState } from 'react';
import { Claim, ClaimStatus, FraudSeverity } from '../../types';
import { ShieldExclamationIcon, ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon, EyeIcon, FlagIcon } from '../Icons';

interface AdminDashboardProps {
  claims: Claim[];
  updateClaim: (id: string, status: ClaimStatus, feedback?: string) => void;
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

const getFraudSeverityColor = (severity: FraudSeverity) => {
  switch (severity) {
    case FraudSeverity.High:
      return 'text-red-600';
    case FraudSeverity.Medium:
      return 'text-orange-600';
    case FraudSeverity.Low:
      return 'text-yellow-600';
    default:
      return 'text-gray-600';
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

const ClaimDetailModal: React.FC<{ claim: Claim; onClose: () => void; onUpdate: (id: string, status: ClaimStatus, feedback?: string) => void; }> = ({ claim, onClose, onUpdate }) => {
  const [feedback, setFeedback] = useState('');
  const [investigationNotes, setInvestigationNotes] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  
  const handleApprove = () => {
    onUpdate(claim.id, ClaimStatus.Approved, 'Approved');
    onClose();
  };

  const handleReject = () => {
    if (!feedback) {
        alert("กรุณาระบุเหตุผลในการปฏิเสธ");
        return;
    }
    onUpdate(claim.id, ClaimStatus.Rejected, feedback);
    onClose();
  };

  const handleFlag = () => {
    if (!feedback) {
        alert("กรุณาระบุเหตุผลในการทำเครื่องหมาย");
        return;
    }
    onUpdate(claim.id, ClaimStatus.Flagged, feedback);
    onClose();
  };
    
  return (
    <>
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-2 sm:p-4 z-50 animate-fade-in" style={{marginTop: '-8vh'}}>
        <div className="bg-white rounded-lg shadow-xl w-full max-w-xl sm:max-w-2xl lg:max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-3 sm:p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">รายละเอียดคำร้อง: {claim.id}</h3>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1">&times;</button>
            </div>
            <div className="flex-grow overflow-y-auto p-3 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Receipt Image */}
                    <div className="space-y-3 sm:space-y-4">
                        <h4 className="font-semibold text-base sm:text-lg text-gray-800">รูปใบเสร็จ</h4>
                        <img
                          src={typeof claim.receiptImage === 'string' ? claim.receiptImage : ''}
                          alt="Receipt"
                          className="rounded-lg shadow-md w-full cursor-pointer hover:opacity-80 transition"
                          onClick={() => setShowImageModal(true)}
                        />
                    </div>
                    
                    {/* Claim Details */}
                    <div className="space-y-3 sm:space-y-4">
                        <h4 className="font-semibold text-base sm:text-lg text-gray-800">ข้อมูลเกี่ยวกับใบเบิกจ่าย</h4>
                        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-2 sm:space-y-3">
                            <p className="text-gray-800 text-sm sm:text-base"><strong>พนักงาน:</strong> {claim.employeeName}</p>
                            <p className="text-gray-800 text-sm sm:text-base"><strong>ร้านค้า:</strong> {claim.receiptData.vendor}</p>
                            <p className="text-gray-800 text-sm sm:text-base"><strong>วันที่:</strong> {claim.receiptData.date}</p>
                            <p className="text-gray-800 text-sm sm:text-base"><strong>รวม:</strong> <span className="font-bold text-lg sm:text-xl">{formatCurrency(claim.receiptData.total)}</span></p>
                            <div className="text-gray-800 text-sm sm:text-base">
                                <strong>รายการ:</strong>
                                <ul className="list-disc pl-5 mt-1 text-xs sm:text-sm">
                                    {claim.receiptData.items.map((item, index) => <li key={index}>{item.description}: {formatCurrency(item.amount)}</li>)}
                                </ul>
                            </div>
                        </div>

                        {/* Fraud Detection Section */}
                        {claim.fraudIndicators && claim.fraudIndicators.length > 0 && (
                            <div className="space-y-3 sm:space-y-4">
                                <h4 className="font-semibold text-base sm:text-lg text-red-800 flex items-center gap-2">
                                    <ExclamationTriangleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                    Flagging Report
                                </h4>
                                <div className="bg-red-50 p-3 sm:p-4 rounded-lg space-y-2 sm:space-y-3">
                                    {claim.fraudIndicators.map((indicator, index) => (
                                        <div key={index} className="border-l-4 border-red-400 pl-3">
                                            <p className={`text-xs sm:text-sm font-medium ${getFraudSeverityColor(indicator.severity)}`}>
                                                {indicator.type.replace('_', ' ').toUpperCase()} ({indicator.severity})
                                            </p>
                                            <p className="text-xs sm:text-sm text-gray-700">{indicator.description}</p>
                                            <p className="text-xs text-gray-500">ความมั่นใจ: {Math.round(indicator.confidence * 100)}%</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Duplicate Check */}
                        {claim.duplicateCheck?.isDuplicate && (
                            <div className="space-y-3 sm:space-y-4">
                                <h4 className="font-semibold text-base sm:text-lg text-orange-800 flex items-center gap-2">
                                    <FlagIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                    การตรวจพบคำร้องที่ซ้ำซ้อน
                                </h4>
                                <div className="bg-orange-50 p-3 sm:p-4 rounded-lg">
                                    <p className="text-xs sm:text-sm text-orange-800">
                                        คำร้องนี้มีความคล้ายคลึงกับคำร้องที่ผ่านมาเหมือนกัน
                                    </p>
                                    {claim.duplicateCheck.similarClaims && (
                                        <div className="mt-2">
                                            <p className="text-xs text-orange-700">คำร้องที่ซ้ำซ้อนพบ:</p>
                                            <ul className="text-xs text-orange-600 mt-1">
                                                {claim.duplicateCheck.similarClaims?.map((similar, index) => (
                                                    <li key={index}>• {similar.reason} (คะแนน: {Math.round(similar.similarityScore * 100)}%)</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Authenticity Score */}
                        {claim.authenticityScore !== undefined && (
                            <div className="space-y-2">
                                <h4 className="font-semibold text-base sm:text-lg text-gray-800">การวิเคราะห์ความน่าเชื่อถือ</h4>
                                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                                    <AuthenticityScore score={claim.authenticityScore} />
                                    <FraudRiskBadge riskLevel={claim.fraudRiskLevel} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                        <button
                            onClick={handleApprove}
                            className="flex items-center gap-2 bg-green-600 text-white px-3 sm:px-4 py-3 sm:py-2 rounded-lg hover:bg-green-700 transition-colors h-12 text-sm sm:text-base"
                        >
                            <CheckCircleIcon className="w-4 h-4" />
                            อนุมัติ
                        </button>
                        <button
                            onClick={handleReject}
                            className="flex items-center gap-2 bg-red-600 text-white px-3 sm:px-4 py-3 sm:py-2 rounded-lg hover:bg-red-700 transition-colors h-12 text-sm sm:text-base"
                        >
                            <XCircleIcon className="w-4 h-4" />
                            ปฏิเสธ
                        </button>
                        {(claim.fraudRiskLevel === 'high' || claim.fraudRiskLevel === 'medium') && (
                            <button
                                onClick={handleFlag}
                                className="flex items-center gap-2 bg-orange-600 text-white px-3 sm:px-4 py-3 sm:py-2 rounded-lg hover:bg-orange-700 transition-colors h-12 text-sm sm:text-base"
                            >
                                <FlagIcon className="w-4 h-4" />
                                รายงานว่าน่าสงสัย
                            </button>
                        )}
                    </div>
                    
                    <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
                        <textarea
                            placeholder="เพิ่มความคิดเห็นหรือบันทึกหลักฐาน..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 sm:h-auto"
                            rows={3}
                        />
                    </div>
                </div>
            </div>
        </div>
      </div>
      {showImageModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-2 sm:p-4" style={{marginTop: '-8vh'}} onClick={() => setShowImageModal(false)}>
          <img
            src={typeof claim.receiptImage === 'string' ? claim.receiptImage : ''}
            alt="Receipt Large View"
            className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl border-4 border-white"
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 sm:top-6 right-4 sm:right-6 bg-black/60 text-white rounded-full p-2 hover:bg-black/80 z-10"
          >
            &times;
          </button>
        </div>
      )}
    </>
  );
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ claims, updateClaim }) => {
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');

  const filteredClaims = claims.filter(claim => {
    const statusMatch = filterStatus === 'all' || claim.status === filterStatus;
    const riskMatch = filterRisk === 'all' || claim.fraudRiskLevel === filterRisk;
    return statusMatch && riskMatch;
  });

  const getStatusCounts = () => {
    const counts = { Pending: 0, Approved: 0, Rejected: 0, Flagged: 0, UnderReview: 0 };
    claims.forEach(claim => {
      counts[claim.status as keyof typeof counts]++;
    });
    return counts;
  };

  const getRiskCounts = () => {
    const counts = { low: 0, medium: 0, high: 0 };
    claims.forEach(claim => {
      if (claim.fraudRiskLevel) {
        counts[claim.fraudRiskLevel as keyof typeof counts]++;
      }
    });
    return counts;
  };

  const statusCounts = getStatusCounts();
  const riskCounts = getRiskCounts();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">แดชบอร์ดฝ่ายบุคคล</h1>
          <p className="text-sm sm:text-base text-gray-600">จัดการคำร้องค่าใช้จ่ายด้านสุขภาพ</p>
        </div>
        <div className="flex flex-wrap gap-1 sm:gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm ${filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            ทั้งหมด ({claims.length})
          </button>
          <button
            onClick={() => setFilterStatus('Pending')}
            className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm ${filterStatus === 'Pending' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            รอดำเนินการ ({statusCounts.Pending})
          </button>
          <button
            onClick={() => setFilterStatus('Flagged')}
            className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm ${filterStatus === 'Flagged' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            ทำเครื่องหมาย ({statusCounts.Flagged})
          </button>
        </div>
      </div>

      {/* Risk Level Filter */}
      <div className="flex flex-wrap gap-1 sm:gap-2">
        <button
          onClick={() => setFilterRisk('all')}
          className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm ${filterRisk === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          ทุกระดับความเสี่ยง
        </button>
        <button
          onClick={() => setFilterRisk('high')}
          className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm ${filterRisk === 'high' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          ความเสี่ยงสูง ({riskCounts.high})
        </button>
        <button
          onClick={() => setFilterRisk('medium')}
          className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm ${filterRisk === 'medium' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          ความเสี่ยงปานกลาง ({riskCounts.medium})
        </button>
      </div>

      {/* Claims List */}
      <div className="liquid-glass-card overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {filteredClaims.length > 0 ? filteredClaims.map(claim => (
            <li key={claim.id} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <p className="text-sm font-semibold text-gray-800 truncate">{claim.receiptData.vendor}</p>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      <StatusBadge status={claim.status} />
                      <FraudRiskBadge riskLevel={claim.fraudRiskLevel} />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">พนักงาน: {claim.employeeName}</p>
                  <p className="text-xs text-gray-500">ส่งเมื่อ: {claim.submittedDate}</p>
                  {claim.fraudIndicators && claim.fraudIndicators.length > 0 && (
                    <p className="text-xs text-red-600 mt-1">
                      ⚠️ {claim.fraudIndicators.length} ความเสี่ยงในการเบิกจ่าย
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
                  <p className="text-base sm:text-lg font-bold text-gray-800">{formatCurrency(claim.receiptData.total)}</p>
                  <button
                    onClick={() => setSelectedClaim(claim)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs sm:text-sm h-8 sm:h-auto px-2 sm:px-0"
                  >
                    <EyeIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="sm:inline">ดู</span>
                  </button>
                </div>
              </div>
              {claim.feedback && (
                <div className="mt-2 pl-2 border-l-2 border-gray-200">
                  <p className="text-xs text-gray-600 font-medium">ความคิดเห็น:</p>
                  <p className="text-xs text-gray-500 italic">"{claim.feedback}"</p>
                </div>
              )}
            </li>
          )) : (
            <li className="p-6 sm:p-8 text-center text-gray-500">
              ไม่มีคำร้องที่ตรงกับเงื่อนไขที่เลือก
            </li>
          )}
        </ul>
      </div>

      {/* Modal */}
      {selectedClaim && (
        <ClaimDetailModal
          claim={selectedClaim}
          onClose={() => setSelectedClaim(null)}
          onUpdate={updateClaim}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
