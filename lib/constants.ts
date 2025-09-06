export const ISSUE_CATEGORIES = {
  ROADS_TRANSPORT: {
    label: "Roads & Transport",
    subcategories: ["Potholes", "Traffic Signals", "Road Signs", "Public Transit", "Parking Issues"],
  },
  UTILITIES: {
    label: "Utilities",
    subcategories: ["Street Lights", "Power Lines", "Water Supply", "Gas Lines", "Internet/Cable"],
  },
  ENVIRONMENT: {
    label: "Environment",
    subcategories: ["Graffiti", "Litter", "Air Quality", "Noise Pollution", "Illegal Dumping"],
  },
  PUBLIC_SAFETY: {
    label: "Public Safety",
    subcategories: ["Broken Equipment", "Unsafe Conditions", "Emergency Access", "Security Issues"],
  },
  INFRASTRUCTURE: {
    label: "Infrastructure",
    subcategories: ["Sidewalks", "Bridges", "Buildings", "Drainage", "Construction Issues"],
  },
  WASTE_MANAGEMENT: {
    label: "Waste Management",
    subcategories: ["Missed Collection", "Overflowing Bins", "Recycling Issues", "Hazardous Waste"],
  },
  PARKS_RECREATION: {
    label: "Parks & Recreation",
    subcategories: ["Playground Equipment", "Sports Facilities", "Landscaping", "Park Maintenance"],
  },
  HOUSING: {
    label: "Housing",
    subcategories: ["Public Housing", "Building Violations", "Zoning Issues", "Property Maintenance"],
  },
  HEALTH_SANITATION: {
    label: "Health & Sanitation",
    subcategories: ["Pest Control", "Food Safety", "Public Restrooms", "Water Quality"],
  },
  OTHER: {
    label: "Other",
    subcategories: ["General Inquiry", "Suggestion", "Complaint", "Other Issue"],
  },
} as const

export const PRIORITY_LEVELS = {
  LOW: { label: "Low", color: "bg-green-500" },
  MEDIUM: { label: "Medium", color: "bg-yellow-500" },
  HIGH: { label: "High", color: "bg-orange-500" },
  CRITICAL: { label: "Critical", color: "bg-red-500" },
} as const

export const REPORT_STATUSES = {
  PENDING: { label: "Pending", color: "bg-gray-500" },
  ACKNOWLEDGED: { label: "Acknowledged", color: "bg-blue-500" },
  IN_PROGRESS: { label: "In Progress", color: "bg-yellow-500" },
  RESOLVED: { label: "Resolved", color: "bg-green-500" },
  REJECTED: { label: "Rejected", color: "bg-red-500" },
  DUPLICATE: { label: "Duplicate", color: "bg-purple-500" },
} as const

export const APP_CONFIG = {
  name: "MetroCare",
  description: "Civic Issue Reporting System",
  version: "1.0.0",
  maxImageUploads: 5,
  maxImageSize: 10 * 1024 * 1024, // 10MB
  supportedImageTypes: ["image/jpeg", "image/png", "image/webp"],
  otpExpiryMinutes: 10,
  similarityThreshold: 0.8,
} as const
