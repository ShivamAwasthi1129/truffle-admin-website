# Trufle Admin Dashboard

A luxury concierge service operations panel built with Next.js, featuring role-based authentication and comprehensive admin functionality.

## Features

- **Role-Based Authentication**: Three user roles (Super Admin, Admin, Billing Specialist)
- **Secure Login System**: JWT-based authentication with protected routes
- **Vendor Management**: Complete vendor onboarding and management system
- **Inventory Management**: Asset tracking and management
- **Form Validation**: Comprehensive form validation with error handling
- **Responsive Design**: Modern UI with dark theme

## User Roles & Permissions

### Super Admin
- Access to all modules
- Full system administration capabilities

### Admin  
- Access to: Inventory, Vendors, Clients, Concierges, Bookings, Analytics
- Operational management capabilities

### Billing Specialist
- Access to: Service Commissions, Concierge Commissions, Analytics
- Financial management capabilities

## Demo Credentials

- **Super Admin**: `superadmin@trufle.com` / `SuperAdmin123!`
- **Admin**: `admin@trufle.com` / `Admin123!`
- **Billing Specialist**: `billing@trufle.com` / `Billing123!`

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env.local` file with:
   ```
   JWT_SECRET=your-super-secret-jwt-key-change-in-production-12345
   MONGODB_URI=mongodb+srv://hexerve:hexerve@cluster0.zy7afj9.mongodb.net/trufle-admin
   MONGODB_DB=trufle-admin
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Access Application**
   - Open http://localhost:3000
   - You'll be redirected to the login page
   - Use the demo credentials above to access different role-based dashboards

## Project Structure

```
├── app/
│   ├── api/auth/          # Authentication API routes
│   ├── api/vendors/       # Vendor management API
│   ├── login/             # Login page
│   ├── unauthorized/      # Access denied page
│   └── page.jsx           # Main dashboard
├── components/
│   ├── ui/                # Reusable UI components (JSX)
│   ├── modules/           # Feature modules
│   ├── sidebar.jsx        # Navigation sidebar
│   └── protected-route.jsx # Route protection
├── lib/
│   ├── auth.js            # Authentication utilities
│   ├── auth-context.jsx   # React auth context
│   ├── mongodb.js         # Database connection
│   └── schemas/           # Data schemas
└── public/                # Static assets
```

## Key Features Implemented

✅ **Complete TypeScript to JSX Conversion**
✅ **Role-Based Authentication System**
✅ **Secure Login Page with Form Validation**
✅ **Protected Routes with Permission Checks**
✅ **Vendor Management with CRUD Operations**
✅ **Inventory Management System**
✅ **Form Validation with Error Handling**
✅ **Responsive Design with Dark Theme**
✅ **Database Integration with MongoDB**
✅ **Dummy Data Initialization**

## Technology Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB
- **Authentication**: JWT, bcryptjs
- **UI Components**: Radix UI, Lucide React Icons
- **Form Handling**: React Hook Form with validation

## Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Protected API routes
- Role-based access control
- Form validation and sanitization
- Secure session management

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run the development server: `npm run dev`
5. Access the application at http://localhost:3000
6. Login with demo credentials to test different user roles

The application is now fully functional with authentication, role-based access control, and comprehensive admin functionality.
