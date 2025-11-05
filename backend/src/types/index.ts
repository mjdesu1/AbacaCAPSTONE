// types/index.ts - Shared types and interfaces

export interface APIResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
}

export interface Timestamped {
  createdAt: string;
  updatedAt: string;
}

// Extend Express Request type for authenticated requests
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        userType: UserType;
        email: string;
        isSuperAdmin?: boolean; // Super Admin flag for officers
      };
    }
  }
}

// =====================================================
// AUTHENTICATION TYPES
// =====================================================

export type UserType = 'farmer' | 'buyer' | 'officer';

export interface JWTPayload {
  userId: string;
  userType: UserType;
  email: string;
  isSuperAdmin?: boolean; // Super Admin flag for officers
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// =====================================================
// FARMER TYPES
// =====================================================

export interface FarmerRegistration {
  // Personal Information
  fullName: string;
  sex?: 'Male' | 'Female' | 'Other';
  age?: number;
  contactNumber?: string;
  
  // Address Information
  address?: string;
  barangay?: string;
  municipality?: string;
  
  // Association Information
  associationName?: string;
  
  // Farm Information
  farmLocation?: string;
  farmCoordinates?: string;
  farmAreaHectares?: number;
  yearsInFarming?: number;
  typeOfAbacaPlanted?: string;
  
  // Harvest Information
  averageHarvestVolumeKg?: number;
  harvestFrequencyWeeks?: number;
  sellingPriceRangeMin?: number;
  sellingPriceRangeMax?: number;
  regularBuyer?: string;
  incomePerCycle?: number;
  
  // Authentication
  email: string;
  password: string;
  
  // Verification Documents
  profilePhoto?: string; // Base64 or URL
  validIdPhoto?: string; // Base64 or URL
  
  // Additional
  remarks?: string;
  
  // reCAPTCHA
  recaptchaToken?: string;
}

export interface Farmer extends Omit<FarmerRegistration, 'password' | 'recaptchaToken'> {
  farmerId: string;
  isActive: boolean;
  isVerified: boolean;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

// =====================================================
// BUYER TYPES
// =====================================================

export interface BuyerRegistration {
  // Business Information
  businessName: string;
  ownerName: string;
  businessAddress?: string;
  contactNumber?: string;
  email: string;
  
  // Accreditation
  licenseOrAccreditation?: string;
  
  // Buying Information
  buyingSchedule?: string;
  buyingLocation?: string;
  warehouseAddress?: string;
  
  // Quality & Pricing
  acceptedQualityGrades?: string[];
  priceRangeMin?: number;
  priceRangeMax?: number;
  paymentTerms?: string;
  
  // Partnerships
  partneredAssociations?: string[];
  
  // Authentication
  password: string;
  
  // Verification Documents
  profilePhoto?: string; // Base64 or URL - Owner's photo
  validIdPhoto?: string; // Base64 or URL - Owner's ID
  businessPermitPhoto?: string; // Base64 or URL - Business permit/license
  
  // Additional
  remarks?: string;
  
  // reCAPTCHA
  recaptchaToken?: string;
}

export interface Buyer extends Omit<BuyerRegistration, 'password' | 'recaptchaToken'> {
  buyerId: string;
  isActive: boolean;
  isVerified: boolean;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

// =====================================================
// ASSOCIATION OFFICER TYPES
// =====================================================

export interface OfficerRegistration {
  // Basic Information (Required for account creation)
  fullName: string;
  email: string;
  password: string;
  profilePicture?: string; // Optional profile picture URL
  isSuperAdmin?: boolean; // Super Admin flag (default: false)
  
  // Profile Information (Filled after first login)
  position?: string;
  associationName?: string;
  contactNumber?: string;
  address?: string;
  
  // Term Information (Filled after first login)
  termStartDate?: string;
  termEndDate?: string;
  termDuration?: string;
  
  // Supervision (Filled after first login)
  farmersUnderSupervision?: number;
  
  // Additional
  remarks?: string;
  
  // reCAPTCHA
  recaptchaToken?: string;
}

export interface AssociationOfficer extends Omit<OfficerRegistration, 'password' | 'recaptchaToken'> {
  officerId: string;
  isActive: boolean;
  isVerified: boolean;
  isSuperAdmin?: boolean; // Super Admin flag
  profileCompleted?: boolean; // True after first login profile fillup
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

// =====================================================
// LOGIN TYPES
// =====================================================

export interface LoginRequest {
  email: string;
  password: string;
  userType: UserType;
  recaptchaToken?: string;
}

export interface LoginResponse {
  user: Farmer | Buyer | AssociationOfficer;
  tokens: AuthTokens;
}

// =====================================================
// AUDIT LOG TYPES
// =====================================================

export interface AuthAuditLog {
  logId: string;
  userId?: string;
  userType?: UserType;
  action: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
  createdAt: string;
}