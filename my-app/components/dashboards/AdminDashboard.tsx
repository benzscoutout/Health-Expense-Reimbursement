
import React, { useState } from 'react';
import { Claim, ClaimStatus } from '../../types';
import { CheckCircleIcon, XCircleIcon, ClockIcon, EyeIcon } from '../Icons';
import { THAI_TEXT, formatCurrency } from '../../constants';

interface AdminDashboardProps {
  claims: Claim[];
  updateClaim: (claimId: string, status: ClaimStatus, feedback?: string) => void;
}

const StatusBadge: React.FC<{ status: ClaimStatus }> = ({ status }) => {
  const statusStyles = {
    [ClaimStatus.Approved]: 'text-green-600',
    [ClaimStatus.Rejected]: 'text-red-600',
    [ClaimStatus.Pending]: 'text-yellow-600',
  };
  const Icon = {
      [ClaimStatus.Approved]: CheckCircleIcon,
      [ClaimStatus.Rejected]: XCircleIcon,
      [ClaimStatus.Pending]: ClockIcon
  }[status];

  return (
    <span className={`status-badge inline-flex items-center gap-1.5 ${statusStyles[status]}`}>
      <Icon className="w-3 h-3"/>
      {status === ClaimStatus.Approved ? THAI_TEXT.APPROVED : 
       status === ClaimStatus.Rejected ? THAI_TEXT.REJECTED : 
       THAI_TEXT.PENDING}
    </span>
  );
};

const ClaimDetailModal: React.FC<{ claim: Claim; onClose: () => void; onUpdate: (id: string, status: ClaimStatus, feedback?: string) => void; }> = ({ claim, onClose, onUpdate }) => {
  const [feedback, setFeedback] = useState('');
  
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
    
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fade-in">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">รายละเอียดคำร้อง: {claim.id}</h3>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>
            </div>
            <div className="flex-grow overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h4 className="font-semibold text-lg text-gray-800">รูปใบเสร็จ</h4>
                    <img src={typeof claim.receiptImage === 'string' ? claim.receiptImage : ''} alt="Receipt" className="rounded-lg shadow-md w-full" />
                </div>
                <div className="space-y-4">
                    <h4 className="font-semibold text-lg text-gray-800">ข้อมูลที่สกัดได้</h4>
                     <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                         <p className="text-gray-800"><strong>พนักงาน:</strong> {claim.employeeName}</p>
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
                     {claim.status === ClaimStatus.Pending && (
                        <div className="space-y-3 pt-4">
                            <h4 className="font-semibold text-lg text-gray-800">การดำเนินการ</h4>
                             <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="ระบุเหตุผลในการปฏิเสธ (จำเป็นสำหรับการปฏิเสธ)" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
                             <div className="flex gap-4">
                                <button onClick={handleApprove} className="btn-primary w-full flex items-center justify-center gap-2">
                                    <CheckCircleIcon className="w-5 h-5"/>อนุมัติ
                                </button>
                                <button onClick={handleReject} className="btn-primary w-full flex items-center justify-center gap-2">
                                    <XCircleIcon className="w-5 h-5"/>ปฏิเสธ
                                </button>
                            </div>
                        </div>
                     )}
                </div>
            </div>
        </div>
    </div>
  )
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ claims, updateClaim }) => {
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  
  const pendingClaims = claims.filter(c => c.status === ClaimStatus.Pending);
  const reviewedClaims = claims.filter(c => c.status !== ClaimStatus.Pending);

  const renderClaimList = (claimList: Claim[], title: string) => (
    <div>
        <h3 className="text-xl font-semibold mb-3 text-gray-800">{title}</h3>
        <div className="liquid-glass-card overflow-hidden">
            <ul className="divide-y divide-gray-200">
            {claimList.length > 0 ? claimList.map(claim => (
                <li key={claim.id} className="p-4 hover:bg-gray-50 transition-colors duration-150">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{claim.id} - {claim.employeeName}</p>
                        <p className="text-xs text-gray-500">{claim.receiptData.vendor} - ส่งเมื่อ: {claim.submittedDate}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <p className="text-lg font-bold text-gray-800">{formatCurrency(claim.receiptData.total)}</p>
                        <StatusBadge status={claim.status} />
                        <button onClick={() => setSelectedClaim(claim)} className="p-2 text-gray-500 hover:text-gray-700 transition">
                            <EyeIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                </li>
            )) : <li className="p-8 text-center text-gray-500">ไม่มีคำร้องในหมวดหมู่นี้</li>}
            </ul>
        </div>
    </div>
  );

  return (
    <div className="">
      <div className='space-y-8'>
      <h2 className="text-3xl font-bold text-gray-800">แดชบอร์ดผู้ดูแล</h2>
      {renderClaimList(pendingClaims, "รอดำเนินการ")}
      {renderClaimList(reviewedClaims, "คำร้องที่ดำเนินการแล้ว")}
      </div>
      {selectedClaim && <ClaimDetailModal claim={selectedClaim} onClose={() => setSelectedClaim(null)} onUpdate={updateClaim} />}
    </div>
  );
};

export default AdminDashboard;
