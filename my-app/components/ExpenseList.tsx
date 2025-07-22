import React, { useState } from 'react';
import { Claim, ClaimStatus, FraudSeverity } from '../types';
import { ShieldExclamationIcon, ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon, EyeIcon, FlagIcon } from './Icons';

interface ExpenseListProps {
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
      return 'status-badge approved';
    case ClaimStatus.Rejected:
      return 'status-badge rejected';
    case ClaimStatus.Pending:
      return 'status-badge pending';
    case ClaimStatus.Flagged:
      return 'status-badge flagged';
    case ClaimStatus.UnderReview:
      return 'status-badge under-review';
    default:
      return 'status-badge pending';
  }
};

const getFraudRiskColor = (riskLevel?: string) => {
  switch (riskLevel) {
    case 'high':
      return 'text-error';
    case 'medium':
      return 'text-warning';
    case 'low':
      return 'text-success';
    default:
      return 'text-muted';
  }
};

const getFraudSeverityColor = (severity: FraudSeverity) => {
  switch (severity) {
    case FraudSeverity.High:
      return 'text-error';
    case FraudSeverity.Medium:
      return 'text-warning';
    case FraudSeverity.Low:
      return 'text-success';
    default:
      return 'text-muted';
  }
};

const StatusBadge: React.FC<{ status: ClaimStatus }> = ({ status }) => (
  <span className={getStatusColor(status)}>
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
    <span className={`text-xs font-medium ${getFraudRiskColor(riskLevel)}`}>
      <ShieldExclamationIcon className="w-3 h-3 inline mr-1" />
      {getRiskText(riskLevel)}
    </span>
  );
};

const AuthenticityScore: React.FC<{ score?: number }> = ({ score }) => {
  if (score === undefined) return null;
  
  const getScoreColor = (score: number) => {
    if (score >= 81) return 'text-success';
    if (score >= 61) return 'text-success';
    if (score >= 41) return 'text-warning';
    if (score >= 21) return 'text-error';
    return 'text-error';
  };

  const getScoreRange = (score: number) => {
    if (score >= 81) return '81-100%';
    if (score >= 61) return '61-80%';
    if (score >= 41) return '41-60%';
    if (score >= 21) return '21-40%';
    return '0-20%';
  };

  const getScoreLevel = (score: number) => {
    if (score >= 81) return 'น่าเชื่อถือสูงมาก';
    if (score >= 61) return 'น่าเชื่อถือสูง';
    if (score >= 41) return 'น่าเชื่อถือปานกลาง';
    if (score >= 21) return 'น่าเชื่อถือต่ำ';
    return 'น่าเชื่อถือต่ำมาก';
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-secondary">ความน่าเชื่อถือ:</span>
      <span className={`text-sm font-medium ${getScoreColor(score)}`}>
        {getScoreRange(score)} ({getScoreLevel(score)})
      </span>
    </div>
  );
};

const ClaimDetailModal: React.FC<{ claim: Claim; onClose: () => void; onUpdate: (id: string, status: ClaimStatus, feedback?: string) => void; }> = ({ claim, onClose, onUpdate }) => {
  const [feedback, setFeedback] = useState('');
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
                            {claim.receiptData.description && (
                              <div className="text-gray-800 text-sm sm:text-base">
                                <strong>รายละเอียด:</strong>
                                <div className="mt-1 p-2 bg-gray-100 rounded text-xs sm:text-sm whitespace-pre-line">
                                  {claim.receiptData.description}
                                </div>
                              </div>
                            )}
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
                            className="btn btn-primary"
                        >
                            <CheckCircleIcon className="w-4 h-4" />
                            อนุมัติ
                        </button>
                        <button
                            onClick={handleReject}
                            className="btn btn-secondary"
                        >
                            <XCircleIcon className="w-4 h-4" />
                            ปฏิเสธ
                        </button>
                        {(claim.fraudRiskLevel === 'high' || claim.fraudRiskLevel === 'medium') && (
                            <button
                                onClick={handleFlag}
                                className="btn btn-secondary"
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

const ExpenseList: React.FC<ExpenseListProps> = ({ claims, updateClaim }) => {
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
    <div className="space-y-6">
      {/* Claims Table */}
      <div className="data-table">
        <div className="table-header">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">รายการคำร้องทั้งหมด</h3>
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
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  รหัสคำร้อง
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ร้านค้า
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  พนักงาน
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สถานะ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  วันที่ส่ง
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  จำนวนเงิน
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  การดำเนินการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClaims.length > 0 ? filteredClaims.map(claim => (
                <tr key={claim.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {claim.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {claim.receiptData.vendor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {claim.employeeName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={claim.status} />
                    {claim.fraudIndicators && claim.fraudIndicators.length > 0 && (
                      <div className="mt-1">
                        <FraudRiskBadge riskLevel={claim.fraudRiskLevel} />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {claim.submittedDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(claim.receiptData.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => setSelectedClaim(claim)}
                      className="btn btn-secondary btn-sm"
                    >
                      <EyeIcon className="w-4 h-4" />
                      ดู
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    ไม่มีคำร้องที่ตรงกับเงื่อนไขที่เลือก
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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

export default ExpenseList; 