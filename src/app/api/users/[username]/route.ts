import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Post from '@/models/Post';

interface RouteParams {
  params: Promise<{
    username: string;
  }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();

    const { username } = await params;
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // Find the user
    const user = await User.findOne({ username }).lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's post count
    const postsCount = await Post.countDocuments({ userId: user._id });

    // Check if current user is following this user
    let isFollowing = false;
    if (token && token.type === 'user') {
      const currentUser = await User.findById(token.sub);
      if (currentUser) {
        isFollowing = currentUser.following.includes(user._id);
      }
    }

    const userProfile = {
      id: user._id.toString(),
      username: user.username,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      postsCount,
      isFollowing,
      joinedAt: user.createdAt.toISOString(),
    };

    return NextResponse.json({ user: userProfile });

  } catch (error) {
    console.error('User profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
