import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/mongodb';
import Post from '@/models/Post';
import Comment from '@/models/Comment';

interface RouteParams {
  params: Promise<{
    postId: string;
  }>;
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    // Verify admin authentication
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { postId } = await params;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Delete all comments associated with this post
    await Comment.deleteMany({ postId: postId });

    // Remove post from users' liked posts
    // (This would be handled if we had a separate likes collection)

    // Delete the post
    await Post.findByIdAndDelete(postId);

    return NextResponse.json({ 
      message: 'Post and all associated comments deleted successfully' 
    });

  } catch (error) {
    console.error('Admin post deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
