import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Post from '@/models/Post';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ users: [] });
    }

    // Search users by username (case-insensitive)
    const users = await User.find({
      username: { $regex: query.trim(), $options: 'i' }
    })
    .select('username followers following createdAt')
    .limit(20)
    .lean();

    // Get post counts for each user
    const userIds = users.map(user => user._id);
    const postCounts = await Post.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } }
    ]);

    const postCountMap = new Map(
      postCounts.map(item => [item._id.toString(), item.count])
    );

    // Check following status if user is authenticated
    let currentUserFollowing: Set<string> = new Set();
    if (token && token.type === 'user') {
      const currentUser = await User.findById(token.sub).select('following');
      if (currentUser) {
        currentUserFollowing = new Set(
          currentUser.following.map((id: string) => id.toString())
        );
      }
    }

    // Format response
    const formattedUsers = users.map(user => ({
      id: user._id.toString(),
      username: user.username,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      postsCount: postCountMap.get(user._id.toString()) || 0,
      isFollowing: currentUserFollowing.has(user._id.toString()),
    }));

    return NextResponse.json({ users: formattedUsers });

  } catch (error) {
    console.error('User search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
