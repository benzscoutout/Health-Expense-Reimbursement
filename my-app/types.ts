
export enum ClaimStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Flagged = 'Flagged', // New status for suspicious claims
  UnderReview = 'UnderReview', // For claims being investigated
}

export enum UserRole {
  Employee = 'Employee',
  Admin = 'Admin',
}

export enum FraudSeverity {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

export enum FraudType {
  SuspiciousPattern = 'suspicious_pattern',
  ImageManipulation = 'image_manipulation',
  DuplicateReceipt = 'duplicate_receipt',
  UnusualAmount = 'unusual_amount',
  VendorMismatch = 'vendor_mismatch',
  DateAnomaly = 'date_anomaly',
  ReceiptFormatInconsistency = 'receipt_format_inconsistency',
}

export interface FraudIndicator {
  type: FraudType;
  severity: FraudSeverity;
  description: string;
  confidence: number;
  detectedAt: string;
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
  description?: string;
}

export interface Claim {
  id: string;
  employeeName: string;
  submittedDate: string;
  receiptImage: string | File; // base64 string or File object
  receiptData: ReceiptData;
  status: ClaimStatus;
  feedback?: string;
  // New fraud detection fields
  fraudIndicators?: FraudIndicator[];
  authenticityScore?: number;
  fraudRiskLevel?: 'low' | 'medium' | 'high';
  flaggedBy?: string; // HR user who flagged the claim
  flaggedAt?: string;
  investigationNotes?: string[];
  duplicateCheck?: {
    isDuplicate: boolean;
    similarClaims?: Array<{
      claimId: string;
      similarityScore: number;
      reason: string;
    }>;
    similarityScore?: number;
  };
}
