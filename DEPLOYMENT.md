# 🚀 Deployment Guide - Degreefi

This guide will walk you through deploying both the frontend and backend of Degreefi.

## 📋 Prerequisites

Before starting, make sure you have:

- [ ] GitHub account
- [ ] Your code pushed to a GitHub repository
- [ ] Email address for creating accounts

---

## Part 1: Database Setup (MongoDB Atlas)

### 1. Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up with your email
3. Choose the **FREE** tier (M0 Sandbox)

### 2. Create a Cluster

1. Click **"Build a Database"**
2. Select **"M0 FREE"** tier
3. Choose a cloud provider and region (closest to you)
4. Click **"Create Cluster"**

### 3. Configure Database Access

1. Go to **"Database Access"** in the left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Username: `degreefi-admin` (or your choice)
5. Click **"Autogenerate Secure Password"** and **SAVE IT**
6. Set privileges to **"Read and write to any database"**
7. Click **"Add User"**

### 4. Configure Network Access

1. Go to **"Network Access"** in the left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Confirm"**

### 5. Get Connection String

1. Go to **"Database"** in the left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string (looks like: `mongodb+srv://username:<password>@cluster.xxxxx.mongodb.net/`)
5. Replace `<password>` with your actual password
6. Add database name at the end: `...mongodb.net/graduation-checker`
7. **SAVE THIS** - you'll need it later

### 6. Seed the Database

Once your backend is deployed, run:

```bash
# SSH into your backend server or use the platform's console
node seed.js
```

---

## Part 2: Backend Deployment (Render)

### 1. Create Render Account

1. Go to [Render](https://render.com)
2. Sign up with GitHub (recommended)

### 2. Create New Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Select your `graduation-checker` repository

### 3. Configure Service

Fill in these settings:

- **Name**: `degreefi-api` (or your choice)
- **Region**: Choose closest to you
- **Branch**: `main`
- **Root Directory**: `server`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: `Free`

### 4. Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add:

```
PORT=5000
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_connection_string_here
JWT_SECRET=your_generated_secret_key_here
FRONTEND_URL=https://your-frontend-url.vercel.app
```

**To generate JWT_SECRET:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Once deployed, copy your backend URL (e.g., `https://degreefi-api.onrender.com`)

### 6. Seed the Database

1. Go to your service dashboard
2. Click **"Shell"** tab
3. Run: `node seed.js`
4. Verify: You should see "Database Seeded Successfully!"

---

## Part 3: Frontend Deployment (Vercel)

### 1. Update Frontend Configuration

Before deploying, update `client/vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://YOUR-BACKEND-URL.onrender.com/api/:path*"
    }
  ]
}
```

Replace `YOUR-BACKEND-URL` with your actual Render URL.

### 2. Create Vercel Account

1. Go to [Vercel](https://vercel.com)
2. Sign up with GitHub

### 3. Import Project

1. Click **"Add New..."** → **"Project"**
2. Import your `graduation-checker` repository
3. Vercel will auto-detect it's a Vite project

### 4. Configure Project

- **Framework Preset**: Vite
- **Root Directory**: `client`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 5. Add Environment Variables (if needed)

Click **"Environment Variables"** and add any frontend-specific variables.

### 6. Deploy

1. Click **"Deploy"**
2. Wait for deployment (2-5 minutes)
3. Copy your frontend URL (e.g., `https://degreefi.vercel.app`)

### 7. Update Backend CORS

Go back to Render and update the `FRONTEND_URL` environment variable with your actual Vercel URL:

```
FRONTEND_URL=https://your-actual-frontend.vercel.app
```

Then redeploy the backend.

---

## Part 4: Post-Deployment

### 1. Test the Application

1. Visit your Vercel URL
2. Try registering a new account
3. Log in as a student
4. Upload a test document

### 2. Create Admin Account

1. Register a normal account first
2. Go to MongoDB Atlas → Browse Collections
3. Find the `users` collection
4. Find your user and click **"Edit"**
5. Change `role` from `"student"` to `"admin"`
6. Save and refresh your app

### 3. Verify Everything Works

- [ ] Student can register/login
- [ ] Student can add course records
- [ ] Student can upload clearance documents
- [ ] Admin can view students
- [ ] Admin can approve documents
- [ ] Admin can manage curriculum
- [ ] Admin can send notifications

---

## 🔧 Troubleshooting

### Backend won't connect to MongoDB

- Check your MongoDB connection string
- Ensure password doesn't have special characters (or URL-encode them)
- Verify Network Access allows 0.0.0.0/0

### Frontend can't reach backend

- Check CORS settings in `server.js`
- Verify `vercel.json` has correct backend URL
- Check browser console for CORS errors

### File uploads not working

- Render free tier has ephemeral storage (files deleted on restart)
- Consider using Cloudinary or AWS S3 for production file storage

### App is slow

- Free tiers have cold starts (first request takes ~30 seconds)
- Consider upgrading to paid tier for production use

---

## 🎉 Success!

Your Degreefi application is now live! Share your URL and start using it.

**Important URLs to save:**

- Frontend: `https://your-app.vercel.app`
- Backend API: `https://your-api.onrender.com`
- MongoDB: Your Atlas dashboard

---

## 📝 Next Steps

1. Set up a custom domain (optional)
2. Configure email notifications (optional)
3. Set up monitoring and analytics
4. Regular database backups
5. Update README with your live URLs
