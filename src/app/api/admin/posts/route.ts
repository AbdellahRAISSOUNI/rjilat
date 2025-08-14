import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/mongodb';
import Post from '@/models/Post';

export async function GET(req: NextRequest) {
  try {
    // Verify admin authentication
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get all posts with author information
    const posts = await Post.find({})
      .populate('userId', 'username')
      .select('title imageUrl imagePublicId upvotes comments status createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const formattedPosts = posts.map(post => ({
      id: post._id.toString(),
      title: post.title,
      imageUrl: post.imageUrl,
      author: {
        id: (post.userId as { _id: string; username: string })._id.toString(),
        username: (post.userId as { _id: string; username: string }).username,
      },
      likesCount: post.upvotes.length,
      commentsCount: post.comments.length,
      isPublic: (post.status || 'active') === 'active', // Convert status to isPublic for compatibility
      createdAt: post.createdAt.toISOString(),
    }));

    return NextResponse.json({ posts: formattedPosts });

  } catch (error) {
    console.error('Admin posts fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
