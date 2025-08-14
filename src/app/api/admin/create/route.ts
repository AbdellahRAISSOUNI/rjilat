import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';

// This endpoint should only be used once to create the initial admin
// Remove or secure this endpoint after creating the admin
export async function POST(req: NextRequest) {
  try {
    const { username, password, secretKey } = await req.json();

    // Add a secret key check to prevent unauthorized admin creation
    if (secretKey !== process.env.ADMIN_CREATION_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({});
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin already exists. Only one admin is allowed.' },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create new admin
    const newAdmin = new Admin({
      username,
      passwordHash,
    });

    await newAdmin.save();

    return NextResponse.json(
      { 
        message: 'Admin created successfully',
        admin: {
          id: newAdmin._id,
          username: newAdmin.username,
          createdAt: newAdmin.createdAt
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Admin creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
