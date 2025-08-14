import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/mongodb';
import Post from '@/models/Post';


interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();

    const { id } = await params;
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // Find the post
    const post = await Post.findById(id)
      .populate('userId', 'username')
      .lean();

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if user has upvoted (if authenticated)
    let hasUpvoted = false;
    if (token && token.type === 'user') {
      hasUpvoted = post.upvotes.includes(token.sub);
    }

    const formattedPost = {
      id: post._id.toString(),
      title: post.title,
      imageUrl: post.imageUrl,
      author: {
        id: (post.userId as { _id: string; username: string })._id.toString(),
        username: (post.userId as { _id: string; username: string }).username,
      },
      upvotesCount: post.upvotes.length,
      commentsCount: post.comments.length,
      hasUpvoted,
      createdAt: post.createdAt.toISOString(),
    };

    return NextResponse.json({ post: formattedPost });

  } catch (error) {
    console.error('Post fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
