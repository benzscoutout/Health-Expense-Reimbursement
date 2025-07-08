
import React, { useState } from 'react';
import { Claim, ClaimStatus } from '../../types';
import { PlusIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '../Icons';
import ClaimForm from '../claims/ClaimForm';
import { THAI_TEXT, formatCurrency } from '../../constants';

interface EmployeeDashboardProps {
  claims: Claim[];
  addClaim: (newClaim: Omit<Claim, 'id' | 'submittedDate' | 'employeeName'>) => void;
}

const StatusBadge: React.FC<{ status: ClaimStatus }> = ({ status }) => {
  const statusStyles = {
    [ClaimStatus.Approved]: {
      text: 'text-green-600',
      icon: <CheckCircleIcon className="w-4 h-4" />,
    },
    [ClaimStatus.Rejected]: {
      text: 'text-red-600',
      icon: <XCircleIcon className="w-4 h-4" />,
    },
    [ClaimStatus.Pending]: {
      text: 'text-yellow-600',
      icon: <ClockIcon className="w-4 h-4" />,
    },
  };
  const style = statusStyles[status];
  return (
    <span className={`status-badge inline-flex items-center gap-1.5 ${style.text}`}>
      {style.icon}
      {status === ClaimStatus.Approved ? THAI_TEXT.APPROVED : 
       status === ClaimStatus.Rejected ? THAI_TEXT.REJECTED : 
       THAI_TEXT.PENDING}
    </span>
  );
};


const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ claims, addClaim }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClaimAdded = (newClaim: Omit<Claim, 'id' | 'submittedDate' | 'employeeName'>) => {
    addClaim(newClaim);
    setIsSubmitting(false);
  }

  if (isSubmitting) {
    return <ClaimForm onClaimSubmit={handleClaimAdded} onCancel={() => setIsSubmitting(false)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">คำร้องของฉัน</h2>
        <button
          onClick={() => setIsSubmitting(true)}
          className="btn-primary inline-flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          ส่งคำร้องใหม่
        </button>
      </div>

      <div className="liquid-glass-card overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {claims.length > 0 ? claims.map(claim => (
            <li key={claim.id} className="p-4 hover:bg-gray-50 transition-colors duration-150">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{claim.receiptData.vendor}</p>
                    <p className="text-xs text-gray-500">ส่งเมื่อ: {claim.submittedDate}</p>
                </div>
                <div className="flex items-center gap-4">
                    <p className="text-lg font-bold text-gray-800">{formatCurrency(claim.receiptData.total)}</p>
                    <StatusBadge status={claim.status} />
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
    </div>
  );
};

export default EmployeeDashboard;
