# Rjilat API Documentation

## Overview
Rjilat is an image sharing platform with dual authentication system (users and admin) built with Next.js, MongoDB, and Cloudinary.

## Base URL
- Development: `http://localhost:3000`
- Production: `https://your-domain.com`

## Authentication
The API uses NextAuth.js with dual credential providers:
- **User Authentication**: Regular users for image sharing
- **Admin Authentication**: Single admin with full platform control

### Authentication Headers
```javascript
// For authenticated requests
headers: {
  'Cookie': 'next-auth.session-token=...'
}
```

## API Endpoints

### 🔐 Authentication Endpoints

#### User Registration
```
POST /api/auth/user/register
```
**Body:**
```json
{
  "username": "string (3-20 chars)",
  "password": "string (min 6 chars)"
}
```
**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "string",
    "username": "string",
    "createdAt": "ISO string"
  }
}
```

#### User Login
```
POST /api/auth/user/login
```
**Body:**
```json
{
  "username": "string",
  "password": "string"
}
```
**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "string",
    "username": "string",
    "type": "user"
  }
}
```

#### Admin Login
```
POST /api/auth/admin/login
```
**Body:**
```json
{
  "username": "string",
  "password": "string"
}
```
**Response:**
```json
{
  "message": "Admin login successful",
  "admin": {
    "id": "string",
    "username": "string",
    "type": "admin"
  }
}
```

#### NextAuth Session
```
GET /api/auth/session
```
**Response:**
```json
{
  "user": {
    "id": "string",
    "username": "string",
    "type": "user|admin"
  }
}
```

### 📸 Posts Endpoints

#### Get All Posts
```
GET /api/posts
```
**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 20)
- `sortBy`: "newest" | "oldest" | "popular"

**Response:**
```json
{
  "posts": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "imageUrl": "string",
      "author": {
        "id": "string",
        "username": "string"
      },
      "likesCount": "number",
      "commentsCount": "number",
      "isPublic": "boolean",
      "createdAt": "ISO string"
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "totalPages": "number"
  }
}
```

#### Create Post
```
POST /api/posts
```
**Authentication Required**: User
**Body (multipart/form-data):**
```
title: string
description: string (optional)
image: File
```
**Response:**
```json
{
  "message": "Post created successfully",
  "post": {
    "id": "string",
    "title": "string",
    "imageUrl": "string",
    "createdAt": "ISO string"
  }
}
```

#### Get Single Post
```
GET /api/posts/[postId]
```
**Response:**
```json
{
  "post": {
    "id": "string",
    "title": "string",
    "description": "string",
    "imageUrl": "string",
    "author": {
      "id": "string",
      "username": "string"
    },
    "likes": ["userId1", "userId2"],
    "comments": [
      {
        "id": "string",
        "content": "string",
        "author": {
          "id": "string",
          "username": "string"
        },
        "createdAt": "ISO string"
      }
    ],
    "createdAt": "ISO string"
  }
}
```

#### Delete Post
```
DELETE /api/posts/[postId]
```
**Authentication Required**: User (owner) or Admin

#### Like/Unlike Post
```
POST /api/posts/[postId]/like
```
**Authentication Required**: User

### 💬 Comments Endpoints

#### Create Comment
```
POST /api/posts/[postId]/comments
```
**Authentication Required**: User
**Body:**
```json
{
  "content": "string (max 1000 chars)"
}
```

#### Delete Comment
```
DELETE /api/comments/[commentId]
```
**Authentication Required**: User (owner) or Admin

### 👤 User Endpoints

#### Get User Profile
```
GET /api/users/[userId]
```
**Response:**
```json
{
  "user": {
    "id": "string",
    "username": "string",
    "followersCount": "number",
    "followingCount": "number",
    "postsCount": "number",
    "createdAt": "ISO string"
  },
  "posts": [
    // User's posts
  ]
}
```

#### Follow/Unfollow User
```
POST /api/users/[userId]/follow
```
**Authentication Required**: User

### 🔧 Admin Endpoints

#### Get Dashboard Stats
```
GET /api/admin/dashboard/stats
```
**Authentication Required**: Admin
**Response:**
```json
{
  "totalUsers": "number",
  "totalPosts": "number",
  "totalComments": "number",
  "userGrowth": "number",
  "postGrowth": "number",
  "recentUsers": [],
  "recentPosts": [],
  "engagementStats": {
    "avgLikesPerPost": "number",
    "avgCommentsPerPost": "number",
    "activeUsers": "number"
  }
}
```

#### Get All Users (Admin)
```
GET /api/admin/users
```
**Authentication Required**: Admin

#### Delete User (Admin)
```
DELETE /api/admin/users/[userId]
```
**Authentication Required**: Admin
*Note: Deletes user and all associated data*

#### Get All Posts (Admin)
```
GET /api/admin/posts
```
**Authentication Required**: Admin

#### Delete Post (Admin)
```
DELETE /api/admin/posts/[postId]
```
**Authentication Required**: Admin

#### Update Post Visibility (Admin)
```
PATCH /api/admin/posts/[postId]/visibility
```
**Authentication Required**: Admin
**Body:**
```json
{
  "isPublic": "boolean"
}
```

#### Get All Comments (Admin)
```
GET /api/admin/comments
```
**Authentication Required**: Admin

#### Delete Comment (Admin)
```
DELETE /api/admin/comments/[commentId]
```
**Authentication Required**: Admin

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

### Common HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `422`: Validation Error
- `500`: Internal Server Error

## Rate Limiting
- **General API**: 100 requests per minute
- **Upload endpoints**: 10 uploads per minute
- **Authentication**: 5 attempts per minute per IP

## File Upload Limits
- **Max file size**: 10MB
- **Allowed formats**: JPG, JPEG, PNG, GIF, WebP
- **Image processing**: Auto-optimization via Cloudinary

## Environment Variables Required
```env
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ADMIN_CREATION_SECRET=your_admin_secret
```
