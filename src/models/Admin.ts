import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAdmin extends Document {
  username: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema: Schema<IAdmin> = new Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [20, 'Username must be less than 20 characters long'],
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
  },
}, {
  timestamps: true,
});

// Ensure only one admin document can exist
AdminSchema.pre('save', async function(next) {
  if (this.isNew) {
    const existingAdmin = await mongoose.models.Admin.findOne({});
    if (existingAdmin) {
      throw new Error('Only one admin can exist in the system');
    }
  }
  next();
});

const Admin: Model<IAdmin> = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);

export default Admin;
