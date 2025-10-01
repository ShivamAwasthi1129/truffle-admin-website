// Inventory schemas for different categories based on MongoDB collections

export const charterFlightsSchema = {
  _id: String,
  name: String,
  description: String,
  category: String, // "charter_flights"
  location: {
    address: String,
    place_id: String,
    lat: Number,
    lng: Number,
    coord: {
      type: String, // "Point"
      coordinates: [Number, Number] // [lng, lat]
    }
  },
  currency: String, // "USD", "EUR", etc.
  tags: [String],
  images: [String],
  features: [String],
  capacity: Number,
  availability: String, // "available", "unavailable", "maintenance"
  rating: Number,
  reviews: [Object],
  createdAt: String, // ISO date string
  updatedAt: String, // ISO date string
  // Additional fields for charter flight management
  aircraft_type: String,
  flight_number: String,
  base_location: String,
  range_km: Number,
  price_per_hour: Number,
  seats: Number,
  available: Boolean, // for backward compatibility
  // New fields as per requirements
  registration_no: String,
  max_speed_knots: Number,
  range: Number,
  cabin_height: Number,
  engine_type: String,
  last_maintenance: String, // ISO date string
  insurance_expiry: String // ISO date string
}

export const helicoptersSchema = {
  _id: String,
  name: String,
  description: String,
  category: String, // "helicopters"
  location: {
    address: String,
    place_id: String,
    lat: Number,
    lng: Number,
    coord: {
      type: String, // "Point"
      coordinates: [Number, Number] // [lng, lat]
    }
  },
  currency: String, // "USD", "EUR", etc.
  tags: [String],
  images: [String],
  features: [String],
  capacity: Number,
  availability: String, // "available", "unavailable", "maintenance"
  rating: Number,
  reviews: [Object],
  createdAt: String, // ISO date string
  updatedAt: String, // ISO date string
  // Additional fields for helicopter management
  model: String,
  seats: Number,
  range_km: Number,
  base_location: {
    address: String,
    place_id: String,
    lat: Number,
    lng: Number
  },
  price_per_hour: Number,
  available: Boolean, // for backward compatibility
  // New fields as per requirements
  max_speed_knots: Number,
  range: Number,
  last_maintenance: String, // ISO date string
  insurance_expiry: String, // ISO date string
  cabin_height: Number,
  engine_type: String,
  registration_no: String
}

export const luxuryCarsSchema = {
  _id: String,
  name: String,
  description: String,
  category: String, // "luxury_cars"
  location: {
    address: String,
    place_id: String,
    lat: Number,
    lng: Number,
    coord: {
      type: String, // "Point"
      coordinates: [Number, Number] // [lng, lat]
    }
  },
  currency: String, // "USD", "EUR", etc.
  tags: [String],
  images: [String],
  features: [String],
  capacity: Number,
  availability: String, // "available", "unavailable", "maintenance"
  rating: Number,
  reviews: [Object],
  createdAt: String, // ISO date string
  updatedAt: String, // ISO date string
  // Additional fields for luxury car management
  make: String,
  model: String,
  seats: Number,
  transmission: String,
  price_per_day: Number,
  available: Boolean, // for backward compatibility
  availability_windows: [Object],
  // New fields as per requirements
  max_speed: Number, // km/h
  range: Number, // km
  last_maintenance: String, // ISO date string
  insurance_expiry: String // ISO date string
}

export const privateJetsSchema = {
  _id: String,
  name: String,
  description: String,
  category: String, // "private_jets"
  location: {
    address: String,
    place_id: String,
    lat: Number,
    lng: Number,
    coord: {
      type: String, // "Point"
      coordinates: [Number, Number] // [lng, lat]
    }
  },
  price: Number,
  currency: String, // "USD", "EUR", etc.
  tags: [String],
  images: [String],
  features: [String],
  capacity: Number,
  availability: String, // "available", "unavailable", "maintenance"
  rating: Number,
  reviews: [Object],
  createdAt: String, // ISO date string
  updatedAt: String, // ISO date string
  // Additional fields for private jet management
  model: String,
  manufacturer: String,
  seats: Number,
  range_km: Number,
  base_airport: String,
  price_per_hour: Number,
  available: Boolean // for backward compatibility
}

export const superCarsSchema = {
  _id: String,
  name: String,
  description: String,
  category: String, // "super_cars"
  location: {
    address: String,
    place_id: String,
    lat: Number,
    lng: Number,
    coord: {
      type: String, // "Point"
      coordinates: [Number, Number] // [lng, lat]
    }
  },
  price: Number,
  currency: String, // "USD", "EUR", etc.
  tags: [String],
  images: [String],
  features: [String],
  capacity: Number,
  availability: String, // "available", "unavailable", "maintenance"
  rating: Number,
  reviews: [Object],
  createdAt: String, // ISO date string
  updatedAt: String, // ISO date string
  // Additional fields for super car management
  make: String,
  model: String,
  horsepower: Number,
  price_per_day: Number,
  available: Boolean // for backward compatibility
}

export const yachtsSchema = {
  _id: String,
  name: String,
  description: String,
  category: String, // "yachts"
  location: {
    address: String,
    place_id: String,
    lat: Number,
    lng: Number,
    coord: {
      type: String, // "Point"
      coordinates: [Number, Number] // [lng, lat]
    }
  },
  price: Number,
  currency: String, // "USD", "EUR", etc.
  tags: [String],
  images: [String],
  features: [String],
  capacity: Number,
  availability: String, // "available", "unavailable", "maintenance"
  rating: Number,
  reviews: [Object],
  createdAt: String, // ISO date string
  updatedAt: String, // ISO date string
  // Additional fields for yacht management
  length_m: Number,
  cabins: Number,
  price_per_day: Number,
  base_marina: {
    address: String,
    place_id: String,
    lat: Number,
    lng: Number
  },
  available: Boolean // for backward compatibility
}

// Collection mapping
export const COLLECTION_MAPPING = {
  'charter_flights': 'charter_flights',
  'helicopters': 'helicopters', 
  'luxury_cars': 'luxury_cars',
  'private_jets': 'private_jets',
  'super_cars': 'super_cars',
  'yachts': 'yachts'
}

// Category display mapping
export const CATEGORY_DISPLAY = {
  'charter_flights': {
    label: 'Charter Flights',
    icon: '✈️',
    collection: 'charter_flights'
  },
  'helicopters': {
    label: 'Helicopters',
    icon: '🚁',
    collection: 'helicopters'
  },
  'luxury_cars': {
    label: 'Luxury Cars',
    icon: '🚗',
    collection: 'luxury_cars'
  },
  'private_jets': {
    label: 'Private Jets',
    icon: '🛩️',
    collection: 'private_jets'
  },
  'super_cars': {
    label: 'Super Cars',
    icon: '🏎️',
    collection: 'super_cars'
  },
  'yachts': {
    label: 'Yachts',
    icon: '🛥️',
    collection: 'yachts'
  }
}

// Helper function to get collection name from category
export function getCollectionName(category) {
  return COLLECTION_MAPPING[category] || 'inventory'
}

// Helper function to get category display info
export function getCategoryInfo(category) {
  return CATEGORY_DISPLAY[category] || { label: category, icon: '📦', collection: 'inventory' }
}
