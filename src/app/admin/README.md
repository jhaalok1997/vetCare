# Admin Panel

This admin panel provides role-based access control for managing the Vet Assistant application.

## Features

- **Dashboard Overview**: View key statistics including total users, active users, veterinarians, and admins
- **User Management**: Monitor and filter users by status and role
- **Role-based Access**: Only users with "admin" role can access the panel
- **Persistent Sessions**: Admin sessions last 24 hours (vs 1 hour for regular users)
- **Secure Authentication**: JWT-based authentication with role verification

## Access

1. Navigate to the main login page (`/login`)
2. Login with admin credentials (email and password)
3. You'll be automatically redirected to `/admin` dashboard
4. Admin sessions last 24 hours for full access without re-authentication

## Admin Routes

- `/admin` - Dashboard overview
- `/admin/users` - User management and monitoring
- `/admin/analytics` - Analytics (placeholder)
- `/admin/vets` - Veterinarian management (placeholder)
- `/admin/reports` - Reports (placeholder)
- `/admin/settings` - Settings (placeholder)

## Security

- All admin routes are protected by middleware
- Role verification happens on both client and server side
- Admin sessions have extended duration (24 hours)
- Non-admin users are redirected away from admin routes

## API Endpoints

- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - User list with statistics

## User Roles

- `petOwner` - Regular pet owners
- `vet` - Veterinarians
- `admin` - System administrators (full access)
