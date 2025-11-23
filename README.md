# Vet-Assistant (Vet🐾Care)

Vet-Assistant is a comprehensive veterinary practice management and pet care application designed to bridge the gap between pet owners and veterinarians. It features appointment booking, medical record management, AI-powered assistance, and role-based dashboards for Admins, Veterinarians, and Pet Owners.

## 🚀 Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/), [Lucide React](https://lucide.dev/)
- **Database:** [MongoDB](https://www.mongodb.com/) (via Mongoose)
- **Caching:** [Redis](https://redis.io/)
- **Authentication:** JWT (JSON Web Tokens) with `jose` & `bcryptjs`
- **AI Integration:** [LangChain](https://js.langchain.com/), [Groq](https://groq.com/) (Llama-3 model), Google Generative AI
- **Utilities:** Axios, Nodemailer, JSPDF, React Hook Form

## 🏗️ Architecture & Design

### 🤖 AI-Powered Assistance (RAG & LLM)
The "Ask Vet Assist" feature leverages a sophisticated RAG (Retrieval-Augmented Generation) pipeline:
- **Context Awareness:** Chat history is cached in **Redis** (TTL 7 days) to maintain conversation context.
- **External Knowledge:** Uses **Tavily API** to fetch real-time veterinary research and news for queries about recent events (2024+).
- **LLM Engine:** Powered by **Groq (Llama-3-70b)** for high-speed inference.
- **Guardrails:** Strict prompt engineering ensures the AI only answers veterinary-related queries, rejecting irrelevant topics.

### 📅 Appointment System
A robust scheduling system built on MongoDB:
- **Status Workflow:** `scheduled` → `confirmed` → `completed` (or `cancelled`/`rescheduled`).
- **Data Integrity:** Mongoose schemas enforce referential integrity between `Appointments`, `Patients`, and `Veterinarians`.
- **Concurrency:** Optimistic locking prevents double-booking slots.

### 🔐 Security & Access Control
- **Edge Middleware:** `middleware.ts` intercepts requests to validate JWTs using `jose` (Edge-compatible).
- **RBAC:**
  - `/admin/*`: Restricted to users with `role: 'admin'`.
  - `/veterinarian/*`: Restricted to users with `role: 'vet'`.
  - `/tenant/*`: Implements strict tenant isolation logic.
- **Data Protection:** Passwords hashed with `bcryptjs`; sensitive routes protected against unauthorized access.

### 📄 Medical Reports & File Handling
- **Storage:** Secure local file storage (can be extended to S3/Cloudinary).
- **Validation:** Strict MIME-type checking (PDF, DICOM, Images) and size limits (5MB) on the server side.
- **Metadata:** File metadata linked to Patient and Appointment records in MongoDB for easy retrieval.

## ✨ Key Features

### 🐾 Pet Owner Features
- **Appointment Booking:** Schedule visits with available veterinarians.
- **Ask Vet Assist:** AI-powered chatbot for preliminary pet health queries.
- **Medical Reports:** View and download pet medical history (PDF support).
- **Service Discovery:** Browse available veterinary services.

### 🩺 Veterinarian Features
- **Dashboard:** Overview of appointments and patient stats.
- **Patient Management:** View and update medical records.
- **Profile Management:** Update availability and professional details.

### 🛠 Admin Features
- **User & Vet Management:** Oversee all platform users.
- **System Monitoring:** View logs and system health.
- **Content Management:** Manage FAQs and service listings.

## 📂 Project Structure

```bash
src/
├── app/                # Next.js App Router pages & API routes
│   ├── api/            # Backend API endpoints (AskVetcare, Reports, etc.)
│   ├── admin/          # Admin dashboard routes
│   ├── veterinarian/   # Veterinarian dashboard routes
│   └── ...             # Public routes (Home, About, Services)
├── components/         # Reusable UI components
│   ├── Ask-vet-Assit/  # AI Chatbot components
│   ├── Admin/          # Admin-specific components
│   └── ...
├── lib/                # Utilities & Configurations
│   ├── mongoDb.ts      # Database connection
│   ├── redisconfig.ts  # Redis client setup
│   ├── llmModel.ts     # AI Model configuration
│   └── nodeMailer.ts   # Email transporter
├── models/             # Mongoose Data Models (User, Appointment, MedicalReport)
└── middleware.ts       # Edge middleware for route protection
```

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Instance
- Redis Instance (Optional, for caching)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/vet-assit.git
   cd vet-assit
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add the following:

   ```env
   # Database
   MONGODB_URI=your_mongodb_connection_string

   # Authentication
   JWT_SECRET=your_jwt_secret_key

   # Email Service (Nodemailer)
   EMAIL_USER=your_email@example.com
   EMAIL_PASSWORD=your_email_app_password

   # Redis (Optional)
   REDIS_HOST=your_redis_host
   REDIS_PORT=your_redis_port
   REDIS_USERNAME=your_redis_username
   REDIS_PASSWORD=your_redis_password

   # AI Integration
   GROQ_API_KEY=your_groq_api_key
   TAVILY_API_KEY=your_tavily_api_key
   ENABLE_TAVILY=true
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📜 Scripts

- `npm run dev`: Start development server.
- `npm run build`: Build for production.
- `npm start`: Start production server.
- `npm run lint`: Run ESLint.