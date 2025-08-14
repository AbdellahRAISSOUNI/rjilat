import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAdminLog extends Document {
  adminId: mongoose.Types.ObjectId;
  action: string;
  target: {
    type: 'user' | 'post' | 'comment' | 'system';
    id?: string;
    username?: string;
    title?: string;
  };
  details: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const AdminLogSchema: Schema<IAdminLog> = new Schema({
  adminId: {
    type: Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: [
      'delete_user',
      'delete_post', 
      'delete_comment',
      'hide_post',
      'show_post',
      'hide_comment',
      'show_comment',
      'bulk_delete_posts',
      'bulk_delete_comments',
      'bulk_hide_posts',
      'bulk_show_posts',
      'bulk_hide_comments',
      'bulk_show_comments',
      'view_analytics',
      'login',
      'logout'
    ]
  },
  target: {
    type: {
      type: String,
      enum: ['user', 'post', 'comment', 'system'],
      required: true
    },
    id: String,
    username: String,
    title: String
  },
  details: {
    type: String,
    required: true,
  },
  ipAddress: String,
  userAgent: String,
}, {
  timestamps: true,
});

// Index for efficient queries
AdminLogSchema.index({ adminId: 1, createdAt: -1 });
AdminLogSchema.index({ action: 1, createdAt: -1 });
AdminLogSchema.index({ createdAt: -1 });

const AdminLog: Model<IAdminLog> = mongoose.models.AdminLog || mongoose.model<IAdminLog>('AdminLog', AdminLogSchema);

export default AdminLog;
