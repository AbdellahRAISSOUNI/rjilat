import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/mongodb';
import Comment from '@/models/Comment';

export async function POST(req: NextRequest) {
  try {
    // Verify admin authentication
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { action, commentIds } = await req.json();

    if (!action || !Array.isArray(commentIds) || commentIds.length === 0) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    let result;

    switch (action) {
      case 'delete':
        // Delete comments and their replies recursively
        await deleteCommentsRecursively(commentIds);
        result = { 
          message: `Successfully deleted ${commentIds.length} comments and their replies`,
          deletedCount: commentIds.length
        };
        break;

      case 'hide':
        await Comment.updateMany(
          { _id: { $in: commentIds } },
          { $set: { status: 'hidden' } }
        );
        result = { 
          message: `Successfully hid ${commentIds.length} comments`,
          updatedCount: commentIds.length
        };
        break;

      case 'show':
        await Comment.updateMany(
          { _id: { $in: commentIds } },
          { $set: { status: 'active' } }
        );
        result = { 
          message: `Successfully showed ${commentIds.length} comments`,
          updatedCount: commentIds.length
        };
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Log admin action
    console.log(`Admin ${token.sub} performed bulk ${action} on ${commentIds.length} comments`);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Bulk comments action error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to delete comments and their replies recursively
async function deleteCommentsRecursively(commentIds: string[]) {
  // Find all child comments (replies)
  const childComments = await Comment.find({ 
    parentCommentId: { $in: commentIds } 
  }).select('_id').lean();

  const childIds = childComments.map(c => c._id.toString());

  // If there are child comments, recursively delete them
  if (childIds.length > 0) {
    await deleteCommentsRecursively(childIds);
  }

  // Delete the original comments
  await Comment.deleteMany({ _id: { $in: commentIds } });
}
