import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Post from '@/models/Post';
import Comment from '@/models/Comment';

interface RouteParams {
  params: {
    userId: string;
  };
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    // Verify admin authentication
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { userId } = params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete all user's posts and their associated comments
    const userPosts = await Post.find({ author: userId }).select('_id');
    const postIds = userPosts.map(post => post._id);

    // Delete all comments on user's posts
    await Comment.deleteMany({ post: { $in: postIds } });

    // Delete all user's comments on other posts
    await Comment.deleteMany({ author: userId });

    // Delete all user's posts
    await Post.deleteMany({ author: userId });

    // Remove user from followers/following lists of other users
    await User.updateMany(
      { followers: userId },
      { $pull: { followers: userId } }
    );
    await User.updateMany(
      { following: userId },
      { $pull: { following: userId } }
    );

    // Remove user's likes from posts
    await Post.updateMany(
      { likes: userId },
      { $pull: { likes: userId } }
    );

    // Remove user's likes from comments
    await Comment.updateMany(
      { likes: userId },
      { $pull: { likes: userId } }
    );

    // Finally, delete the user
    await User.findByIdAndDelete(userId);

    return NextResponse.json({ 
      message: 'User and all associated data deleted successfully' 
    });

  } catch (error) {
    console.error('Admin user deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    // Verify admin authentication
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { userId } = params;

    // Get user details
    const user = await User.findById(userId)
      .populate('followers', 'username')
      .populate('following', 'username')
      .lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's posts and comments
    const [posts, comments] = await Promise.all([
      Post.find({ author: userId })
        .select('title imageUrl createdAt likes comments')
        .sort({ createdAt: -1 })
        .lean(),
      Comment.find({ author: userId })
        .populate('post', 'title')
        .select('content createdAt post likes')
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    const userDetails = {
      id: user._id.toString(),
      username: user.username,
      followers: user.followers,
      following: user.following,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      posts: posts.map(post => ({
        id: post._id.toString(),
        title: post.title,
        imageUrl: post.imageUrl,
        likesCount: post.likes.length,
        commentsCount: post.comments.length,
        createdAt: post.createdAt.toISOString(),
      })),
      comments: comments.map(comment => ({
        id: comment._id.toString(),
        content: comment.content,
        postTitle: (comment.post as { title: string } | null)?.title || 'Deleted Post',
        likesCount: comment.likes.length,
        createdAt: comment.createdAt.toISOString(),
      })),
      stats: {
        totalPosts: posts.length,
        totalComments: comments.length,
        totalLikes: posts.reduce((sum, post) => sum + post.likes.length, 0),
        followersCount: user.followers.length,
        followingCount: user.following.length,
      }
    };

    return NextResponse.json({ user: userDetails });

  } catch (error) {
    console.error('Admin user details error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
