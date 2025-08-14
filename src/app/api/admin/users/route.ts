import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Post from '@/models/Post';
import Comment from '@/models/Comment';

export async function GET(req: NextRequest) {
  try {
    // Verify admin authentication
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get all users with their stats
    const users = await User.find({}).select('username followers following createdAt').lean();

    // Get post and comment counts for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const [postsCount, commentsCount] = await Promise.all([
          Post.countDocuments({ author: user._id }),
          Comment.countDocuments({ author: user._id }),
        ]);

        return {
          id: user._id.toString(),
          username: user.username,
          followers: user.followers.length,
          following: user.following.length,
          postsCount,
          commentsCount,
          createdAt: user.createdAt.toISOString(),
        };
      })
    );

    return NextResponse.json({ users: usersWithStats });

  } catch (error) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
