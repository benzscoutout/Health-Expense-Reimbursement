
import { Claim, ClaimStatus } from './types';

// Thai language constants
export const THAI_TEXT = {
  // Status
  PENDING: 'รอดำเนินการ',
  APPROVED: 'อนุมัติแล้ว',
  REJECTED: 'ปฏิเสธแล้ว',
  
  // Navigation
  EMPLOYEE_DASHBOARD: 'แดชบอร์ดพนักงาน',
  ADMIN_DASHBOARD: 'แดชบอร์ดผู้ดูแล',
  SUBMIT_CLAIM: 'ส่งคำร้อง',
  VIEW_CLAIMS: 'ดูคำร้องทั้งหมด',
  
  // Form labels
  RECEIPT_IMAGE: 'รูปใบเสร็จ',
  VENDOR: 'ร้านค้า/สถานพยาบาล',
  DATE: 'วันที่',
  TOTAL_AMOUNT: 'จำนวนเงินรวม',
  DESCRIPTION: 'รายละเอียด',
  AMOUNT: 'จำนวนเงิน',
  FEEDBACK: 'ความคิดเห็น',
  
  // Actions
  SUBMIT: 'ส่งคำร้อง',
  APPROVE: 'อนุมัติ',
  REJECT: 'ปฏิเสธ',
  EDIT: 'แก้ไข',
  DELETE: 'ลบ',
  CANCEL: 'ยกเลิก',
  
  // Messages
  CLAIM_SUBMITTED: 'ส่งคำร้องเรียบร้อยแล้ว',
  CLAIM_UPDATED: 'อัปเดตคำร้องเรียบร้อยแล้ว',
  ERROR_OCCURRED: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
  
  // Currency
  CURRENCY: 'THB',
  CURRENCY_SYMBOL: '฿'
};

// Format currency to Thai Baht
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2
  }).format(amount);
};
