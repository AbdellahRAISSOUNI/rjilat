import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/mongodb';
import Comment from '@/models/Comment';

interface RouteParams {
  params: Promise<{
    commentId: string;
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

    const { commentId } = await params;
    const { status } = await req.json();

    if (!['active', 'hidden', 'reported'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Update comment status
    comment.status = status;
    await comment.save();

    // Log admin action
    console.log(`Admin ${token.sub} changed comment ${commentId} status to ${status}`);

    return NextResponse.json({ 
      message: 'Comment status updated successfully',
      status: comment.status
    });

  } catch (error) {
    console.error('Comment status update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
