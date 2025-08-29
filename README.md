# 🐾 VetCare Assistant

An advanced AI-powered veterinary consultation platform built with Next.js, providing real-time veterinary information and assistance.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/atlas)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📚 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Architecture](#-architecture)
- [API Integration](#-api-integration)
- [Environment Setup](#-environment-setup)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🤖 AI-Powered Assistance
- **Real-time Veterinary Information**: Integrated with Groq and Tavily for up-to-date veterinary knowledge
- **Smart Query Processing**: Automatically detects and handles current (2025) information requests
- **Conversation History**: Maintains context-aware chat history per user
- **Domain-Specific Responses**: Focused on veterinary and animal health topics

### 🔐 Authentication & Security
- Secure JWT-based authentication
- Protected API routes
- MongoDB session management
- Password hashing with bcrypt

### 💻 User Interface
- Responsive, modern design
- Dark mode support
- Interactive components using shadcn/ui
- Real-time chat interface

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **State Management**: React Context

### Backend
- **Runtime**: Next.js API Routes
- **Database**: MongoDB Atlas
- **Caching**: Node-Cache
- **Authentication**: JWT

### AI & Search
- **LLM**: Groq (llama-3.1-8b-instant)
- **Web Search**: Tavily API
- **Response Format**: Markdown with bullet points

## � Getting Started

### Prerequisites
- Node.js 18.0 or later
- MongoDB Atlas account
- Groq API key
- Tavily API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jhaalok1997/vetCare.git
cd vetCare
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
TAVILY_API_KEY=your_tavily_api_key
ENABLE_TAVILY=true
```

4. Run the development server:
```bash
npm run dev
```

## 🏗 Architecture

### API Routes
- **/api/Auth/***: Authentication endpoints
- **/api/AskVetcare-button**: AI assistant endpoint
- **/api/ContactedUser**: User management

### Database Schema
- **Users**: Authentication and profile data
- **ContactedUsers**: User interaction records

### AI Processing Flow
1. Query validation and domain restriction
2. Current information detection
3. Tavily integration for recent data
4. Groq LLM for general knowledge
5. Response formatting and history management

## � API Integration

### Tavily Integration
```typescript
const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY });

// Specialized veterinary domain search
const searchOptions = {
  search_depth: "advanced",
  include_domains: [
    "avma.org",
    "vin.com",
    "merckvetmanual.com",
    // ... more domains
  ]
};
```

### Groq Integration
```typescript
const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.1-8b-instant",
  temperature: 0.3
});
```

## 🔧 Environment Setup

Required environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| MONGODB_URI | MongoDB connection string | Yes |
| JWT_SECRET | Secret for JWT tokens | Yes |
| GROQ_API_KEY | Groq API key | Yes |
| TAVILY_API_KEY | Tavily API key | Yes |
| ENABLE_TAVILY | Enable Tavily integration | Yes |

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by [Alok Kumar Jha](https://github.com/jhaalok1997)

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
