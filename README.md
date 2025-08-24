# 🐾 VetCare Assistant

A modern web application built with Next.js that provides veterinary care assistance and pet healthcare services.

## 🌟 Features

### Authentication & User Management
- Secure user signup and login system
- JWT-based authentication
- Protected routes for authenticated users
- User profile management
- Secure logout functionality

### Core Features
- **Veterinary Consultation**: Direct access to veterinary expertise
- **Pet Health Information**: Comprehensive resources about pet care
- **Service Directory**: List of available veterinary services
- **Contact Support**: Easy way to reach out for assistance

### User Interface
- Modern, responsive design
- Mobile-friendly navigation
- Interactive components using shadcn/ui
- Smooth animations with Framer Motion
- Dark mode support

## 🛠️ Technical Stack

- **Frontend**:
  - Next.js 14 (App Router)
  - React
  - TypeScript
  - Tailwind CSS
  - Framer Motion
  - shadcn/ui components

- **Backend**:
  - Next.js API Routes
  - MongoDB (Database)
  - JWT (Authentication)
  - bcrypt (Password Hashing)

## 💻 Getting Started

### Prerequisites
- Node.js 18.0 or later
- MongoDB Atlas account
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jhaalok1997/vetCare.git
cd vetCare
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔒 Environment Variables

Required environment variables:

- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `OPENAI_API_KEY`: (Optional) For AI-powered features

## 📱 Features Overview

### Public Pages
- **Home**: Introduction to VetCare services
- **About**: Information about our mission and team
- **Services**: List of available veterinary services
- **Contact**: Get in touch with our team

### Protected Features
- **Dashboard**: Personalized user dashboard
- **Pet Profiles**: Manage pet information
- **Consultation History**: Track veterinary consultations
- **Health Records**: Store and manage pet health records

## 🎨 UI Components

The application uses shadcn/ui components for a consistent and modern look:
- Custom Button components
- Navigation Menu
- Modal Dialogs
- Form Elements
- Cards
- Sheets for mobile navigation

## 🔐 Authentication Flow

1. **Sign Up**:
   - User provides email and password
   - Password is hashed using bcrypt
   - User data is stored in MongoDB
   - Verification email sent (optional feature)

2. **Login**:
   - User provides credentials
   - JWT token generated upon successful authentication
   - Token stored in HTTP-only cookie
   - User redirected to dashboard

3. **Protected Routes**:
   - JWT verification for protected routes
   - Automatic redirect to login for unauthenticated users
   - Secure session management

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT-based authentication
- HTTP-only cookies
- Protected API routes
- Input validation and sanitization
- CORS protection
- Rate limiting

## 📝 API Routes

- `/api/Auth/signup`: User registration
- `/api/Auth/login`: User authentication
- `/api/Auth/logout`: User logout
- `/api/Auth/me`: Get current user
- Additional routes for core features

## 🎯 Future Enhancements

- Real-time chat with veterinarians
- Online appointment scheduling
- Pet health reminders
- Integration with pet health devices
- Telehealth consultations
- Mobile app development

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Alok Kumar Jha** - *Initial work* - [jhaalok1997](https://github.com/jhaalok1997)

## 🙏 Acknowledgments

- shadcn/ui for the beautiful components
- Next.js team for the amazing framework
- MongoDB team for the reliable database
- All contributors and supporters

---
Made with ❤️ by Alok Kumar Jha
