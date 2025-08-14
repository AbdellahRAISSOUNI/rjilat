import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/mongodb';
import Comment from '@/models/Comment';
import Post from '@/models/Post';

interface RouteParams {
  params: Promise<{
    commentId: string;
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

    const { commentId } = await params;

    // Check if comment exists
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Remove comment reference from the post
    await Post.findByIdAndUpdate(
      comment.postId,
      { $pull: { comments: commentId } }
    );

    // Remove replies to this comment (if any)
    await Comment.deleteMany({ parentCommentId: commentId });

    // Delete the comment
    await Comment.findByIdAndDelete(commentId);

    return NextResponse.json({ 
      message: 'Comment deleted successfully' 
    });

  } catch (error) {
    console.error('Admin comment deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
