import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/mongodb';
import Post from '@/models/Post';
import Comment from '@/models/Comment';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    // Verify admin authentication
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { action, postIds } = await req.json();

    if (!action || !Array.isArray(postIds) || postIds.length === 0) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    let result;

    switch (action) {
      case 'delete':
        // Get posts to delete for Cloudinary cleanup
        const postsToDelete = await Post.find({ 
          _id: { $in: postIds } 
        }).select('imagePublicId').lean();

        // Delete from database
        await Comment.deleteMany({ postId: { $in: postIds } });
        await Post.deleteMany({ _id: { $in: postIds } });

        // Delete from Cloudinary
        for (const post of postsToDelete) {
          if (post.imagePublicId) {
            try {
              await cloudinary.uploader.destroy(post.imagePublicId);
            } catch (error) {
              console.error('Failed to delete image from Cloudinary:', error);
            }
          }
        }

        result = { 
          message: `Successfully deleted ${postIds.length} posts and their comments`,
          deletedCount: postIds.length
        };
        break;

      case 'hide':
        await Post.updateMany(
          { _id: { $in: postIds } },
          { $set: { status: 'hidden' } }
        );
        result = { 
          message: `Successfully hid ${postIds.length} posts`,
          updatedCount: postIds.length
        };
        break;

      case 'show':
        await Post.updateMany(
          { _id: { $in: postIds } },
          { $set: { status: 'active' } }
        );
        result = { 
          message: `Successfully showed ${postIds.length} posts`,
          updatedCount: postIds.length
        };
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Log admin action
    console.log(`Admin ${token.sub} performed bulk ${action} on ${postIds.length} posts`);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Bulk posts action error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
