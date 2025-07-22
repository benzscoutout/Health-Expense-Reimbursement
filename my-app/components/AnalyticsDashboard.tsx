import React from 'react';
import { Claim, ClaimStatus, FraudSeverity } from '../types';
import { 
  ChartBarIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  CurrencyDollarIcon,
  ShieldExclamationIcon,
  TrendingUpIcon,
  TrendingDownIcon
} from './Icons';

interface AnalyticsDashboardProps {
  claims: Claim[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB'
  }).format(amount);
};

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ claims }) => {
  // Calculate statistics
  const totalClaims = claims.length;
  const totalAmount = claims.reduce((sum, claim) => sum + claim.receiptData.total, 0);
  const averageAmount = totalClaims > 0 ? totalAmount / totalClaims : 0;
  
  // Status breakdown
  const statusCounts = claims.reduce((acc, claim) => {
    acc[claim.status] = (acc[claim.status] || 0) + 1;
    return acc;
  }, {} as Record<ClaimStatus, number>);
  
  // Risk level breakdown
  const riskCounts = claims.reduce((acc, claim) => {
    if (claim.fraudRiskLevel) {
      acc[claim.fraudRiskLevel] = (acc[claim.fraudRiskLevel] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  // Fraud indicators breakdown
  const fraudTypeCounts = claims.reduce((acc, claim) => {
    if (claim.fraudIndicators) {
      claim.fraudIndicators.forEach(indicator => {
        acc[indicator.type] = (acc[indicator.type] || 0) + 1;
      });
    }
    return acc;
  }, {} as Record<string, number>);
  
  // Monthly trends (last 6 months)
  const getMonthlyData = () => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(date.toLocaleDateString('th-TH', { month: 'short', year: 'numeric' }));
    }
    
    const monthlyClaims = months.map(month => {
      return claims.filter(claim => {
        const claimDate = new Date(claim.submittedDate);
        const claimMonth = claimDate.toLocaleDateString('th-TH', { month: 'short', year: 'numeric' });
        return claimMonth === month;
      }).length;
    });
    
    return { months, counts: monthlyClaims };
  };
  
  const monthlyData = getMonthlyData();
  
  // Calculate approval rate
  const approvedClaims = statusCounts[ClaimStatus.Approved] || 0;
  const rejectedClaims = statusCounts[ClaimStatus.Rejected] || 0;
  const totalProcessed = approvedClaims + rejectedClaims;
  const approvalRate = totalProcessed > 0 ? (approvedClaims / totalProcessed) * 100 : 0;
  
  // Calculate fraud detection rate
  const flaggedClaims = statusCounts[ClaimStatus.Flagged] || 0;
  const fraudDetectionRate = totalClaims > 0 ? (flaggedClaims / totalClaims) * 100 : 0;
  
  // Calculate average authenticity score
  const claimsWithScore = claims.filter(claim => claim.authenticityScore !== undefined);
  const averageAuthenticityScore = claimsWithScore.length > 0 
    ? claimsWithScore.reduce((sum, claim) => sum + (claim.authenticityScore || 0), 0) / claimsWithScore.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ChartBarIcon className="w-6 h-6" />
            แดชบอร์ดวิเคราะห์ข้อมูล
          </h2>
          <p className="text-sm text-gray-600">ภาพรวมและสถิติการเบิกจ่ายค่าใช้จ่ายด้านสุขภาพ</p>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Claims */}
        <div className="liquid-glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">คำร้องทั้งหมด</p>
              <p className="text-2xl font-bold text-gray-900">{totalClaims}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Amount */}
        <div className="liquid-glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">มูลค่ารวม</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Approval Rate */}
        <div className="liquid-glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">อัตราการอนุมัติ</p>
              <p className="text-2xl font-bold text-gray-900">{approvalRate.toFixed(1)}%</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Fraud Detection Rate */}
        <div className="liquid-glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">อัตราการตรวจจับการฉ้อโกง</p>
              <p className="text-2xl font-bold text-gray-900">{fraudDetectionRate.toFixed(1)}%</p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <ShieldExclamationIcon className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Chart */}
        <div className="liquid-glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">การกระจายสถานะคำร้อง</h3>
          <div className="space-y-3">
            {Object.entries(statusCounts).map(([status, count]) => {
              const percentage = totalClaims > 0 ? (count / totalClaims) * 100 : 0;
              const getStatusColor = (status: string) => {
                switch (status) {
                  case ClaimStatus.Approved: return 'bg-green-500';
                  case ClaimStatus.Rejected: return 'bg-red-500';
                  case ClaimStatus.Pending: return 'bg-yellow-500';
                  case ClaimStatus.Flagged: return 'bg-red-600';
                  case ClaimStatus.UnderReview: return 'bg-orange-500';
                  default: return 'bg-gray-500';
                }
              };
              
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}></div>
                    <span className="text-sm text-gray-700">{status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getStatusColor(status)}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Risk Level Distribution */}
        <div className="liquid-glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">การกระจายระดับความเสี่ยง</h3>
          <div className="space-y-3">
            {Object.entries(riskCounts).map(([risk, count]) => {
              const percentage = totalClaims > 0 ? (count / totalClaims) * 100 : 0;
              const getRiskColor = (risk: string) => {
                switch (risk) {
                  case 'high': return 'bg-red-500';
                  case 'medium': return 'bg-orange-500';
                  case 'low': return 'bg-green-500';
                  default: return 'bg-gray-500';
                }
              };
              
              const getRiskText = (risk: string) => {
                switch (risk) {
                  case 'high': return 'ความเสี่ยงสูง';
                  case 'medium': return 'ความเสี่ยงปานกลาง';
                  case 'low': return 'ความเสี่ยงต่ำ';
                  default: return risk;
                }
              };
              
              return (
                <div key={risk} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getRiskColor(risk)}`}></div>
                    <span className="text-sm text-gray-700">{getRiskText(risk)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getRiskColor(risk)}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Monthly Trends Chart */}
      <div className="liquid-glass-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">แนวโน้มรายเดือน</h3>
        <div className="h-64 flex items-end justify-between gap-2">
          {monthlyData.counts.map((count, index) => {
            const maxCount = Math.max(...monthlyData.counts);
            const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
            
            return (
              <div key={index} className="flex flex-col items-center gap-2 flex-1">
                <div className="text-xs text-gray-600 text-center">
                  {monthlyData.months[index]}
                </div>
                <div className="w-full bg-gray-200 rounded-t-lg relative" style={{ height: '120px' }}>
                  <div 
                    className="bg-blue-500 rounded-t-lg transition-all duration-300 hover:bg-blue-600"
                    style={{ height: `${height}%` }}
                  ></div>
                </div>
                <div className="text-xs font-medium text-gray-900">{count}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fraud Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fraud Types */}
        <div className="liquid-glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
            ประเภทการฉ้อโกงที่พบ
          </h3>
          <div className="space-y-3">
            {Object.entries(fraudTypeCounts).map(([type, count]) => {
              const percentage = totalClaims > 0 ? (count / totalClaims) * 100 : 0;
              
              return (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Authenticity Score */}
        <div className="liquid-glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">คะแนนความน่าเชื่อถือเฉลี่ย</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {(() => {
                if (averageAuthenticityScore >= 81) return '81-100%';
                if (averageAuthenticityScore >= 61) return '61-80%';
                if (averageAuthenticityScore >= 41) return '41-60%';
                if (averageAuthenticityScore >= 21) return '21-40%';
                return '0-20%';
              })()}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
              <div 
                className={`h-4 rounded-full ${
                  averageAuthenticityScore >= 81 ? 'bg-green-500' :
                  averageAuthenticityScore >= 61 ? 'bg-green-400' :
                  averageAuthenticityScore >= 41 ? 'bg-yellow-500' :
                  averageAuthenticityScore >= 21 ? 'bg-red-400' : 'bg-red-500'
                }`}
                style={{ width: `${averageAuthenticityScore}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              {averageAuthenticityScore >= 81 ? 'คุณภาพดีมาก' :
               averageAuthenticityScore >= 61 ? 'คุณภาพดี' :
               averageAuthenticityScore >= 41 ? 'คุณภาพปานกลาง' :
               averageAuthenticityScore >= 21 ? 'คุณภาพต่ำ' : 'ต้องตรวจสอบเพิ่มเติม'}
            </p>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="liquid-glass-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUpIcon className="w-5 h-5 text-blue-600" />
          ข้อมูลเชิงลึก
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">
                มูลค่าเฉลี่ยต่อคำร้อง: {formatCurrency(averageAmount)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-700">
                คำร้องที่รอดำเนินการ: {statusCounts[ClaimStatus.Pending] || 0} รายการ
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-700">
                คำร้องที่ทำเครื่องหมาย: {statusCounts[ClaimStatus.Flagged] || 0} รายการ
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-700">
                อัตราการปฏิเสธ: {totalProcessed > 0 ? ((rejectedClaims / totalProcessed) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-700">
                คำร้องที่มีความเสี่ยงสูง: {riskCounts.high || 0} รายการ
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-700">
                คำร้องที่มีความเสี่ยงปานกลาง: {riskCounts.medium || 0} รายการ
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 