# Admin Panel

This admin panel provides role-based access control for managing the Vet Assistant application.

## Features

- **Dashboard Overview**: View key statistics and analytics of the application
- **User Management**: Monitor and manage all registered users
- **Analytics Dashboard**: Track user engagement and application metrics
- **Role-based Access**: Restricted access only for admin users
- **Secure Authentication**: JWT-based authentication with role verification

## Access

1. Navigate to `/Auth/login` and sign in with admin credentials
2. System will verify admin role and permissions
3. Upon successful authentication, you'll be redirected to `/admin`
4. Access is protected by AdminAuthWrapper component

## Admin Routes

- `/admin` - Main dashboard with overview statistics
- `/admin/users` - User management interface
- `/admin/analytics` - Detailed analytics and metrics

## Component Structure

- `components/Admin/`
  - `layout.tsx` - Main admin layout wrapper
  - `page.tsx` - Dashboard component
  - `Analytics/page.tsx` - Analytics view
  - `AuthWrapper/AdminAuthWrapper.tsx` - Admin authentication wrapper
  - `Header/AdminHeader.tsx` - Admin panel header
  - `Sidebar/AdminSidebar.tsx` - Navigation sidebar
  - `Users/page.tsx` - User management interface

## API Endpoints

- `GET /api/admin/dashboard` - Fetch dashboard statistics
- `GET /api/admin/users` - Retrieve user management data
- `GET /api/admin/analytics` - Get analytics metrics

## Security Features

- Protected routes with middleware authentication
- Role-based access control (RBAC)
- Secure API endpoints with authentication checks
- Client-side route protection via AuthWrapper

## User Roles

- `user` - Regular application users
- `veterinarian` - Registered veterinarians
- `admin` - System administrators with full access
