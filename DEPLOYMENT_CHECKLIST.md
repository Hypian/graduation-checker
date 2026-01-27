# Quick Deployment Checklist

## ✅ Pre-Deployment

- [ ] Code pushed to GitHub
- [ ] All tests passing locally
- [ ] Environment variables documented

## 🗄️ Database (MongoDB Atlas)

- [ ] Account created
- [ ] Free cluster created
- [ ] Database user created (save password!)
- [ ] Network access configured (0.0.0.0/0)
- [ ] Connection string copied

## 🔧 Backend (Render)

- [ ] Account created (sign up with GitHub)
- [ ] New Web Service created
- [ ] Repository connected
- [ ] Root directory set to `server`
- [ ] Environment variables added:
  - [ ] `MONGODB_URI`
  - [ ] `JWT_SECRET`
  - [ ] `FRONTEND_URL`
  - [ ] `NODE_ENV=production`
- [ ] Service deployed
- [ ] Backend URL copied
- [ ] Database seeded (`node seed.js` in Shell)

## 🎨 Frontend (Vercel)

- [ ] `vercel.json` updated with backend URL
- [ ] Account created (sign up with GitHub)
- [ ] Project imported
- [ ] Root directory set to `client`
- [ ] Deployed
- [ ] Frontend URL copied

## 🔄 Final Steps

- [ ] Update backend `FRONTEND_URL` with actual Vercel URL
- [ ] Redeploy backend
- [ ] Test registration
- [ ] Test login
- [ ] Create admin account (via MongoDB)
- [ ] Test all features

## 🎉 Done!

- Frontend: ************\_\_\_************
- Backend: ************\_\_\_************
- Database: MongoDB Atlas
