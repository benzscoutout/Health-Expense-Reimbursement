
export enum ClaimStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export enum UserRole {
  Employee = 'Employee',
  Admin = 'Admin',
}

export interface ReceiptItem {
  description: string;
  amount: number;
}

export interface ReceiptData {
  vendor: string;
  date: string;
  total: number;
  items: ReceiptItem[];
}

export interface Claim {
  id: string;
  employeeName: string;
  submittedDate: string;
  receiptImage: string | File; // base64 string or File object
  receiptData: ReceiptData;
  status: ClaimStatus;
  feedback?: string;
}
