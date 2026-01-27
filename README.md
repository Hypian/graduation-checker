# Degreefi - Graduation Eligibility Tracker

A comprehensive MERN stack application for tracking student graduation requirements, managing academic records, and facilitating clearance document verification for BBICT (Bachelor of Business Information and Communication Technology) programs.

## 🎓 Features

### For Students

- **Dashboard Overview**: Real-time visualization of graduation progress
- **Academic Records**: Track completed courses and GPA
- **Clearance Management**: Upload and monitor clearance documents (Financial, Library, Transcript, etc.)
- **Requirements Checklist**: View detailed breakdown of graduation requirements
- **Notifications**: Receive updates from the registrar

### For Administrators

- **Student Registry**: Comprehensive database of all enrolled students
- **Document Review**: Approve/reject clearance documents with built-in viewer
- **Curriculum Manager**: Add, edit, and remove courses from the official curriculum
- **Messaging System**: Send notifications directly to student dashboards
- **Progress Tracking**: Monitor student completion rates and eligibility status

## 🚀 Tech Stack

- **Frontend**: React + Vite, TailwindCSS
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Authentication**: JWT
- **File Upload**: Multer

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

## 🛠️ Installation & Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd graduation-checker
```

### 2. Install dependencies

**Server:**

```bash
cd server
npm install
```

**Client:**

```bash
cd ../client
npm install
```

### 3. Environment Configuration

Create a `.env` file in the `server` directory:

```bash
cd server
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/graduation-checker
JWT_SECRET=your_generated_secret_key
NODE_ENV=development
```

**Generate a secure JWT secret:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Database Setup

Make sure MongoDB is running, then seed the database with the BBICT curriculum:

```bash
cd server
node seed.js
```

### 5. Run the Application

**Development mode (both servers):**

Terminal 1 - Backend:

```bash
cd server
npm run dev
```

Terminal 2 - Frontend:

```bash
cd client
npm run dev
```

The application will be available at:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 👥 Default Accounts

After seeding, you can create accounts through the registration page. For admin access, manually update a user's role in MongoDB:

```javascript
db.users.updateOne(
  { email: "youremail@example.com" },
  { $set: { role: "admin" } },
);
```

## 📁 Project Structure

```
graduation-checker/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # React Context (Auth, Modal)
│   │   ├── pages/         # Page components
│   │   └── main.jsx       # App entry point
│   └── vite.config.js     # Vite configuration
├── server/                # Express backend
│   ├── controllers/       # Route controllers
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── middleware/       # Auth middleware
│   ├── uploads/          # Uploaded documents
│   └── server.js         # Server entry point
└── README.md
```

## 🔐 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Student Routes

- `GET /api/student/records` - Get student's academic records
- `POST /api/student/records` - Add a course record
- `POST /api/student/upload` - Upload clearance document
- `GET /api/student/notifications` - Get notifications

### Admin Routes

- `GET /api/admin/students` - Get all students
- `GET /api/admin/students/:id` - Get student details
- `DELETE /api/admin/students/:id` - Delete student
- `POST /api/admin/verify-milestone` - Approve/reject document
- `POST /api/admin/send-notification` - Send message to student

### Curriculum Routes

- `GET /api/curriculum` - Get all courses
- `POST /api/curriculum` - Add new course (admin only)
- `DELETE /api/curriculum/:id` - Delete course (admin only)

## 🎨 Design System

The application uses a custom design system based on:

- **Primary Color**: Brand Maroon (#7d1f4d)
- **Accent Color**: Brand Peach (#f8d7da)
- **Typography**: System fonts with bold, black weights
- **Components**: Glassmorphism, rounded corners, smooth animations

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please open an issue on GitHub.
