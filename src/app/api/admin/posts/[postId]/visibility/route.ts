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
    const { isPublic } = await req.json();

    // Since our current Post model doesn't have isPublic field, 
    // we'll use a status field instead for hiding/showing posts
    const status = isPublic ? 'active' : 'hidden';
    
    // Update post status
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { status },
      { new: true }
    );

    if (!updatedPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Post visibility updated successfully',
      isPublic: updatedPost.status === 'active'
    });

  } catch (error) {
    console.error('Admin post visibility update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
