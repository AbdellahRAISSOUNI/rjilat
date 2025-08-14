import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Post from '@/models/Post';

export async function GET(req: NextRequest) {
  try {
    // Verify user authentication
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.type !== 'user') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get current user's following list
    const currentUser = await User.findById(token.sub);
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If user is not following anyone, return empty array
    if (currentUser.following.length === 0) {
      return NextResponse.json({ 
        posts: [],
        message: 'You are not following anyone yet. Discover users to follow!'
      });
    }

    // Get posts from followed users using aggregation
    const posts = await Post.aggregate([
      {
        $match: {
          userId: { $in: currentUser.following }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'author'
        }
      },
      { $unwind: '$author' },
      {
        $addFields: {
          upvotesCount: { $size: '$upvotes' },
          commentsCount: { $size: '$comments' },
          hasUpvoted: { 
            $in: [{ $toObjectId: token.sub }, '$upvotes'] 
          }
        }
      },
      { $sort: { createdAt: -1 } },
      { $limit: 50 } // Limit to latest 50 posts
    ]);

    // Format response
    const formattedPosts = posts.map(post => ({
      id: post._id.toString(),
      title: post.title,
      imageUrl: post.imageUrl,
      author: {
        id: post.author._id.toString(),
        username: post.author.username,
      },
      upvotesCount: post.upvotesCount,
      commentsCount: post.commentsCount,
      hasUpvoted: post.hasUpvoted,
      createdAt: post.createdAt.toISOString(),
    }));

    return NextResponse.json({ posts: formattedPosts });

  } catch (error) {
    console.error('Following posts fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
