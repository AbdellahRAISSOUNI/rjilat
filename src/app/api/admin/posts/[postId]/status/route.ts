import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/mongodb';
import Post from '@/models/Post';

interface RouteParams {
  params: Promise<{
    postId: string;
  }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    // Verify admin authentication
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { postId } = await params;
    const { status } = await req.json();

    if (!['active', 'hidden', 'reported'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Update post status (add status field to schema if needed)
    post.status = status;
    await post.save();

    // Log admin action
    console.log(`Admin ${token.sub} changed post ${postId} status to ${status}`);

    return NextResponse.json({ 
      message: 'Post status updated successfully',
      status: post.status
    });

  } catch (error) {
    console.error('Post status update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
