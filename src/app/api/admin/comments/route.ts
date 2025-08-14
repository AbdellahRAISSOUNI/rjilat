import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/mongodb';
import Comment from '@/models/Comment';

export async function GET(req: NextRequest) {
  try {
    // Verify admin authentication
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get all comments with author and post information
    const comments = await Comment.find({})
      .populate('userId', 'username')
      .populate('postId', 'title')
      .select('content parentCommentId status createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const formattedComments = comments.map(comment => ({
      id: comment._id.toString(),
      content: comment.content,
      author: {
        id: (comment.userId as { _id: string; username: string } | null)?._id.toString(),
        username: (comment.userId as { _id: string; username: string } | null)?.username || 'Deleted User',
      },
      post: {
        id: (comment.postId as { _id: string; title: string } | null)?._id.toString(),
        title: (comment.postId as { _id: string; title: string } | null)?.title || 'Deleted Post',
      },
      likesCount: 0, // Comments don't have likes in current model
      status: comment.status || 'active',
      createdAt: comment.createdAt.toISOString(),
    }));

    return NextResponse.json({ comments: formattedComments });

  } catch (error) {
    console.error('Admin comments fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
