// Inventory schemas for different categories based on MongoDB collections

export const charterFlightsSchema = {
  _id: String,
  name: String,
  flight_number: String,
  aircraft_type: String,
  from: {
    address: String,
    place_id: String,
    lat: Number,
    lng: Number
  },
  to: {
    address: String,
    place_id: String,
    lat: Number,
    lng: Number
  },
  departure_time: String, // ISO date string
  arrival_time: String, // ISO date string
  price: Number,
  tags: [String],
  description: String,
  available: Boolean,
  images: [String],
  createdAt: String, // ISO date string
  updatedAt: String, // ISO date string
  seats: Number,
  category: String // "charter_flights"
}

export const helicoptersSchema = {
  _id: String,
  name: String,
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
  tags: [String],
  description: String,
  available: Boolean,
  images: [String],
  createdAt: String, // ISO date string
  updatedAt: String, // ISO date string
  category: String // "helicopters"
}

export const luxuryCarsSchema = {
  _id: String,
  name: String,
  make: String,
  model: String,
  seats: Number,
  transmission: String,
  price_per_day: Number,
  tags: [String],
  description: String,
  available: Boolean,
  location: {
    address: String,
    place_id: String,
    lat: Number,
    lng: Number
  },
  availability_windows: [Object],
  images: [String],
  createdAt: String, // ISO date string
  updatedAt: String, // ISO date string
  category: String // "luxury_cars"
}

export const privateJetsSchema = {
  _id: String,
  name: String,
  model: String,
  manufacturer: String,
  seats: Number,
  range_km: Number,
  base_airport: String,
  price_per_hour: Number,
  tags: [String],
  description: String,
  available: Boolean,
  location: {
    address: String,
    place_id: String,
    lat: Number,
    lng: Number
  },
  images: [String],
  createdAt: String, // ISO date string
  updatedAt: String, // ISO date string
  category: String // "private_jets"
}

export const superCarsSchema = {
  _id: String,
  name: String,
  make: String,
  model: String,
  horsepower: Number,
  price_per_day: Number,
  tags: [String],
  description: String,
  available: Boolean,
  location: {
    address: String,
    place_id: String,
    lat: Number,
    lng: Number
  },
  images: [String],
  createdAt: String, // ISO date string
  updatedAt: String, // ISO date string
  category: String // "super_cars"
}

export const yachtsSchema = {
  _id: String,
  name: String,
  length_m: Number,
  cabins: Number,
  price_per_day: Number,
  base_marina: {
    address: String,
    place_id: String,
    lat: Number,
    lng: Number
  },
  tags: [String],
  description: String,
  available: Boolean,
  images: [String],
  createdAt: String, // ISO date string
  updatedAt: String, // ISO date string
  category: String // "yachts"
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
