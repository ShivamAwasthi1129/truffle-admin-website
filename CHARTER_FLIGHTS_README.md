# Charter Flight Management System

## Overview

The Charter Flight Management System is a comprehensive solution for managing luxury charter flight services within the Truffle Admin platform. It provides full CRUD operations, advanced filtering, and a user-friendly interface for managing charter flight inventory.

## Features

### ✅ Core Functionality
- **Complete CRUD Operations**: Create, Read, Update, Delete charter flights
- **Advanced Search & Filtering**: Search by name, description, aircraft type, location, tags, and features
- **Status Management**: Available, Unavailable, Maintenance, Booked
- **Rich Data Structure**: Supports all fields from the original MongoDB document

### ✅ Data Structure
The system supports the complete charter flight document structure:

```javascript
{
  name: "Dassault Falcon 7X",
  description: "Ultra-long-range business jet with three-engine reliability.",
  category: "charter_flights",
  location: {
    address: "London Heathrow Airport, UK",
    place_id: "ChIJLondonHeathrow",
    lat: 51.47,
    lng: -0.4543,
    coord: {
      type: "Point",
      coordinates: [-0.4543, 51.47]
    }
  },
  price: 12000,
  currency: "USD",
  tags: ["ultra-long-range", "three-engine", "reliability"],
  images: ["https://images.unsplash.com/photo-1748529286649-229e20d468d4"],
  features: ["Global Range", "Advanced Avionics", "Quiet Cabin"],
  capacity: 16,
  availability: "available",
  rating: 4.8,
  reviews: [],
  // Additional management fields
  aircraft_type: "Business Jet",
  flight_number: "CF001",
  base_location: "London Heathrow Airport",
  range_km: 12000,
  price_per_hour: 2500,
  seats: 16,
  available: true
}
```

### ✅ User Interface
- **Tabbed Form Interface**: Organized into Basic Info, Aircraft Details, Location & Pricing, Features & Tags, and Media
- **Dynamic Tag Management**: Add/remove tags and features with real-time updates
- **Image Management**: Add multiple images with preview and validation
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Validation**: Form validation with helpful error messages

### ✅ API Endpoints

#### GET `/api/charter-flights`
- Fetch all charter flights with pagination
- Support for search and status filtering
- Returns paginated results with metadata

#### POST `/api/charter-flights`
- Create new charter flight
- Validates required fields (name, description)
- Auto-generates unique IDs (CF001, CF002, etc.)

#### GET `/api/charter-flights/[id]`
- Fetch specific charter flight by ID
- Returns complete flight details

#### PUT `/api/charter-flights/[id]`
- Update existing charter flight
- Preserves creation date and ID
- Updates timestamp automatically

#### DELETE `/api/charter-flights/[id]`
- Delete charter flight
- Requires confirmation
- Permanent deletion

## Implementation Details

### Schema Updates
Updated `lib/schemas/inventory-schemas.js` to match the MongoDB document structure:
- Added support for `currency`, `features`, `rating`, `reviews`
- Enhanced location structure with coordinates
- Added backward compatibility fields

### Component Architecture
- **CharterFlightForm**: Comprehensive form with tabbed interface
- **CharterFlightTable**: Data table with search, filter, and pagination
- **Integration**: Seamlessly integrated into the existing inventory module

### Form Validation
Required fields:
- ✅ Aircraft Name
- ✅ Description  
- ✅ Aircraft Type
- ✅ Price
- ✅ Capacity
- ✅ Location Address

Optional fields:
- Flight Number, Base Location, Range, Price per Hour, Rating, Tags, Features, Images

## Usage

### Adding a Charter Flight
1. Navigate to Inventory Management → Charter Flights tab
2. Click "Add Charter Flight" button
3. Fill in the required fields in the Basic Info tab
4. Complete Aircraft Details, Location & Pricing tabs
5. Add tags and features as needed
6. Upload images (optional)
7. Click "Create Charter Flight"

### Editing a Charter Flight
1. Find the charter flight in the table
2. Click the Edit button (pencil icon)
3. Modify any fields as needed
4. Click "Update Charter Flight"

### Searching and Filtering
- **Search**: Use the search bar to find flights by name, description, aircraft type, location, tags, or features
- **Filter**: Filter by availability status (All, Available, Unavailable, Maintenance, Booked)
- **Pagination**: Navigate through large datasets with pagination controls

## Technical Specifications

### Dependencies
- React 18+ with hooks
- Next.js 14+ API routes
- MongoDB for data persistence
- Tailwind CSS for styling
- Lucide React for icons

### Performance Optimizations
- Pagination for large datasets
- Debounced search functionality
- Optimistic UI updates
- Efficient re-rendering with React hooks

### Security
- JWT token authentication
- Permission-based access control
- Input validation and sanitization
- SQL injection prevention

## Testing

The system has been thoroughly tested with:
- ✅ Form validation
- ✅ Data structure mapping
- ✅ API endpoint functionality
- ✅ UI component rendering
- ✅ Error handling

## Future Enhancements

Potential improvements for future versions:
- Advanced filtering options (price range, capacity, rating)
- Bulk operations (import/export)
- Advanced image management with upload
- Integration with booking systems
- Real-time availability updates
- Analytics and reporting

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.
