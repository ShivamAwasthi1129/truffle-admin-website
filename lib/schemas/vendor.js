// Vendor schema based on the new document structure
export const VENDOR_VERIFICATION_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended'
}

export const VENDOR_ACCOUNT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended'
}

export const BUSINESS_TYPES = {
  COMPANY: 'company',
  INDIVIDUAL: 'individual',
  PARTNERSHIP: 'partnership',
  LLC: 'llc',
  CORPORATION: 'corporation'
}

export const EXPERIENCE_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert'
}

export const SERVICE_CATEGORIES = {
  PRIVATE_JETS: 'private_jets',
  CHARTER_FLIGHTS: 'charter_flights',
  YACHTS: 'yachts',
  LUXURY_CARS: 'luxury_cars',
  SUPER_CARS: 'super_cars',
  HELICOPTERS: 'helicopters'
}

export const createVendorSchema = {
  firstName: String,
  lastName: String,
  email: String,
  password: String, // Will be hashed
  phone: String,
  businessName: String,
  businessType: String,
  businessRegistrationNumber: String,
  taxId: String,
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  serviceCategories: [{
    category: String,
    description: String,
    experience: String,
    yearsOfExperience: Number,
    certifications: [String]
  }],
  verificationStatus: String,
  verificationNotes: String,
  verifiedAt: Date,
  verifiedBy: String,
  accountStatus: String,
  adminPanelAccess: Boolean,
  receiveUpdates: Boolean,
  notificationPreferences: {
    email: Boolean,
    sms: Boolean,
    push: Boolean
  },
  stats: {
    totalListings: Number,
    totalBookings: Number,
    totalRevenue: Number,
    rating: Number,
    reviewCount: Number
  },
  lastLoginAt: Date,
  createdAt: Date,
  updatedAt: Date
}

export const vendorRegistrationSchema = {
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  phone: String,
  businessName: String,
  businessType: String,
  businessRegistrationNumber: String,
  taxId: String,
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  serviceCategories: [{
    category: String,
    description: String,
    experience: String,
    yearsOfExperience: Number,
    certifications: [String]
  }]
}

export const vendorUpdateSchema = {
  firstName: String,
  lastName: String,
  phone: String,
  businessName: String,
  businessType: String,
  businessRegistrationNumber: String,
  taxId: String,
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  serviceCategories: [{
    category: String,
    description: String,
    experience: String,
    yearsOfExperience: Number,
    certifications: [String]
  }],
  verificationStatus: String,
  verificationNotes: String,
  accountStatus: String,
  adminPanelAccess: Boolean,
  receiveUpdates: Boolean,
  notificationPreferences: {
    email: Boolean,
    sms: Boolean,
    push: Boolean
  }
}

export const vendorLoginSchema = {
  email: String,
  password: String
}
