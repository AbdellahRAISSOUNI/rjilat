import { NextRequest, NextResponse } from 'next/server';
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

    // Find the user
    const user = await User.findOne({ username });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's posts
    const posts = await Post.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .lean();

    const formattedPosts = posts.map(post => ({
      id: post._id.toString(),
      title: post.title,
      imageUrl: post.imageUrl,
      upvotesCount: post.upvotes.length,
      commentsCount: post.comments.length,
      createdAt: post.createdAt.toISOString(),
    }));

    return NextResponse.json({ posts: formattedPosts });

  } catch (error) {
    console.error('User posts fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
