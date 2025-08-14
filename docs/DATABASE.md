# Rjilat Database Documentation

## Overview
Rjilat uses MongoDB as the primary database with Mongoose ODM for schema definition and validation.

## Database Schema

### 👤 User Collection
```javascript
{
  _id: ObjectId,
  username: String (required, unique, 3-20 chars),
  passwordHash: String (required, bcrypt hashed),
  followers: [ObjectId] (ref: User),
  following: [ObjectId] (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `username`: Unique index
- `createdAt`: Descending index for recent users

**Validation:**
- Username: 3-20 characters, unique
- Password: Minimum 6 characters (hashed with bcrypt, 12 salt rounds)

### 🔧 Admin Collection
```javascript
{
  _id: ObjectId,
  username: String (required, unique, 3-20 chars),
  passwordHash: String (required, bcrypt hashed),
  createdAt: Date,
  updatedAt: Date
}
```

**Constraints:**
- Only one admin document allowed (enforced by pre-save middleware)
- Same validation as User model

### 📸 Post Collection
```javascript
{
  _id: ObjectId,
  title: String (required, max 100 chars),
  description: String (optional, max 500 chars),
  imageUrl: String (required, Cloudinary URL),
  imagePublicId: String (required, Cloudinary public ID),
  author: ObjectId (required, ref: User),
  likes: [ObjectId] (ref: User, default: []),
  comments: [ObjectId] (ref: Comment, default: []),
  tags: [String] (lowercase, trimmed),
  isPublic: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `author, createdAt`: Compound index (descending) for user's posts
- `createdAt`: Descending index for recent posts
- `tags`: Index for tag-based searches

**Relationships:**
- `author` → User._id
- `likes` → [User._id]
- `comments` → [Comment._id]

### 💬 Comment Collection
```javascript
{
  _id: ObjectId,
  content: String (required, max 1000 chars),
  author: ObjectId (required, ref: User),
  post: ObjectId (required, ref: Post),
  likes: [ObjectId] (ref: User, default: []),
  parentComment: ObjectId (optional, ref: Comment),
  replies: [ObjectId] (ref: Comment, default: []),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `post, createdAt`: Compound index (descending) for post comments
- `author, createdAt`: Compound index (descending) for user comments

**Relationships:**
- `author` → User._id
- `post` → Post._id
- `parentComment` → Comment._id (for nested replies)
- `replies` → [Comment._id]

## Database Relationships

### User Relationships
```
User (1) ←→ (N) Post (author)
User (N) ←→ (N) User (followers/following)
User (1) ←→ (N) Comment (author)
User (N) ←→ (N) Post (likes)
User (N) ←→ (N) Comment (likes)
```

### Post Relationships
```
Post (1) ←→ (N) Comment
Post (N) ←→ (1) User (author)
Post (N) ←→ (N) User (likes)
```

### Comment Relationships
```
Comment (N) ←→ (1) Post
Comment (N) ←→ (1) User (author)
Comment (1) ←→ (N) Comment (replies/parentComment)
Comment (N) ←→ (N) User (likes)
```

## Database Operations

### Cascade Deletions
When deleting entities, the following cascade operations occur:

#### User Deletion (Admin only)
1. Delete all user's posts
2. Delete all comments on user's posts
3. Delete all user's comments on other posts
4. Remove user from all followers/following lists
5. Remove user's likes from all posts and comments
6. Delete the user document

#### Post Deletion
1. Delete all comments associated with the post
2. Remove post from all users' liked posts
3. Delete the post document
4. Delete the image from Cloudinary

#### Comment Deletion
1. Delete all replies to the comment
2. Remove comment reference from the parent post
3. Remove comment from parent comment's replies (if nested)
4. Delete the comment document

### Performance Optimizations

#### Indexing Strategy
```javascript
// User indexes
db.users.createIndex({ "username": 1 }, { unique: true })
db.users.createIndex({ "createdAt": -1 })

// Post indexes
db.posts.createIndex({ "author": 1, "createdAt": -1 })
db.posts.createIndex({ "createdAt": -1 })
db.posts.createIndex({ "tags": 1 })
db.posts.createIndex({ "isPublic": 1, "createdAt": -1 })

// Comment indexes
db.comments.createIndex({ "post": 1, "createdAt": -1 })
db.comments.createIndex({ "author": 1, "createdAt": -1 })
```

#### Aggregation Pipelines
Common aggregation queries for analytics:

```javascript
// User engagement stats
db.posts.aggregate([
  {
    $group: {
      _id: null,
      avgLikes: { $avg: { $size: "$likes" } },
      avgComments: { $avg: { $size: "$comments" } }
    }
  }
])

// Top users by posts
db.posts.aggregate([
  {
    $group: {
      _id: "$author",
      postsCount: { $sum: 1 },
      totalLikes: { $sum: { $size: "$likes" } }
    }
  },
  { $sort: { postsCount: -1 } },
  { $limit: 10 }
])
```

## Data Validation

### Server-Side Validation (Mongoose)
- All required fields enforced
- String length limits
- Email format validation
- Custom validators for business logic

### Client-Side Validation
- Form validation before submission
- File type and size validation
- Real-time feedback for users

## Database Security

### Authentication
- MongoDB connection with authentication
- Connection string stored in environment variables
- No direct database access from client

### Data Sanitization
- Mongoose built-in sanitization
- Input validation on all endpoints
- SQL injection prevention (NoSQL injection)

### Access Control
- Role-based access (User vs Admin)
- Document-level permissions
- Soft deletes for audit trail

## Backup Strategy

### Automated Backups
- Daily MongoDB Atlas backups
- Point-in-time recovery available
- Cross-region backup replication

### Manual Exports
- Admin panel export functionality
- JSON format for data portability
- Selective data export options

## Environment Configuration

### Development Database
```env
MONGODB_URI=mongodb://localhost:27017/rjilat_dev
```

### Production Database
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rjilat_prod
```

## Common Queries

### Find user's posts with engagement
```javascript
db.posts.find({ author: userId })
  .populate('author', 'username')
  .select('title imageUrl likes comments createdAt')
  .sort({ createdAt: -1 })
```

### Get post with comments
```javascript
db.posts.findById(postId)
  .populate('author', 'username')
  .populate({
    path: 'comments',
    populate: {
      path: 'author',
      select: 'username'
    }
  })
```

### Admin dashboard stats
```javascript
// User count
db.users.countDocuments()

// Recent posts
db.posts.find()
  .sort({ createdAt: -1 })
  .limit(5)
  .populate('author', 'username')
```

## Migration Scripts

### Initial Setup
```javascript
// Create indexes
db.users.createIndex({ "username": 1 }, { unique: true })
db.posts.createIndex({ "author": 1, "createdAt": -1 })
db.comments.createIndex({ "post": 1, "createdAt": -1 })

// Create admin user
db.admins.insertOne({
  username: "admin",
  passwordHash: "$2a$12$...", // bcrypt hash
  createdAt: new Date(),
  updatedAt: new Date()
})
```
