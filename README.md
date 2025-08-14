# Rjilat - Image Sharing Platform

A modern, feature-rich image sharing platform built with Next.js 15, featuring dual authentication, admin controls, and Cloudinary integration.

## 🚀 Features

### 🌟 **New: Reddit-Style Engagement**
- **Individual Post Pages**: Each image has its own dedicated page (`/post/[id]`)
- **Upvote System**: Heart-based voting system with real-time counts
- **Nested Comments**: Threaded comment system with reply functionality
- **Public Feed**: Community feed accessible by all users (`/feed`)
- **Social Interactions**: Like, comment, and engage with community posts

### 📸 Image Sharing & Social Features
- **Cloudinary Integration**: High-performance image storage and optimization
- **Smart Upload**: Drag & drop interface with real-time preview
- **Image Optimization**: Automatic compression and format conversion
- **Grid Display**: Responsive masonry layout for image browsing
- **Individual Post Pages**: Clickable images leading to dedicated post pages
- **Upvote System**: Reddit-like heart voting with visual feedback
- **Comments & Replies**: Nested comment system with threaded conversations
- **Public Feed**: Accessible feed for both logged-in and anonymous users

### 🔐 Dual Authentication System
- **User Authentication**: Registration and login for regular users
- **Admin Authentication**: Separate admin login with complete platform control
- **NextAuth.js**: Secure session management
- **Protected Routes**: Middleware-based route protection

### 👑 Admin Godmode
- **Complete User Control**: View, manage, and delete user accounts
- **Posts Management**: Moderate, hide, or delete any post
- **Comments Moderation**: Full comment management and deletion
- **System Settings**: Configure platform settings and maintenance mode
- **Analytics Dashboard**: Real-time statistics and user engagement metrics

### 🎨 Modern UI/UX
- **Tailwind CSS**: Professional, responsive design
- **Dark Admin Theme**: Distinctive admin interface
- **Loading States**: Smooth animations and skeleton screens
- **Mobile Responsive**: Perfect experience on all devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js with dual providers
- **Database**: MongoDB with Mongoose ODM
- **Image Storage**: Cloudinary
- **Deployment**: Vercel-ready

## 📂 Project Structure

```
rjilat/
├── src/
│   ├── app/
│   │   ├── (auth)/                 # Authentication pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/            # User dashboard
│   │   │   ├── home/
│   │   │   └── upload/
│   │   ├── admin/                  # Admin interface
│   │   │   ├── dashboard/
│   │   │   ├── users/
│   │   │   ├── posts/
│   │   │   ├── comments/
│   │   │   └── settings/
│   │   ├── api/                    # API routes
│   │   │   ├── auth/
│   │   │   ├── posts/
│   │   │   └── admin/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/                 # Reusable components
│   │   ├── admin/
│   │   ├── Header.tsx
│   │   └── SessionProvider.tsx
│   ├── lib/                        # Utilities
│   │   ├── auth.ts
│   │   ├── cloudinary.ts
│   │   ├── middleware.ts
│   │   └── mongodb.ts
│   ├── models/                     # Database models
│   │   ├── Admin.ts
│   │   ├── Comment.ts
│   │   ├── Post.ts
│   │   └── User.ts
│   └── types/                      # TypeScript definitions
├── docs/                           # Documentation
│   ├── API.md
│   └── DATABASE.md
├── middleware.ts                   # Route protection
└── package.json
```

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone <repository-url>
cd rjilat
npm install
```

### 2. Environment Setup
Create `.env.local` file:
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rjilat

# NextAuth.js
NEXTAUTH_SECRET=your_nextauth_secret_key_here_make_it_long_and_random
NEXTAUTH_URL=http://localhost:3000

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Admin Creation (for setup only)
ADMIN_CREATION_SECRET=your_super_secret_admin_creation_key
```

### 3. Database Setup
- Create MongoDB Atlas cluster
- Whitelist your IP address
- Update connection string in `.env.local`

### 4. Cloudinary Setup
- Create Cloudinary account
- Get API credentials from dashboard
- Update `.env.local` with your credentials

### 5. Run Development Server
```bash
npm run dev
```

### 6. Create Admin Account
1. Visit `http://localhost:3000/setup-admin`
2. Click "Create Admin Account"
3. Use credentials: `admin` / `admin123`
4. Delete the setup page after creation

## 🎯 Usage Guide

### For Users
1. **Register**: Visit `/register` to create an account
2. **Login**: Use `/login` to access your dashboard
3. **Browse Feed**: Visit `/feed` to see all community posts (no login required)
4. **Upload**: Click "Upload" to share images with title
5. **Engage**: Click on images to view full posts
6. **Upvote**: Heart posts you like (can't upvote your own)
7. **Comment**: Share thoughts and reply to others
8. **Dashboard**: Use `/home` for personalized user feed

### For Admin
1. **Login**: Visit `/admin` with admin credentials
2. **Dashboard**: View platform statistics and upvote analytics
3. **Manage Users**: Delete users and view profiles
4. **Moderate Content**: Manage posts and comments with full control
5. **System Settings**: Configure platform settings

## 📊 API Documentation

Comprehensive API documentation available in [`docs/API.md`](docs/API.md)

### Key Endpoints
- `POST /api/auth/user/register` - User registration
- `POST /api/auth/user/login` - User login
- `POST /api/posts` - Create post with image upload
- `GET /api/posts` - Fetch posts with pagination and sorting
- `GET /api/posts/[id]` - Get individual post details
- `POST /api/posts/[id]/upvote` - Upvote/remove upvote from post
- `GET /api/posts/[id]/comments` - Get post comments with nested replies
- `POST /api/posts/[id]/comments` - Create comment or reply
- `GET /api/admin/dashboard/stats` - Admin dashboard stats

## 🗄️ Database Schema

Detailed database documentation available in [`docs/DATABASE.md`](docs/DATABASE.md)

### Models
- **User**: Username, password, followers, following
- **Admin**: Single admin with full access
- **Post**: Title, image, userId, upvotes[], comments[], createdAt
- **Comment**: Content, userId, postId, parentCommentId (for replies), createdAt

## 🔒 Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **Session Management**: Secure JWT tokens
- **Route Protection**: Middleware-based authentication
- **Input Validation**: Server-side validation for all inputs
- **File Validation**: Image type and size restrictions
- **Admin Separation**: Complete isolation between user and admin areas

## 🎨 Design System

- **Colors**: Blue primary, gray neutrals, semantic colors
- **Typography**: Geist Sans for UI, Geist Mono for code
- **Components**: Consistent button styles, cards, and forms
- **Responsive**: Mobile-first design with Tailwind breakpoints

## 🚀 Deployment

### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Environment Variables for Production
```env
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=production_secret_key
NEXTAUTH_URL=https://your-domain.com
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Cloudinary for image management
- MongoDB for database hosting
- Tailwind CSS for styling system
- NextAuth.js for authentication

## 📞 Support

For support, email support@rjilat.com or join our community Discord.

---

**Built with ❤️ using Next.js 15 and modern web technologies**