import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/mongodb';
import Post from '@/models/Post';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    // Verify user authentication
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.type !== 'user') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;
    const userId = token.sub;

    // Find the post
    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Prevent users from upvoting their own posts
    if (post.userId.toString() === userId) {
      return NextResponse.json({ error: 'Cannot upvote your own post' }, { status: 400 });
    }

    // Check if user has already upvoted
    const hasUpvoted = post.upvotes.includes(userId);

    if (hasUpvoted) {
      // Remove upvote
      post.upvotes = post.upvotes.filter(id => id.toString() !== userId);
    } else {
      // Add upvote
      post.upvotes.push(userId);
    }

    await post.save();

    return NextResponse.json({
      upvotesCount: post.upvotes.length,
      hasUpvoted: !hasUpvoted,
    });

  } catch (error) {
    console.error('Upvote error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
