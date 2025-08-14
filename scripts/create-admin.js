// Simple script to create the admin user
// Run this with: node scripts/create-admin.js

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Admin model schema (copied from our model)
const AdminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

async function createAdmin() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      console.error('Please set MONGODB_URI in your .env.local file');
      process.exit(1);
    }

    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({});
    if (existingAdmin) {
      console.log('Admin already exists:', existingAdmin.username);
      process.exit(0);
    }

    // Create admin with specified credentials
    const username = 'admin';
    const password = 'admin123';
    
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newAdmin = new Admin({
      username,
      passwordHash,
    });

    await newAdmin.save();
    console.log('✅ Admin created successfully!');
    console.log('Username:', username);
    console.log('Password:', password);
    console.log('You can now login at: http://localhost:3000/admin');

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createAdmin();
