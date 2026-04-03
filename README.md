# 🌟 Luminary — Social Media Platform

A modern, production-ready full-stack social media application built with **Next.js 14**, **Express**, **MongoDB**, **Socket.io**, and **Cloudinary**.

---

## 📁 Project Structure

```
luminary/
├── backend/                    # Express API
│   ├── server.js               # Entry point
│   ├── .env.example            # Environment variables template
│   └── src/
│       ├── config/             # DB + Cloudinary setup
│       ├── controllers/        # Route handlers
│       ├── middleware/         # Auth, upload, rate limiter
│       ├── models/             # Mongoose schemas
│       ├── routes/             # Express routers
│       ├── utils/              # JWT, Socket.io helpers
│       └── validations/        # Joi schemas
│
└── frontend/                   # Next.js 14 App Router
    ├── app/
    │   ├── (auth)/             # Login, Register pages
    │   │   ├── login/
    │   │   └── register/
    │   └── (main)/             # Authenticated app shell
    │       ├── feed/
    │       ├── notifications/
    │       ├── search/
    │       ├── bookmarks/
    │       └── profile/[username]/
    ├── components/
    │   ├── layout/             # Sidebar, MobileNav, RightPanel
    │   ├── post/               # PostCard, CommentSection, CreatePostModal
    │   └── ui/                 # Avatar, FollowButton, Skeleton
    ├── hooks/                  # useInfiniteScroll, useSocket, useDebounce
    ├── lib/                    # Axios client, Socket.io client
    ├── services/               # API service layer
    └── store/                  # Zustand stores (auth, post, notifications)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account (free tier works)

---

### 1. Clone & Install

```bash
git clone <your-repo>
cd luminary

# Backend
cd backend
npm install
cp .env.example .env
# → Fill in .env values

# Frontend
cd ../frontend
npm install
cp .env.local.example .env.local
# → Fill in .env.local values
```

---

### 2. Configure Environment Variables

**`backend/.env`**
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/luminary
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:3000
```

**`frontend/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=Luminary
```

---

### 3. Run in Development

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# Server on http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev
# App on http://localhost:3000
```

---

## 🌐 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET  | `/api/auth/me` | Get current user |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/:username` | Get profile |
| GET | `/api/users/:username/posts` | User's posts |
| PATCH | `/api/users/me/profile` | Update profile |
| POST | `/api/users/:id/follow` | Follow/Unfollow |
| GET | `/api/users/suggested` | Suggested users |

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts/feed` | Home feed |
| POST | `/api/posts` | Create post (multipart) |
| GET | `/api/posts/:id` | Single post |
| PATCH | `/api/posts/:id` | Edit post |
| DELETE | `/api/posts/:id` | Delete post |
| POST | `/api/posts/:id/like` | Toggle like |
| POST | `/api/posts/:id/bookmark` | Toggle bookmark |
| GET | `/api/posts/bookmarks` | Saved posts |
| GET | `/api/posts/trending/hashtags` | Trending hashtags |

### Comments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/comments/post/:postId` | Get comments |
| POST | `/api/comments/post/:postId` | Add comment |
| DELETE | `/api/comments/:commentId` | Delete comment |
| POST | `/api/comments/:commentId/like` | Like comment |

### Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search/users?q=` | Search users |
| GET | `/api/search/hashtag/:tag` | Posts by hashtag |
| GET | `/api/search?q=` | Global search |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get all |
| PATCH | `/api/notifications/read-all` | Mark all read |
| PATCH | `/api/notifications/:id/read` | Mark one read |

---

## 🔌 Socket.io Events

### Client → Server
| Event | Payload | Purpose |
|-------|---------|---------|
| `join:user` | `userId` | Join personal notification room |
| `join:post` | `postId` | Join post room (live likes/comments) |
| `leave:post` | `postId` | Leave post room |

### Server → Client
| Event | Payload | Purpose |
|-------|---------|---------|
| `notification` | `Notification` | New notification |
| `postLike` | `{ postId, likesCount, isLiked }` | Like update |
| `newComment` | `{ comment, postId }` | New comment |

---

## 🚢 Deployment

### Backend (Railway / Render / Fly.io)

```bash
cd backend
# Set all .env variables in your platform dashboard
npm start
```

**Railway:**
1. New project → Deploy from GitHub
2. Add environment variables
3. Deploy

### Frontend (Vercel)

```bash
cd frontend
npx vercel
```

Set environment variables in Vercel dashboard:
- `NEXT_PUBLIC_API_URL` → your backend URL
- `NEXT_PUBLIC_SOCKET_URL` → your backend URL

---

## 🔐 Security Features

- **JWT** authentication (httpOnly cookie + Authorization header)
- **bcrypt** password hashing (cost factor 12)
- **Helmet** security headers
- **Rate limiting** on all routes (stricter on auth)
- **MongoDB sanitization** (NoSQL injection prevention)
- **XSS filtering** on caption/comment input
- **CORS** restricted to frontend origin
- **Input validation** via Joi on all mutations

---

## ✨ Features Implemented

### Core
- ✅ JWT Auth (register, login, logout, protected routes)
- ✅ User profiles (avatar, bio, website, followers/following)
- ✅ Post creation (text + multiple images/videos, drag-drop)
- ✅ Like / Unlike with optimistic UI
- ✅ Bookmark / Unbookmark posts
- ✅ Nested comments with replies + like
- ✅ Follow / Unfollow with hover states
- ✅ Infinite scroll feed (latest + trending sort)
- ✅ Real-time likes, comments, notifications (Socket.io)
- ✅ Notifications (like, comment, follow, reply)
- ✅ Search users by username/name
- ✅ Search posts by hashtag
- ✅ Trending hashtags panel
- ✅ Dark mode toggle (next-themes)
- ✅ Responsive design (mobile + desktop)
- ✅ Loading skeletons
- ✅ Framer Motion animations throughout
- ✅ Double-tap to like (with heart burst)
- ✅ Post carousel (multiple media)
- ✅ Location tagging
- ✅ Hashtag & mention auto-linking in captions

---

## 🔮 Suggested Improvements

1. **Stories** — 24-hour ephemeral content
2. **Direct Messages** — Private chat with Socket.io
3. **Push Notifications** — Web Push API
4. **Email verification** — Nodemailer on register
5. **Password reset** — Email token flow
6. **OAuth** — Google/GitHub login (next-auth)
7. **Post insights** — View counts, reach analytics
8. **Reels / Video feed** — TikTok-style vertical scroll
9. **Two-factor auth** — TOTP
10. **Content moderation** — Image safety check with Clarifai API
