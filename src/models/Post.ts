import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IPost extends Document {
  title: string;
  imageUrl: string;
  imagePublicId: string;
  userId: mongoose.Types.ObjectId;
  upvotes: mongoose.Types.ObjectId[];
  comments: mongoose.Types.ObjectId[];
  status: 'active' | 'hidden' | 'reported';
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema: Schema<IPost> = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title must be less than 100 characters'],
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required'],
  },
  imagePublicId: {
    type: String,
    required: [true, 'Image public ID is required'],
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  upvotes: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    default: []
  }],
  status: {
    type: String,
    enum: ['active', 'hidden', 'reported'],
    default: 'active'
  },
}, {
  timestamps: true,
});

// Index for better query performance
PostSchema.index({ userId: 1, createdAt: -1 });
PostSchema.index({ createdAt: -1 });

const Post: Model<IPost> = mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);

export default Post;
