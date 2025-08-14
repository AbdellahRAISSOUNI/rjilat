import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/mongodb';
import Post from '@/models/Post';
import Comment from '@/models/Comment';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();

    const { id } = await params;

    // Get all comments for this post
    const comments = await Comment.find({ postId: id })
      .populate('userId', 'username')
      .sort({ createdAt: 1 })
      .lean();

    // Build nested comment structure
    const commentMap = new Map();
    const rootComments: Array<Record<string, unknown>> = [];

    // First pass: create all comment objects
    comments.forEach(comment => {
      const formattedComment = {
        id: comment._id.toString(),
        content: comment.content,
        author: {
          id: (comment.userId as { _id: string; username: string })._id.toString(),
          username: (comment.userId as { _id: string; username: string }).username,
        },
        parentCommentId: comment.parentCommentId?.toString() || null,
        replies: [],
        createdAt: comment.createdAt.toISOString(),
      };
      
      commentMap.set(comment._id.toString(), formattedComment);
      
      if (!comment.parentCommentId) {
        rootComments.push(formattedComment);
      }
    });

    // Second pass: build reply relationships
    comments.forEach(comment => {
      if (comment.parentCommentId) {
        const parentComment = commentMap.get(comment.parentCommentId.toString());
        const childComment = commentMap.get(comment._id.toString());
        if (parentComment && childComment) {
          parentComment.replies.push(childComment);
        }
      }
    });

    return NextResponse.json({ comments: rootComments });

  } catch (error) {
    console.error('Comments fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
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
    const { content, parentCommentId } = await req.json();

    // Validation
    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
    }

    if (content.length > 1000) {
      return NextResponse.json({ error: 'Comment must be less than 1000 characters' }, { status: 400 });
    }

    // Check if post exists
    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // If parentCommentId is provided, verify it exists
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 });
      }
    }

    // Create new comment
    const newComment = new Comment({
      content: content.trim(),
      userId: token.sub,
      postId: id,
      parentCommentId: parentCommentId || null,
    });

    await newComment.save();

    // Update post's comments count (only for root comments to avoid double counting)
    if (!parentCommentId) {
      await Post.findByIdAndUpdate(id, {
        $addToSet: { comments: newComment._id }
      });
    }

    return NextResponse.json(
      {
        message: 'Comment created successfully',
        comment: {
          id: newComment._id.toString(),
          content: newComment.content,
          createdAt: newComment.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Comment creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
